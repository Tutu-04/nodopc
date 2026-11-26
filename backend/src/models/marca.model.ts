import type { ResultSetHeader } from 'mysql2';
import pool from '../db.js';
import type { Fila, Marca } from '../tipos.js';

export interface DatosDeMarca {
  nombre: string;
  pais: string | null;
}

export async function obtenerTodas(): Promise<Marca[]> {
  const [filas] = await pool.execute<Fila<Marca>[]>('SELECT * FROM marcas ORDER BY nombre');
  return filas;
}

export async function obtenerPorId(id: number): Promise<Marca | undefined> {
  const [filas] = await pool.execute<Fila<Marca>[]>('SELECT * FROM marcas WHERE id = ?', [id]);
  return filas[0];
}

export async function crear({ nombre, pais }: DatosDeMarca): Promise<number> {
  const [resultado] = await pool.execute<ResultSetHeader>('INSERT INTO marcas (nombre, pais) VALUES (?, ?)', [
    nombre,
    pais,
  ]);
  return resultado.insertId;
}

export async function actualizar(id: number, { nombre, pais }: DatosDeMarca): Promise<void> {
  await pool.execute('UPDATE marcas SET nombre = ?, pais = ? WHERE id = ?', [nombre, pais, id]);
}

export async function eliminar(id: number): Promise<number> {
  const [resultado] = await pool.execute<ResultSetHeader>('DELETE FROM marcas WHERE id = ?', [id]);
  return resultado.affectedRows;
}

export async function contarProductos(id: number): Promise<number> {
  const [filas] = await pool.execute<Fila<{ cantidad: number }>[]>(
    'SELECT COUNT(*) AS cantidad FROM productos WHERE marca_id = ?',
    [id]
  );
  return filas[0].cantidad;
}
