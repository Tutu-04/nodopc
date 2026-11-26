import { beforeAll, describe, expect, it } from 'vitest';
import { reiniciarBase } from '../src/migraciones.js';
import { api, conSesion, ingresarComoAdmin } from './ayudantes.js';

let metricas;

beforeAll(async () => {
  await reiniciarBase();
  const admin = await ingresarComoAdmin();
  const respuesta = await api().get('/api/dashboard').set(conSesion(admin));
  metricas = respuesta.body;
});

describe('GET /api/dashboard', () => {
  it('calcula los totales de la tienda', () => {
    expect(metricas.resumen).toMatchObject({
      productos: 24,
      categorias: 8,
      marcas: 12,
      usuarios: 7,
      pedidos: 28,
      pedidos_pendientes: 1,
      unidades_vendidas: 60,
    });
  });

  it('agrupa las ventas de los últimos meses en orden', () => {
    const meses = metricas.ventasPorMes.map((fila) => fila.mes);
    expect(metricas.ventasPorMes).toHaveLength(6);
    expect(meses).toEqual([...meses].sort());
  });

  it('devuelve los rankings y la distribución por estado', () => {
    expect(metricas.productosMasVendidos).toHaveLength(5);
    expect(metricas.mejoresClientes).toHaveLength(5);
    expect(metricas.pedidosPorEstado.map((fila) => fila.estado).sort()).toEqual([
      'cancelado',
      'entregado',
      'enviado',
      'pagado',
      'pendiente',
    ]);
  });
});
