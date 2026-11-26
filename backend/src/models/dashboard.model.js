import pool from '../db.js';

export async function obtenerResumen() {
  const [filas] = await pool.execute(`
    SELECT
      (SELECT COUNT(*) FROM productos)                          AS productos,
      (SELECT COUNT(*) FROM productos WHERE stock <= 5)         AS productos_poco_stock,
      (SELECT COUNT(*) FROM productos WHERE stock = 0)          AS productos_sin_stock,
      (SELECT COUNT(*) FROM categorias)                         AS categorias,
      (SELECT COUNT(*) FROM marcas)                             AS marcas,
      (SELECT COUNT(*) FROM usuarios)                           AS usuarios,
      (SELECT COUNT(*) FROM usuarios WHERE rol = 'cliente')     AS clientes,
      (SELECT COUNT(*) FROM pedidos)                            AS pedidos,
      (SELECT COUNT(*) FROM pedidos WHERE estado = 'pendiente') AS pedidos_pendientes,
      (SELECT COALESCE(SUM(total), 0) FROM pedidos)             AS total_vendido,
      (SELECT COALESCE(AVG(total), 0) FROM pedidos)             AS ticket_promedio,
      (SELECT COALESCE(SUM(cantidad), 0) FROM detalle_pedido)   AS unidades_vendidas
  `);
  return filas[0];
}

export async function obtenerVentasPorMes() {
  const [filas] = await pool.execute(`
    SELECT DATE_FORMAT(fecha, '%Y-%m') AS mes, COUNT(*) AS pedidos, SUM(total) AS total
    FROM pedidos
    GROUP BY mes
    ORDER BY mes DESC
    LIMIT 6
  `);
  return filas.reverse();
}

export async function obtenerPedidosPorEstado() {
  const [filas] = await pool.execute(`
    SELECT estado, COUNT(*) AS cantidad, SUM(total) AS total
    FROM pedidos
    GROUP BY estado
    ORDER BY FIELD(estado, 'pendiente', 'enviado', 'entregado')
  `);
  return filas;
}

export async function obtenerProductosMasVendidos() {
  const [filas] = await pool.execute(`
    SELECT producto_nombre AS producto,
           SUM(cantidad) AS unidades,
           SUM(cantidad * precio_unitario) AS ingresos
    FROM detalle_pedido
    GROUP BY producto_nombre
    ORDER BY unidades DESC, ingresos DESC
    LIMIT 5
  `);
  return filas;
}

export async function obtenerVentasPorCategoria() {
  const [filas] = await pool.execute(`
    SELECT COALESCE(c.nombre, 'Productos eliminados') AS categoria,
           SUM(d.cantidad) AS unidades,
           SUM(d.cantidad * d.precio_unitario) AS ingresos
    FROM detalle_pedido d
    LEFT JOIN productos p ON p.id = d.producto_id
    LEFT JOIN categorias c ON c.id = p.categoria_id
    GROUP BY categoria
    ORDER BY ingresos DESC
  `);
  return filas;
}

export async function obtenerMejoresClientes() {
  const [filas] = await pool.execute(`
    SELECT u.nombre AS cliente, u.email, COUNT(p.id) AS pedidos, SUM(p.total) AS total
    FROM pedidos p
    JOIN usuarios u ON u.id = p.usuario_id
    GROUP BY u.id, u.nombre, u.email
    ORDER BY total DESC
    LIMIT 5
  `);
  return filas;
}

export async function obtenerProductosPocoStock() {
  const [filas] = await pool.execute(`
    SELECT p.id, p.nombre, p.stock, c.nombre AS categoria
    FROM productos p
    JOIN categorias c ON c.id = p.categoria_id
    WHERE p.stock <= 5
    ORDER BY p.stock ASC, p.nombre ASC
  `);
  return filas;
}
