import { beforeAll, describe, expect, it } from 'vitest';
import { reiniciarBase } from '../src/migraciones.js';
import { api, conToken, ingresarComoCliente } from './ayudantes.js';

let cliente;

beforeAll(async () => {
  await reiniciarBase();
  cliente = await ingresarComoCliente();
});

describe('Un cliente no puede usar las rutas del administrador', () => {
  it.each([
    ['POST', '/api/categorias'],
    ['POST', '/api/marcas'],
    ['POST', '/api/productos'],
    ['PUT', '/api/productos/1'],
    ['DELETE', '/api/productos/1'],
    ['GET', '/api/usuarios'],
    ['GET', '/api/pedidos'],
    ['PUT', '/api/pedidos/1'],
    ['GET', '/api/dashboard'],
  ])('%s %s responde 403', async (metodo, ruta) => {
    const respuesta = await api()[metodo.toLowerCase()](ruta).set(conToken(cliente)).send({});
    expect(respuesta.status).toBe(403);
  });
});

describe('Sin sesión', () => {
  it.each([
    ['POST', '/api/categorias'],
    ['GET', '/api/usuarios'],
    ['GET', '/api/dashboard'],
    ['POST', '/api/pedidos'],
  ])('%s %s responde 401', async (metodo, ruta) => {
    const respuesta = await api()[metodo.toLowerCase()](ruta).send({});
    expect(respuesta.status).toBe(401);
  });
});
