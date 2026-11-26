import { describe, expect, it } from 'vitest';
import { api } from './ayudantes.js';

describe('GET /api/salud', () => {
  it('confirma que la API y la base responden', async () => {
    const respuesta = await api().get('/api/salud');
    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual({ estado: 'ok', baseDeDatos: 'ok' });
  });
});
