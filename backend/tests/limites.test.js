import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { crearLimitador } from '../src/middlewares/limites.js';

function crearApp(opciones) {
  const app = express();
  app.post('/accion', crearLimitador({ mensaje: 'Esperá un rato', ...opciones }), (req, res) => {
    const salio = req.query.ok === '1';
    res.status(salio ? 200 : 401).json({});
  });
  return app;
}

describe('crearLimitador', () => {
  it('responde 429 con un mensaje claro al pasar el máximo', async () => {
    const app = crearApp({ maximo: 2 });

    expect((await request(app).post('/accion')).status).toBe(401);
    expect((await request(app).post('/accion')).status).toBe(401);

    const bloqueado = await request(app).post('/accion');
    expect(bloqueado.status).toBe(429);
    expect(bloqueado.body.error).toBe('Esperá un rato');
    expect(bloqueado.headers.ratelimit).toBeDefined();
  });

  it('puede contar solo los intentos fallidos', async () => {
    const app = crearApp({ maximo: 2, soloFallidos: true });

    for (let i = 0; i < 5; i++) {
      expect((await request(app).post('/accion?ok=1')).status).toBe(200);
    }
    await request(app).post('/accion');
    await request(app).post('/accion');
    expect((await request(app).post('/accion?ok=1')).status).toBe(429);
  });
});
