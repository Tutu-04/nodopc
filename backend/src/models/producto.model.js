import pool from '../db.js';

const SELECT_PRODUCTOS = `
  SELECT p.*, c.nombre AS categoria, m.nombre AS marca
  FROM productos p
  JOIN categorias c ON c.id = p.categoria_id
  JOIN marcas m ON m.id = p.marca_id
`;

const ORDENES = {
  recientes: 'p.id DESC',
  precio_asc: 'p.precio ASC, p.id DESC',
  precio_desc: 'p.precio DESC, p.id DESC',
  nombre: 'p.nombre ASC, p.id DESC',
};

export const ORDENES_VALIDOS = Object.keys(ORDENES);

function armarFiltros({ categoria, marca, buscar, ids, conStock, precioMin, precioMax }) {
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

export async function buscar({ orden = 'recientes', pagina = 1, porPagina = 12, ...filtros }) {
  const { where, valores } = armarFiltros(filtros);

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM productos p
     JOIN categorias c ON c.id = p.categoria_id
     JOIN marcas m ON m.id = p.marca_id${where}`,
    valores
  );

  const [productos] = await pool.query(`${SELECT_PRODUCTOS}${where} ORDER BY ${ORDENES[orden]} LIMIT ? OFFSET ?`, [
    ...valores,
    porPagina,
    (pagina - 1) * porPagina,
  ]);

  return { productos, total };
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
