import pool from '../db.js';
import { calcularCostoDeEnvio } from '../utils/envios.js';

function crearError(status, mensaje) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

const SELECT_PEDIDOS = `
  SELECT p.*, u.nombre AS cliente, u.email AS cliente_email
  FROM pedidos p
  JOIN usuarios u ON u.id = p.usuario_id
`;

export async function obtenerTodos() {
  const [filas] = await pool.execute(SELECT_PEDIDOS + ' ORDER BY p.fecha DESC, p.id DESC');
  return filas;
}

export async function obtenerPorUsuario(usuarioId) {
  const [filas] = await pool.execute(SELECT_PEDIDOS + ' WHERE p.usuario_id = ? ORDER BY p.fecha DESC, p.id DESC', [
    usuarioId,
  ]);
  return filas;
}

export async function obtenerPorId(id) {
  const [filas] = await pool.execute(SELECT_PEDIDOS + ' WHERE p.id = ?', [id]);
  const pedido = filas[0];
  if (!pedido) return undefined;

  const [items] = await pool.execute(
    `SELECT d.*, d.producto_nombre AS producto
     FROM detalle_pedido d
     WHERE d.pedido_id = ?`,
    [id]
  );
  pedido.items = items;
  return pedido;
}

export async function crear(usuarioId, { metodoEntrega, provincia, direccionEnvio, items, minutosParaPagar }) {
  const conexion = await pool.getConnection();

  try {
    await conexion.beginTransaction();

    let subtotal = 0;
    const renglones = [];

    for (const item of items) {
      const [filas] = await conexion.execute(
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

    const [resultado] = await conexion.execute(
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

export async function actualizar(id, { estado, direccionEnvio }) {
  await pool.execute(
    `UPDATE pedidos
     SET estado = ?, direccion_envio = ?, pagado_en = IF(? = 'pagado' AND pagado_en IS NULL, NOW(), pagado_en)
     WHERE id = ?`,
    [estado, direccionEnvio, estado, id]
  );
}

export async function cancelar(id, estadosCancelables = ['pendiente', 'pagado']) {
  const conexion = await pool.getConnection();

  try {
    await conexion.beginTransaction();

    const [filas] = await conexion.execute('SELECT estado FROM pedidos WHERE id = ? FOR UPDATE', [id]);
    if (!estadosCancelables.includes(filas[0]?.estado)) {
      await conexion.rollback();
      return false;
    }

    const [items] = await conexion.execute(
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

export async function eliminar(id) {
  await pool.execute('DELETE FROM pedidos WHERE id = ?', [id]);
}

export async function cancelarVencidos() {
  const [filas] = await pool.execute(
    "SELECT id FROM pedidos WHERE estado = 'pendiente' AND vence_en IS NOT NULL AND vence_en < NOW()"
  );

  let cancelados = 0;
  for (const fila of filas) {
    if (await cancelar(fila.id, ['pendiente'])) cancelados++;
  }
  return cancelados;
}
