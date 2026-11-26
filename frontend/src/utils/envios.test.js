import { describe, expect, it } from 'vitest';
import { calcularEnvio, faltaParaEnvioGratis } from './envios';

const condiciones = {
  envioGratisDesde: 1500000,
  provincias: [
    { nombre: 'Córdoba', costo: 7500 },
    { nombre: 'Tucumán', costo: 9500 },
  ],
};

describe('calcularEnvio', () => {
  it('cobra el costo de la provincia elegida', () => {
    expect(calcularEnvio({ metodo: 'envio', provincia: 'Tucumán', subtotal: 1000, condiciones })).toBe(9500);
  });

  it('no cobra el retiro en el local ni las compras grandes', () => {
    expect(calcularEnvio({ metodo: 'retiro', provincia: '', subtotal: 1000, condiciones })).toBe(0);
    expect(calcularEnvio({ metodo: 'envio', provincia: 'Tucumán', subtotal: 1500000, condiciones })).toBe(0);
  });

  it('devuelve null mientras no hay provincia o condiciones', () => {
    expect(calcularEnvio({ metodo: 'envio', provincia: '', subtotal: 1000, condiciones })).toBeNull();
    expect(calcularEnvio({ metodo: 'envio', provincia: 'Tucumán', subtotal: 1000, condiciones: null })).toBeNull();
  });
});

describe('faltaParaEnvioGratis', () => {
  it('calcula cuánto falta y nunca da negativo', () => {
    expect(faltaParaEnvioGratis(1000000, condiciones)).toBe(500000);
    expect(faltaParaEnvioGratis(2000000, condiciones)).toBe(0);
  });
});
