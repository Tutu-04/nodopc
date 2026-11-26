import pool from '../db.js';

export async function obtenerTodas() {
  const [filas] = await pool.execute(
    `SELECT c.*, COUNT(p.id) AS cantidad_productos
     FROM categorias c
     LEFT JOIN productos p ON p.categoria_id = c.id
     GROUP BY c.id
     ORDER BY c.nombre`
  );
  return filas;
}

export async function obtenerPorId(id) {
  const [filas] = await pool.execute('SELECT * FROM categorias WHERE id = ?', [id]);
  return filas[0];
}

export async function crear({ nombre, descripcion }) {
  const [resultado] = await pool.execute('INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)', [
    nombre,
    descripcion,
  ]);
  return resultado.insertId;
}

export async function actualizar(id, { nombre, descripcion }) {
  await pool.execute('UPDATE categorias SET nombre = ?, descripcion = ? WHERE id = ?', [nombre, descripcion, id]);
}

export async function eliminar(id) {
  const [resultado] = await pool.execute('DELETE FROM categorias WHERE id = ?', [id]);
  return resultado.affectedRows;
}

export async function contarProductos(id) {
  const [filas] = await pool.execute('SELECT COUNT(*) AS cantidad FROM productos WHERE categoria_id = ?', [id]);
  return filas[0].cantidad;
}
