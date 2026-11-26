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
