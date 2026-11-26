import pool from '../db.js';

const SELECT_PRODUCTOS = `
  SELECT p.*, c.nombre AS categoria, m.nombre AS marca
  FROM productos p
  JOIN categorias c ON c.id = p.categoria_id
  JOIN marcas m ON m.id = p.marca_id
`;

export async function obtenerTodos({ categoria, marca, buscar }) {
  const condiciones = [];
  const valores = [];

  if (categoria) {
    condiciones.push('p.categoria_id = ?');
    valores.push(categoria);
  }
  if (marca) {
    condiciones.push('p.marca_id = ?');
    valores.push(marca);
  }
  if (buscar) {
    const palabras = buscar.trim().split(/\s+/).filter(Boolean).slice(0, 6);

    for (const palabra of palabras) {
      condiciones.push('(p.nombre LIKE ? OR p.descripcion LIKE ? OR c.nombre LIKE ? OR m.nombre LIKE ?)');
      const patron = `%${palabra}%`;
      valores.push(patron, patron, patron, patron);
    }
  }

  let sql = SELECT_PRODUCTOS;
  if (condiciones.length > 0) {
    sql += ' WHERE ' + condiciones.join(' AND ');
  }
  sql += ' ORDER BY p.id DESC';

  const [filas] = await pool.execute(sql, valores);
  return filas;
}

export async function obtenerPorId(id) {
  const [filas] = await pool.execute(SELECT_PRODUCTOS + ' WHERE p.id = ?', [id]);
  return filas[0];
}

export async function crear({ nombre, descripcion, precio, stock, imagen_url, categoria_id, marca_id }) {
  const [resultado] = await pool.execute(
    `INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url, categoria_id, marca_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [nombre, descripcion, precio, stock, imagen_url, categoria_id, marca_id]
  );
  return resultado.insertId;
}

export async function actualizar(id, { nombre, descripcion, precio, stock, imagen_url, categoria_id, marca_id }) {
  await pool.execute(
    `UPDATE productos
     SET nombre = ?, descripcion = ?, precio = ?, stock = ?, imagen_url = ?, categoria_id = ?, marca_id = ?
     WHERE id = ?`,
    [nombre, descripcion, precio, stock, imagen_url, categoria_id, marca_id, id]
  );
}

export async function eliminar(id) {
  const [resultado] = await pool.execute('DELETE FROM productos WHERE id = ?', [id]);
  return resultado.affectedRows;
}

export async function obtenerMasVendidos() {
  const [filas] = await pool.execute(
    `SELECT p.id, p.nombre, p.precio, p.stock, p.imagen_url, c.nombre AS categoria,
            SUM(d.cantidad) AS vendidos
     FROM detalle_pedido d
     JOIN productos p ON p.id = d.producto_id
     JOIN categorias c ON c.id = p.categoria_id
     GROUP BY p.id, p.nombre, p.precio, p.stock, p.imagen_url, c.nombre
     ORDER BY vendidos DESC, p.nombre ASC
     LIMIT 3`
  );
  return filas;
}
