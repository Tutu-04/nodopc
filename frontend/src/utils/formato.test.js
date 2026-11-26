import { describe, expect, it } from 'vitest';
import { formatearMes, formatearPorcentaje, formatearPrecio } from './formato';

describe('formatearPrecio', () => {
  it('usa pesos argentinos con separador de miles y dos decimales', () => {
    expect(formatearPrecio(1499999)).toMatch(/^\$\s?1\.499\.999,00$/);
  });

  it('acepta números que llegan como texto', () => {
    expect(formatearPrecio('75999.5')).toMatch(/75\.999,50$/);
  });
});

describe('formatearPorcentaje', () => {
  it('redondea al entero más cercano', () => {
    expect(formatearPorcentaje(1, 3)).toBe('33%');
  });

  it('devuelve 0% si el total es cero', () => {
    expect(formatearPorcentaje(5, 0)).toBe('0%');
  });
});

describe('formatearMes', () => {
  it('convierte AAAA-MM en el nombre corto del mes', () => {
    expect(formatearMes('2026-07')).toMatch(/jul/i);
    expect(formatearMes('2026-07')).toMatch(/2026/);
  });
});
