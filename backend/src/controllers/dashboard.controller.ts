import type { Request, Response } from 'express';
import * as Dashboard from '../models/dashboard.model.js';

export async function resumen(req: Request, res: Response) {
  const resumen = await Dashboard.obtenerResumen();
  const ventasPorMes = await Dashboard.obtenerVentasPorMes();
  const pedidosPorEstado = await Dashboard.obtenerPedidosPorEstado();
  const productosMasVendidos = await Dashboard.obtenerProductosMasVendidos();
  const ventasPorCategoria = await Dashboard.obtenerVentasPorCategoria();
  const mejoresClientes = await Dashboard.obtenerMejoresClientes();
  const productosPocoStock = await Dashboard.obtenerProductosPocoStock();

  res.json({
    resumen,
    ventasPorMes,
    pedidosPorEstado,
    productosMasVendidos,
    ventasPorCategoria,
    mejoresClientes,
    productosPocoStock,
  });
}
