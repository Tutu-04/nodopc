import pool from '../db.js';

export async function obtenerOpciones() {
  const [filas] = await pool.execute(
    `SELECT p.id, p.nombre, p.precio, p.stock, p.imagen_url, p.especificaciones, m.nombre AS marca, c.componente
     FROM productos p
     JOIN categorias c ON c.id = p.categoria_id
     JOIN marcas m ON m.id = p.marca_id
     WHERE c.componente IS NOT NULL
     ORDER BY p.precio, p.id`
  );
  return filas;
}
