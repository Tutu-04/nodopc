import pool from '../db.js';

const COLUMNAS = 'id, nombre, email, rol, creado_en';

export async function obtenerTodos() {
  const [filas] = await pool.execute(`SELECT ${COLUMNAS} FROM usuarios ORDER BY id`);
  return filas;
}

export async function obtenerPorId(id) {
  const [filas] = await pool.execute(`SELECT ${COLUMNAS} FROM usuarios WHERE id = ?`, [id]);
  return filas[0];
}

export async function obtenerPorEmail(email) {
  const [filas] = await pool.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
  return filas[0];
}

export async function obtenerHashPassword(id) {
  const [filas] = await pool.execute('SELECT password FROM usuarios WHERE id = ?', [id]);
  return filas[0]?.password;
}

export async function actualizarDatosPersonales(id, { nombre, email }) {
  await pool.execute('UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?', [nombre, email, id]);
}

export async function crear({ nombre, email, password, rol }) {
  const [resultado] = await pool.execute('INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)', [
    nombre,
    email,
    password,
    rol,
  ]);
  return resultado.insertId;
}

export async function actualizar(id, { nombre, email, rol }) {
  await pool.execute('UPDATE usuarios SET nombre = ?, email = ?, rol = ? WHERE id = ?', [nombre, email, rol, id]);
}

export async function actualizarPassword(id, passwordHasheada) {
  await pool.execute('UPDATE usuarios SET password = ? WHERE id = ?', [passwordHasheada, id]);
}

export async function eliminar(id) {
  const [resultado] = await pool.execute('DELETE FROM usuarios WHERE id = ?', [id]);
  return resultado.affectedRows;
}

export async function contarPedidos(id) {
  const [filas] = await pool.execute('SELECT COUNT(*) AS cantidad FROM pedidos WHERE usuario_id = ?', [id]);
  return filas[0].cantidad;
}
