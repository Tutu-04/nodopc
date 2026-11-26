import type { ResultSetHeader } from 'mysql2';
import pool from '../db.js';
import type { Especificaciones, Fila, Producto } from '../tipos.js';

const SELECT_PRODUCTOS = `
  SELECT p.*, c.nombre AS categoria, c.componente, m.nombre AS marca
  FROM productos p
  JOIN categorias c ON c.id = p.categoria_id
  JOIN marcas m ON m.id = p.marca_id
`;

const ORDENES: Record<string, string> = {
  recientes: 'p.id DESC',
  precio_asc: 'p.precio ASC, p.id DESC',
  precio_desc: 'p.precio DESC, p.id DESC',
  nombre: 'p.nombre ASC, p.id DESC',
};

export const ORDENES_VALIDOS = Object.keys(ORDENES);

export interface FiltrosDeProductos {
  categoria?: number;
  marca?: number;
  buscar?: string;
  ids?: number[];
  conStock?: boolean;
  precioMin?: number;
  precioMax?: number;
}

export interface Busqueda extends FiltrosDeProductos {
  orden?: string;
  pagina?: number;
  porPagina?: number;
}

export interface DatosDeProducto {
  nombre: string;
  descripcion: string | null;
  especificaciones: Especificaciones | null;
  precio: number;
  stock: number;
  imagen_url: string | null;
  categoria_id: number;
  marca_id: number;
}

export interface ProductoMasVendido {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  imagen_url: string | null;
  categoria: string;
  vendidos: number;
}

function armarFiltros({ categoria, marca, buscar, ids, conStock, precioMin, precioMax }: FiltrosDeProductos): {
  where: string;
  valores: (string | number)[];
} {
  const condiciones: string[] = [];
  const valores: (string | number)[] = [];

  if (categoria) {
    condiciones.push('p.categoria_id = ?');
    valores.push(categoria);
  }
  if (marca) {
    condiciones.push('p.marca_id = ?');
    valores.push(marca);
  }
  if (ids?.length) {
    condiciones.push(`p.id IN (${ids.map(() => '?').join(', ')})`);
    valores.push(...ids);
  }
  if (conStock) {
    condiciones.push('p.stock > 0');
  }
  if (precioMin !== undefined) {
    condiciones.push('p.precio >= ?');
    valores.push(precioMin);
  }
  if (precioMax !== undefined) {
    condiciones.push('p.precio <= ?');
    valores.push(precioMax);
  }
  if (buscar) {
    const palabras = buscar.trim().split(/\s+/).filter(Boolean).slice(0, 6);

    for (const palabra of palabras) {
      condiciones.push('(p.nombre LIKE ? OR p.descripcion LIKE ? OR c.nombre LIKE ? OR m.nombre LIKE ?)');
      const patron = `%${palabra}%`;
      valores.push(patron, patron, patron, patron);
    }
  }

  const where = condiciones.length > 0 ? ' WHERE ' + condiciones.join(' AND ') : '';
  return { where, valores };
}

export async function buscar({
  orden = 'recientes',
  pagina = 1,
  porPagina = 12,
  ...filtros
}: Busqueda): Promise<{ productos: Producto[]; total: number }> {
  const { where, valores } = armarFiltros(filtros);

  const [[{ total }]] = await pool.query<Fila<{ total: number }>[]>(
    `SELECT COUNT(*) AS total
     FROM productos p
     JOIN categorias c ON c.id = p.categoria_id
     JOIN marcas m ON m.id = p.marca_id${where}`,
    valores
  );

  const [productos] = await pool.query<Fila<Producto>[]>(
    `${SELECT_PRODUCTOS}${where} ORDER BY ${ORDENES[orden]} LIMIT ? OFFSET ?`,
    [...valores, porPagina, (pagina - 1) * porPagina]
  );

  return { productos, total };
}

export async function obtenerPorId(id: number): Promise<Producto | undefined> {
  const [filas] = await pool.execute<Fila<Producto>[]>(SELECT_PRODUCTOS + ' WHERE p.id = ?', [id]);
  return filas[0];
}

function aJson(especificaciones: Especificaciones | null): string | null {
  return especificaciones ? JSON.stringify(especificaciones) : null;
}

export async function crear({
  nombre,
  descripcion,
  especificaciones,
  precio,
  stock,
  imagen_url,
  categoria_id,
  marca_id,
}: DatosDeProducto): Promise<number> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    `INSERT INTO productos (nombre, descripcion, especificaciones, precio, stock, imagen_url, categoria_id, marca_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [nombre, descripcion, aJson(especificaciones), precio, stock, imagen_url, categoria_id, marca_id]
  );
  return resultado.insertId;
}

export async function actualizar(
  id: number,
  { nombre, descripcion, especificaciones, precio, stock, imagen_url, categoria_id, marca_id }: DatosDeProducto
): Promise<void> {
  await pool.execute(
    `UPDATE productos
     SET nombre = ?, descripcion = ?, especificaciones = ?, precio = ?, stock = ?, imagen_url = ?,
         categoria_id = ?, marca_id = ?
     WHERE id = ?`,
    [nombre, descripcion, aJson(especificaciones), precio, stock, imagen_url, categoria_id, marca_id, id]
  );
}

export async function actualizarImagen(id: number, imagenUrl: string | null): Promise<void> {
  await pool.execute('UPDATE productos SET imagen_url = ? WHERE id = ?', [imagenUrl, id]);
}

export async function eliminar(id: number): Promise<number> {
  const [resultado] = await pool.execute<ResultSetHeader>('DELETE FROM productos WHERE id = ?', [id]);
  return resultado.affectedRows;
}

export async function obtenerMasVendidos(): Promise<ProductoMasVendido[]> {
  const [filas] = await pool.execute<Fila<ProductoMasVendido>[]>(
    `SELECT p.id, p.nombre, p.precio, p.stock, p.imagen_url, c.nombre AS categoria,
            SUM(d.cantidad) AS vendidos
     FROM detalle_pedido d
     JOIN pedidos pe ON pe.id = d.pedido_id AND pe.estado IN ('pagado', 'enviado', 'entregado')
     JOIN productos p ON p.id = d.producto_id
     JOIN categorias c ON c.id = p.categoria_id
     GROUP BY p.id, p.nombre, p.precio, p.stock, p.imagen_url, c.nombre
     ORDER BY vendidos DESC, p.nombre ASC
     LIMIT 3`
  );
  return filas;
}
