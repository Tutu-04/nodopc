import pool from '../db.js';
import type { EstadoPedido, Fila } from '../tipos.js';

export interface Resumen {
  productos: number;
  productos_poco_stock: number;
  productos_sin_stock: number;
  categorias: number;
  marcas: number;
  usuarios: number;
  clientes: number;
  pedidos: number;
  pedidos_pendientes: number;
  pedidos_para_despachar: number;
  pedidos_cobrados: number;
  total_vendido: number;
  ticket_promedio: number;
  unidades_vendidas: number;
}

export interface VentaDelMes {
  mes: string;
  pedidos: number;
  total: number;
}

export interface PedidosPorEstado {
  estado: EstadoPedido;
  cantidad: number;
  total: number;
}

export interface ProductoVendido {
  producto: string;
  unidades: number;
  ingresos: number;
}

export interface VentaPorCategoria {
  categoria: string;
  unidades: number;
  ingresos: number;
}

export interface MejorCliente {
  cliente: string;
  email: string;
  pedidos: number;
  total: number;
}

export interface ProductoConPocoStock {
  id: number;
  nombre: string;
  stock: number;
  categoria: string;
}

const COBRADO = "estado IN ('pagado', 'enviado', 'entregado')";
const DETALLE_COBRADO = `detalle_pedido d JOIN pedidos pe ON pe.id = d.pedido_id AND pe.${COBRADO}`;

export async function obtenerResumen(): Promise<Resumen> {
  const [filas] = await pool.execute<Fila<Resumen>[]>(`
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
      (SELECT COUNT(*) FROM pedidos WHERE estado = 'pagado')    AS pedidos_para_despachar,
      (SELECT COUNT(*) FROM pedidos WHERE ${COBRADO})           AS pedidos_cobrados,
      (SELECT COALESCE(SUM(total), 0) FROM pedidos WHERE ${COBRADO}) AS total_vendido,
      (SELECT COALESCE(AVG(total), 0) FROM pedidos WHERE ${COBRADO}) AS ticket_promedio,
      (SELECT COALESCE(SUM(d.cantidad), 0) FROM ${DETALLE_COBRADO})  AS unidades_vendidas
  `);
  return filas[0];
}

export async function obtenerVentasPorMes(): Promise<VentaDelMes[]> {
  const [filas] = await pool.execute<Fila<VentaDelMes>[]>(`
    SELECT DATE_FORMAT(fecha, '%Y-%m') AS mes, COUNT(*) AS pedidos, SUM(total) AS total
    FROM pedidos
    WHERE ${COBRADO}
    GROUP BY mes
    ORDER BY mes DESC
    LIMIT 6
  `);
  return filas.reverse();
}

export async function obtenerPedidosPorEstado(): Promise<PedidosPorEstado[]> {
  const [filas] = await pool.execute<Fila<PedidosPorEstado>[]>(`
    SELECT estado, COUNT(*) AS cantidad, SUM(total) AS total
    FROM pedidos
    GROUP BY estado
    ORDER BY FIELD(estado, 'pendiente', 'pagado', 'enviado', 'entregado', 'cancelado')
  `);
  return filas;
}

export async function obtenerProductosMasVendidos(): Promise<ProductoVendido[]> {
  const [filas] = await pool.execute<Fila<ProductoVendido>[]>(`
    SELECT d.producto_nombre AS producto,
           SUM(d.cantidad) AS unidades,
           SUM(d.cantidad * d.precio_unitario) AS ingresos
    FROM ${DETALLE_COBRADO}
    GROUP BY d.producto_nombre
    ORDER BY unidades DESC, ingresos DESC
    LIMIT 5
  `);
  return filas;
}

export async function obtenerVentasPorCategoria(): Promise<VentaPorCategoria[]> {
  const [filas] = await pool.execute<Fila<VentaPorCategoria>[]>(`
    SELECT COALESCE(c.nombre, 'Productos eliminados') AS categoria,
           SUM(d.cantidad) AS unidades,
           SUM(d.cantidad * d.precio_unitario) AS ingresos
    FROM ${DETALLE_COBRADO}
    LEFT JOIN productos p ON p.id = d.producto_id
    LEFT JOIN categorias c ON c.id = p.categoria_id
    GROUP BY categoria
    ORDER BY ingresos DESC
  `);
  return filas;
}

export async function obtenerMejoresClientes(): Promise<MejorCliente[]> {
  const [filas] = await pool.execute<Fila<MejorCliente>[]>(`
    SELECT u.nombre AS cliente, u.email, COUNT(p.id) AS pedidos, SUM(p.total) AS total
    FROM pedidos p
    JOIN usuarios u ON u.id = p.usuario_id
    WHERE p.${COBRADO}
    GROUP BY u.id, u.nombre, u.email
    ORDER BY total DESC
    LIMIT 5
  `);
  return filas;
}

export async function obtenerProductosPocoStock(): Promise<ProductoConPocoStock[]> {
  const [filas] = await pool.execute<Fila<ProductoConPocoStock>[]>(`
    SELECT p.id, p.nombre, p.stock, c.nombre AS categoria
    FROM productos p
    JOIN categorias c ON c.id = p.categoria_id
    WHERE p.stock <= 5
    ORDER BY p.stock ASC, p.nombre ASC
  `);
  return filas;
}
