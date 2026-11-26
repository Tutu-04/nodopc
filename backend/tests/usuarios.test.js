import { beforeAll, describe, expect, it } from 'vitest';
import { reiniciarBase } from '../src/migraciones.js';
import { api, conToken, ingresarComoAdmin } from './ayudantes.js';

let admin;

function login(email, password) {
  return api().post('/api/auth/login').send({ email, password });
}

beforeAll(async () => {
  await reiniciarBase();
  admin = await ingresarComoAdmin();
});

describe('Gestión de usuarios', () => {
  it('lista los usuarios sin mostrar las contraseñas', async () => {
    const respuesta = await api().get('/api/usuarios').set(conToken(admin));
    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toHaveLength(7);
    expect(respuesta.body.every((usuario) => !('password' in usuario))).toBe(true);
  });

  it.each([
    ['un rol que no existe', { nombre: 'Pepe', email: 'pepe@x.com', password: 'clave1234', rol: 'jefe' }],
    ['sin contraseña', { nombre: 'Pepe', email: 'pepe@x.com', rol: 'admin' }],
  ])('rechaza crear un usuario con %s', async (_caso, datos) => {
    const respuesta = await api().post('/api/usuarios').set(conToken(admin)).send(datos);
    expect(respuesta.status).toBe(400);
  });

  it('cambia la contraseña solo si se manda una nueva', async () => {
    const creado = await api()
      .post('/api/usuarios')
      .set(conToken(admin))
      .send({ nombre: 'Pepe Admin', email: 'pepe@x.com', password: 'clave1234', rol: 'admin' });
    expect(creado.status).toBe(201);

    const sinPassword = await api()
      .put(`/api/usuarios/${creado.body.id}`)
      .set(conToken(admin))
      .send({ nombre: 'Pepe', email: 'pepe@x.com', rol: 'cliente', password: '' });
    expect(sinPassword.body.rol).toBe('cliente');
    expect((await login('pepe@x.com', 'clave1234')).status).toBe(200);

    await api()
      .put(`/api/usuarios/${creado.body.id}`)
      .set(conToken(admin))
      .send({ nombre: 'Pepe', email: 'pepe@x.com', rol: 'cliente', password: 'nueva123' });
    expect((await login('pepe@x.com', 'clave1234')).status).toBe(401);
    expect((await login('pepe@x.com', 'nueva123')).status).toBe(200);

    const eliminado = await api().delete(`/api/usuarios/${creado.body.id}`).set(conToken(admin));
    expect(eliminado.status).toBe(200);
  });

  it('no deja repetir un email', async () => {
    const respuesta = await api()
      .post('/api/usuarios')
      .set(conToken(admin))
      .send({ nombre: 'Otra', email: 'maria@nodopc.com', password: 'clave1234', rol: 'cliente' });
    expect(respuesta.status).toBe(409);
  });

  it('el administrador no puede quitarse el rol ni eliminarse', async () => {
    const quitarRol = await api()
      .put('/api/usuarios/1')
      .set(conToken(admin))
      .send({ nombre: 'Administrador', email: 'admin@nodopc.com', rol: 'cliente' });
    const eliminarse = await api().delete('/api/usuarios/1').set(conToken(admin));

    expect(quitarRol.status).toBe(400);
    expect(eliminarse.status).toBe(400);
  });

  it('no elimina un usuario que tiene pedidos', async () => {
    const respuesta = await api().delete('/api/usuarios/2').set(conToken(admin));
    expect(respuesta.status).toBe(409);
  });
});
