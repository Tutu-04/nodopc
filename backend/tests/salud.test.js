import { beforeAll, describe, expect, it } from 'vitest';
import { reiniciarBase } from '../src/migraciones.js';
import { api } from './ayudantes.js';

beforeAll(reiniciarBase);

describe('GET /api/salud', () => {
  it('confirma que la API y la base responden', async () => {
    const respuesta = await api().get('/api/salud');
    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual({ estado: 'ok', baseDeDatos: 'ok' });
  });
});

describe('Encabezados de seguridad', () => {
  it('no revelan que el servidor usa Express y agregan las protecciones de helmet', async () => {
    const respuesta = await api().get('/api/salud');
    expect(respuesta.headers['x-powered-by']).toBeUndefined();
    expect(respuesta.headers['x-content-type-options']).toBe('nosniff');
    expect(respuesta.headers['content-security-policy']).toBeDefined();
  });
});
