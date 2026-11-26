import pool from '../db.js';
import type { Componente, Especificaciones, Fila } from '../tipos.js';

export interface OpcionDelArmador {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  imagen_url: string | null;
  especificaciones: Especificaciones | null;
  marca: string;
  componente: Componente;
}

export async function obtenerOpciones(): Promise<OpcionDelArmador[]> {
  const [filas] = await pool.execute<Fila<OpcionDelArmador>[]>(
    `SELECT p.id, p.nombre, p.precio, p.stock, p.imagen_url, p.especificaciones, m.nombre AS marca, c.componente
     FROM productos p
     JOIN categorias c ON c.id = p.categoria_id
     JOIN marcas m ON m.id = p.marca_id
     WHERE c.componente IS NOT NULL
     ORDER BY p.precio, p.id`
  );
  return filas;
}
