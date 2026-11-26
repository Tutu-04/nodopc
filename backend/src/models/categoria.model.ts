import type { ResultSetHeader } from 'mysql2';
import pool from '../db.js';
import type { Categoria, Fila } from '../tipos.js';

export interface DatosDeCategoria {
  nombre: string;
  descripcion: string | null;
}

export async function obtenerTodas(): Promise<Categoria[]> {
  const [filas] = await pool.execute<Fila<Categoria>[]>(
    `SELECT c.*, COUNT(p.id) AS cantidad_productos
     FROM categorias c
     LEFT JOIN productos p ON p.categoria_id = c.id
     GROUP BY c.id
     ORDER BY c.nombre`
  );
  return filas;
}

export async function obtenerPorId(id: number): Promise<Categoria | undefined> {
  const [filas] = await pool.execute<Fila<Categoria>[]>('SELECT * FROM categorias WHERE id = ?', [id]);
  return filas[0];
}

export async function crear({ nombre, descripcion }: DatosDeCategoria): Promise<number> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)',
    [nombre, descripcion]
  );
  return resultado.insertId;
}

export async function actualizar(id: number, { nombre, descripcion }: DatosDeCategoria): Promise<void> {
  await pool.execute('UPDATE categorias SET nombre = ?, descripcion = ? WHERE id = ?', [nombre, descripcion, id]);
}

export async function eliminar(id: number): Promise<number> {
  const [resultado] = await pool.execute<ResultSetHeader>('DELETE FROM categorias WHERE id = ?', [id]);
  return resultado.affectedRows;
}

export async function contarProductos(id: number): Promise<number> {
  const [filas] = await pool.execute<Fila<{ cantidad: number }>[]>(
    'SELECT COUNT(*) AS cantidad FROM productos WHERE categoria_id = ?',
    [id]
  );
  return filas[0].cantidad;
}
