import type { ResultSetHeader } from 'mysql2';
import pool from '../db.js';
import type { Fila, Rol, Usuario, UsuarioConPassword } from '../tipos.js';

const COLUMNAS = 'id, nombre, email, rol, creado_en';

export interface DatosDeUsuario {
  nombre: string;
  email: string;
  rol: Rol;
}

export async function obtenerTodos(): Promise<Usuario[]> {
  const [filas] = await pool.execute<Fila<Usuario>[]>(`SELECT ${COLUMNAS} FROM usuarios ORDER BY id`);
  return filas;
}

export async function obtenerPorId(id: number): Promise<Usuario | undefined> {
  const [filas] = await pool.execute<Fila<Usuario>[]>(`SELECT ${COLUMNAS} FROM usuarios WHERE id = ?`, [id]);
  return filas[0];
}

export async function obtenerPorEmail(email: string): Promise<UsuarioConPassword | undefined> {
  const [filas] = await pool.execute<Fila<UsuarioConPassword>[]>('SELECT * FROM usuarios WHERE email = ?', [email]);
  return filas[0];
}

export async function obtenerHashPassword(id: number): Promise<string | undefined> {
  const [filas] = await pool.execute<Fila<{ password: string }>[]>('SELECT password FROM usuarios WHERE id = ?', [id]);
  return filas[0]?.password;
}

export async function actualizarDatosPersonales(
  id: number,
  { nombre, email }: Pick<DatosDeUsuario, 'nombre' | 'email'>
): Promise<void> {
  await pool.execute('UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?', [nombre, email, id]);
}

export async function crear({ nombre, email, password, rol }: DatosDeUsuario & { password: string }): Promise<number> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
    [nombre, email, password, rol]
  );
  return resultado.insertId;
}

export async function actualizar(id: number, { nombre, email, rol }: DatosDeUsuario): Promise<void> {
  await pool.execute('UPDATE usuarios SET nombre = ?, email = ?, rol = ? WHERE id = ?', [nombre, email, rol, id]);
}

export async function actualizarPassword(id: number, passwordHasheada: string): Promise<void> {
  await pool.execute('UPDATE usuarios SET password = ? WHERE id = ?', [passwordHasheada, id]);
}

export async function eliminar(id: number): Promise<number> {
  const [resultado] = await pool.execute<ResultSetHeader>('DELETE FROM usuarios WHERE id = ?', [id]);
  return resultado.affectedRows;
}

export async function contarPedidos(id: number): Promise<number> {
  const [filas] = await pool.execute<Fila<{ cantidad: number }>[]>(
    'SELECT COUNT(*) AS cantidad FROM pedidos WHERE usuario_id = ?',
    [id]
  );
  return filas[0].cantidad;
}
