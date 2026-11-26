import { beforeAll, describe, expect, it } from 'vitest';
import { reiniciarBase } from '../src/migraciones.js';
import { api, conSesion, ingresarComoAdmin } from './ayudantes.js';
import type { PedidosPorEstado, Resumen, VentaDelMes } from '../src/models/dashboard.model.js';

interface Metricas {
  resumen: Resumen;
  ventasPorMes: VentaDelMes[];
  pedidosPorEstado: PedidosPorEstado[];
  [otra: string]: unknown;
}

let metricas: Metricas;

beforeAll(async () => {
  await reiniciarBase();
  const admin = await ingresarComoAdmin();
  const respuesta = await api().get('/api/dashboard').set(conSesion(admin));
  metricas = respuesta.body;
});

describe('GET /api/dashboard', () => {
  it('calcula los totales de la tienda', () => {
    expect(metricas.resumen).toMatchObject({
      productos: 33,
      categorias: 10,
      marcas: 12,
      usuarios: 7,
      pedidos: 28,
      pedidos_pendientes: 1,
      pedidos_para_despachar: 3,
      pedidos_cobrados: 26,
      unidades_vendidas: 53,
      total_vendido: 14941447,
    });
  });

  it('no suma como venta los pedidos sin pagar ni los cancelados', () => {
    const cobrado = metricas.pedidosPorEstado
      .filter((fila) => ['pagado', 'enviado', 'entregado'].includes(fila.estado))
      .reduce((suma, fila) => suma + fila.total, 0);

    expect(cobrado).toBe(metricas.resumen.total_vendido);
    expect(metricas.resumen.ticket_promedio).toBeCloseTo(14941447 / 26, 2);
  });

  it('agrupa las ventas de los últimos meses en orden', () => {
    const meses = metricas.ventasPorMes.map((fila) => fila.mes);
    expect(metricas.ventasPorMes).toHaveLength(6);
    expect(meses).toEqual([...meses].sort());
  });

  it('devuelve los rankings y la distribución por estado', () => {
    expect(metricas.productosMasVendidos).toHaveLength(5);
    expect(metricas.mejoresClientes).toHaveLength(5);
    expect(metricas.pedidosPorEstado.map((fila) => fila.estado)).toEqual([
      'pendiente',
      'pagado',
      'enviado',
      'entregado',
      'cancelado',
    ]);
  });
});
