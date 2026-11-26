import { describe, expect, it } from 'vitest';
import { validarPassword } from '../src/utils/validaciones.js';

describe('validarPassword', () => {
  it.each(['clave1234', 'Ryzen7800x3d', 'a1b2c3d4'])('acepta "%s"', (password) => {
    expect(validarPassword(password)).toBeNull();
  });

  it.each([
    ['corta', 'abc123'],
    ['sin números', 'solamenteletras'],
    ['sin letras', '1234567890'],
    ['demasiado larga', 'a1'.repeat(40)],
    ['que no es texto', 12345678],
  ])('rechaza una contraseña %s', (_caso, password) => {
    expect(validarPassword(password)).toMatch(/contraseña/);
  });
});
