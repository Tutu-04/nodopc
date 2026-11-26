import { describe, expect, it } from 'vitest';
import { api } from './ayudantes.js';
import { calcularCostoDeEnvio, ENVIO_GRATIS_DESDE, esProvinciaValida } from '../src/utils/envios.js';
import type { Provincia } from '../src/utils/envios.js';

describe('Costo de envío', () => {
  it('cobra según la zona de la provincia', () => {
    expect(calcularCostoDeEnvio({ metodo: 'envio', provincia: 'Buenos Aires', subtotal: 100000 })).toBe(4500);
    expect(calcularCostoDeEnvio({ metodo: 'envio', provincia: 'Tucumán', subtotal: 100000 })).toBe(9500);
    expect(calcularCostoDeEnvio({ metodo: 'envio', provincia: 'Chubut', subtotal: 100000 })).toBe(11500);
  });

  it('es gratis al retirar en el local o al superar el mínimo', () => {
    expect(calcularCostoDeEnvio({ metodo: 'retiro', provincia: null, subtotal: 100000 })).toBe(0);
    expect(calcularCostoDeEnvio({ metodo: 'envio', provincia: 'Chubut', subtotal: ENVIO_GRATIS_DESDE })).toBe(0);
    expect(calcularCostoDeEnvio({ metodo: 'envio', provincia: 'Chubut', subtotal: ENVIO_GRATIS_DESDE - 1 })).toBe(
      11500
    );
  });

  it('reconoce solo las provincias de la lista', () => {
    expect(esProvinciaValida('Córdoba')).toBe(true);
    expect(esProvinciaValida('Cordoba')).toBe(false);
    expect(esProvinciaValida(undefined)).toBe(false);
  });
});

describe('GET /api/envios', () => {
  it('devuelve las 24 jurisdicciones ordenadas y las condiciones de envío', async () => {
    const respuesta = await api().get('/api/envios');
    const nombres = respuesta.body.provincias.map((provincia: Provincia) => provincia.nombre);

    expect(respuesta.status).toBe(200);
    expect(nombres).toHaveLength(24);
    expect(nombres).toEqual([...nombres].sort((a, b) => a.localeCompare(b, 'es')));
    expect(respuesta.body).toMatchObject({ envioGratisDesde: ENVIO_GRATIS_DESDE, minutosParaPagar: 30 });
  });
});
