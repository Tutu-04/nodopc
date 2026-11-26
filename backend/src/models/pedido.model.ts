import type { ResultSetHeader } from 'mysql2';
import pool from '../db.js';
import { calcularCostoDeEnvio } from '../utils/envios.js';
import type {
  ErrorConStatus,
  EstadoPedido,
  Fila,
  ItemPedido,
  MedioDePago,
  MetodoEntrega,
  Pedido,
  PedidoConItems,
} from '../tipos.js';

export interface ItemNuevo {
  producto_id: number;
  cantidad: number;
}

export interface DatosDePedido {
  metodoEntrega: MetodoEntrega;
  provincia: string | null;
  direccionEnvio: string | null;
  items: ItemNuevo[];
  minutosParaPagar: number;
}

function crearError(status: number, mensaje: string): ErrorConStatus {
  const error: ErrorConStatus = new Error(mensaje);
  error.status = status;
  return error;
}

const SELECT_PEDIDOS = `
  SELECT p.*, u.nombre AS cliente, u.email AS cliente_email,
         IF(p.estado = 'pendiente' AND p.vence_en IS NOT NULL,
            GREATEST(TIMESTAMPDIFF(SECOND, NOW(), p.vence_en), 0),
            NULL) AS segundos_para_pagar
  FROM pedidos p
  JOIN usuarios u ON u.id = p.usuario_id
`;

export async function obtenerTodos(): Promise<Pedido[]> {
  const [filas] = await pool.execute<Fila<Pedido>[]>(SELECT_PEDIDOS + ' ORDER BY p.fecha DESC, p.id DESC');
  return filas;
}

export async function obtenerPorUsuario(usuarioId: number): Promise<Pedido[]> {
  const [filas] = await pool.execute<Fila<Pedido>[]>(
    SELECT_PEDIDOS + ' WHERE p.usuario_id = ? ORDER BY p.fecha DESC, p.id DESC',
    [usuarioId]
  );
  return filas;
}

export async function obtenerPorId(id: number): Promise<PedidoConItems | undefined> {
  const [filas] = await pool.execute<Fila<Pedido>[]>(SELECT_PEDIDOS + ' WHERE p.id = ?', [id]);
  const pedido = filas[0];
  if (!pedido) return undefined;

  const [items] = await pool.execute<Fila<ItemPedido>[]>(
    `SELECT d.*, d.producto_nombre AS producto
     FROM detalle_pedido d
     WHERE d.pedido_id = ?`,
    [id]
  );
  return { ...pedido, items };
}

export async function crear(
  usuarioId: number,
  { metodoEntrega, provincia, direccionEnvio, items, minutosParaPagar }: DatosDePedido
): Promise<number> {
  const conexion = await pool.getConnection();

  try {
    await conexion.beginTransaction();

    let subtotal = 0;
    const renglones: Omit<ItemPedido, 'id' | 'pedido_id' | 'producto'>[] = [];

    for (const item of items) {
      const [filas] = await conexion.execute<Fila<{ id: number; nombre: string; precio: number; stock: number }>[]>(
        'SELECT id, nombre, precio, stock FROM productos WHERE id = ? FOR UPDATE',
        [item.producto_id]
      );
      const producto = filas[0];

      if (!producto) {
        throw crearError(400, `El producto con id ${item.producto_id} no existe`);
      }
      if (producto.stock < item.cantidad) {
        throw crearError(409, `No hay stock suficiente de "${producto.nombre}" (quedan ${producto.stock})`);
      }

      subtotal += producto.precio * item.cantidad;
      renglones.push({
        producto_id: producto.id,
        producto_nombre: producto.nombre,
        cantidad: item.cantidad,
        precio_unitario: producto.precio,
      });
    }

    const costoEnvio = calcularCostoDeEnvio({ metodo: metodoEntrega, provincia, subtotal });

    const [resultado] = await conexion.execute<ResultSetHeader>(
      `INSERT INTO pedidos (usuario_id, metodo_entrega, provincia, direccion_envio, costo_envio, total, vence_en)
       VALUES (?, ?, ?, ?, ?, ?, NOW() + INTERVAL ? MINUTE)`,
      [usuarioId, metodoEntrega, provincia, direccionEnvio, costoEnvio, subtotal + costoEnvio, minutosParaPagar]
    );
    const pedidoId = resultado.insertId;

    for (const renglon of renglones) {
      await conexion.execute(
        'INSERT INTO detalle_pedido (pedido_id, producto_id, producto_nombre, cantidad, precio_unitario) VALUES (?, ?, ?, ?, ?)',
        [pedidoId, renglon.producto_id, renglon.producto_nombre, renglon.cantidad, renglon.precio_unitario]
      );
      await conexion.execute('UPDATE productos SET stock = stock - ? WHERE id = ?', [
        renglon.cantidad,
        renglon.producto_id,
      ]);
    }

    await conexion.commit();
    return pedidoId;
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }
}

