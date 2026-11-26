import pool from '../db.js';

export async function obtenerTodas() {
  const [filas] = await pool.execute('SELECT * FROM marcas ORDER BY nombre');
  return filas;
}

export async function obtenerPorId(id) {
  const [filas] = await pool.execute('SELECT * FROM marcas WHERE id = ?', [id]);
  return filas[0];
}

export async function crear({ nombre, pais }) {
  const [resultado] = await pool.execute('INSERT INTO marcas (nombre, pais) VALUES (?, ?)', [nombre, pais]);
  return resultado.insertId;
}

export async function actualizar(id, { nombre, pais }) {
  await pool.execute('UPDATE marcas SET nombre = ?, pais = ? WHERE id = ?', [nombre, pais, id]);
}

export async function eliminar(id) {
  const [resultado] = await pool.execute('DELETE FROM marcas WHERE id = ?', [id]);
  return resultado.affectedRows;
}

export async function contarProductos(id) {
  const [filas] = await pool.execute('SELECT COUNT(*) AS cantidad FROM productos WHERE marca_id = ?', [id]);
  return filas[0].cantidad;
}
