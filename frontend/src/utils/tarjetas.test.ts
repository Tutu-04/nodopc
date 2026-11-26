import { describe, expect, it } from 'vitest';
import { formatearCuentaRegresiva, formatearNumeroDeTarjeta, formatearVencimiento } from './tarjetas';

describe('formatearNumeroDeTarjeta', () => {
  it('agrupa de a cuatro y descarta lo que no es número', () => {
    expect(formatearNumeroDeTarjeta('4509953566233704')).toBe('4509 9535 6623 3704');
    expect(formatearNumeroDeTarjeta('4509-95a3')).toBe('4509 953');
    expect(formatearNumeroDeTarjeta('45099535662337049999')).toBe('4509 9535 6623 3704');
  });
});

describe('formatearVencimiento', () => {
  it('agrega la barra después del mes', () => {
    expect(formatearVencimiento('1')).toBe('1');
    expect(formatearVencimiento('11')).toBe('11');
    expect(formatearVencimiento('1130')).toBe('11/30');
    expect(formatearVencimiento('11/305')).toBe('11/30');
  });
});

describe('formatearCuentaRegresiva', () => {
  it('muestra minutos y segundos con dos dígitos', () => {
    expect(formatearCuentaRegresiva(1800)).toBe('30:00');
    expect(formatearCuentaRegresiva(65)).toBe('01:05');
    expect(formatearCuentaRegresiva(0)).toBe('00:00');
  });
});