export async function actualizar(
  id: number,
  { estado, direccionEnvio }: { estado: EstadoPedido; direccionEnvio: string | null }
): Promise<void> {
  await pool.execute(
    `UPDATE pedidos
     SET estado = ?, direccion_envio = ?, pagado_en = IF(? = 'pagado' AND pagado_en IS NULL, NOW(), pagado_en)
     WHERE id = ?`,
    [estado, direccionEnvio, estado, id]
  );
}

export async function cancelar(
  id: number,
  estadosCancelables: EstadoPedido[] = ['pendiente', 'pagado']
): Promise<boolean> {
  const conexion = await pool.getConnection();

  try {
    await conexion.beginTransaction();

    const [filas] = await conexion.execute<Fila<{ estado: EstadoPedido }>[]>(
      'SELECT estado FROM pedidos WHERE id = ? FOR UPDATE',
      [id]
    );
    const estado = filas[0]?.estado;
    if (!estado || !estadosCancelables.includes(estado)) {
      await conexion.rollback();
      return false;
    }

    const [items] = await conexion.execute<Fila<{ producto_id: number; cantidad: number }>[]>(
      'SELECT producto_id, cantidad FROM detalle_pedido WHERE pedido_id = ? AND producto_id IS NOT NULL',
      [id]
    );
    for (const item of items) {
      await conexion.execute('UPDATE productos SET stock = stock + ? WHERE id = ?', [item.cantidad, item.producto_id]);
    }
    await conexion.execute("UPDATE pedidos SET estado = 'cancelado', vence_en = NULL WHERE id = ?", [id]);

    await conexion.commit();
    return true;
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }
}

export async function eliminar(id: number): Promise<void> {
  await pool.execute('DELETE FROM pedidos WHERE id = ?', [id]);
}

export async function cancelarVencidos(): Promise<number[]> {
  const [filas] = await pool.execute<Fila<{ id: number }>[]>(
    "SELECT id FROM pedidos WHERE estado = 'pendiente' AND vence_en IS NOT NULL AND vence_en < NOW()"
  );

  const cancelados: number[] = [];
  for (const fila of filas) {
    if (await cancelar(fila.id, ['pendiente'])) cancelados.push(fila.id);
  }
  return cancelados;
}

export async function marcarPagado(
  id: number,
  { medio, pagoId }: { medio: MedioDePago; pagoId: string }
): Promise<boolean> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    `UPDATE pedidos SET estado = 'pagado', medio_pago = ?, pago_id = ?, pagado_en = NOW(), vence_en = NULL
     WHERE id = ? AND estado = 'pendiente'`,
    [medio, pagoId, id]
  );
  return resultado.affectedRows === 1;
}

export async function elegirMedioDePago(id: number, medio: MedioDePago): Promise<void> {
  await pool.execute("UPDATE pedidos SET medio_pago = ? WHERE id = ? AND estado = 'pendiente'", [medio, id]);
}
