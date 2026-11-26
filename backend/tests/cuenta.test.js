import { beforeAll, describe, expect, it } from 'vitest';
import { reiniciarBase } from '../src/migraciones.js';
import { api, conSesion, cookieDeSesion, ingresar, ingresarComoCliente } from './ayudantes.js';

let cliente;

beforeAll(async () => {
  await reiniciarBase();
  cliente = await ingresarComoCliente();
});

describe('PUT /api/cuenta', () => {
  it('pide iniciar sesión', async () => {
    const respuesta = await api().put('/api/cuenta').send({ nombre: 'Pepe', email: 'pepe@x.com' });
    expect(respuesta.status).toBe(401);
  });

  it('valida los datos', async () => {
    const respuesta = await api().put('/api/cuenta').set(conSesion(cliente)).send({ nombre: 'P', email: 'mal' });
    expect(respuesta.status).toBe(400);
  });

  it('no deja usar el email de otra cuenta', async () => {
    const respuesta = await api()
      .put('/api/cuenta')
      .set(conSesion(cliente))
      .send({ nombre: 'Cliente', email: 'maria@nodopc.com' });
    expect(respuesta.status).toBe(409);
  });

  it('actualiza el nombre y el email, y renueva la cookie', async () => {
    const respuesta = await api()
      .put('/api/cuenta')
      .set(conSesion(cliente))
      .send({ nombre: '  Cliente Renombrado ', email: 'cliente.nuevo@nodopc.com' });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.usuario).toMatchObject({ nombre: 'Cliente Renombrado', email: 'cliente.nuevo@nodopc.com' });
    expect(cookieDeSesion(respuesta)).toBeTruthy();

    const login = await api()
      .post('/api/auth/login')
      .send({ email: 'cliente.nuevo@nodopc.com', password: 'cliente123' });
    expect(login.status).toBe(200);
  });
});

describe('PUT /api/cuenta/password', () => {
  it('exige la contraseña actual correcta', async () => {
    const respuesta = await api()
      .put('/api/cuenta/password')
      .set(conSesion(cliente))
      .send({ actual: 'otra1234', nueva: 'nueva1234' });
    expect(respuesta.status).toBe(400);
    expect(respuesta.body.error).toMatch(/actual/);
  });

  it('aplica la misma regla que el registro a la nueva', async () => {
    const respuesta = await api()
      .put('/api/cuenta/password')
      .set(conSesion(cliente))
      .send({ actual: 'cliente123', nueva: 'corta' });
    expect(respuesta.status).toBe(400);
  });

  it('cambia la contraseña', async () => {
    const respuesta = await api()
      .put('/api/cuenta/password')
      .set(conSesion(cliente))
      .send({ actual: 'cliente123', nueva: 'nueva1234' });
    expect(respuesta.status).toBe(200);

    expect(await ingresar('cliente.nuevo@nodopc.com', 'cliente123')).toBeUndefined();
    expect(await ingresar('cliente.nuevo@nodopc.com', 'nueva1234')).toBeTruthy();
  });
});
