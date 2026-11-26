import pool from '../db.js';

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

export async function crear(usuarioId, direccionEnvio, items) {
  const conexion = await pool.getConnection();

  try {
    await conexion.beginTransaction();

    let total = 0;
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

      total += producto.precio * item.cantidad;
      renglones.push({
        producto_id: producto.id,
        producto_nombre: producto.nombre,
        cantidad: item.cantidad,
        precio_unitario: producto.precio,
      });
    }

    const [resultado] = await conexion.execute(
      'INSERT INTO pedidos (usuario_id, direccion_envio, total) VALUES (?, ?, ?)',
      [usuarioId, direccionEnvio, total]
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

export async function actualizar(id, { estado, direccion_envio }) {
  await pool.execute('UPDATE pedidos SET estado = ?, direccion_envio = ? WHERE id = ?', [estado, direccion_envio, id]);
}

export async function eliminar(id) {
  const conexion = await pool.getConnection();

  try {
    await conexion.beginTransaction();

    const [items] = await conexion.execute(
      'SELECT producto_id, cantidad FROM detalle_pedido WHERE pedido_id = ? AND producto_id IS NOT NULL',
      [id]
    );
    for (const item of items) {
      await conexion.execute('UPDATE productos SET stock = stock + ? WHERE id = ?', [item.cantidad, item.producto_id]);
    }

    await conexion.execute('DELETE FROM pedidos WHERE id = ?', [id]);

    await conexion.commit();
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }
}
