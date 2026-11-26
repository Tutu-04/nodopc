import { beforeAll, describe, expect, it } from 'vitest';
import { reiniciarBase } from '../src/migraciones.js';
import { api, conSesion, ingresarComoCliente } from './ayudantes.js';

function pedir(metodo: string, ruta: string) {
  const agente = api();
  if (metodo === 'POST') return agente.post(ruta);
  if (metodo === 'PUT') return agente.put(ruta);
  if (metodo === 'DELETE') return agente.delete(ruta);
  return agente.get(ruta);
}

let cliente: string;

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
    ['DELETE', '/api/pedidos/25'],
    ['GET', '/api/dashboard'],
  ])('%s %s responde 403', async (metodo, ruta) => {
    const respuesta = await pedir(metodo, ruta).set(conSesion(cliente)).send({});
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
    const respuesta = await pedir(metodo, ruta).send({});
    expect(respuesta.status).toBe(401);
  });
});
