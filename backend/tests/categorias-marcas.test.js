import { beforeAll, describe, expect, it } from 'vitest';
import { reiniciarBase } from '../src/migraciones.js';
import { api, conSesion, ingresarComoAdmin } from './ayudantes.js';

let admin;

beforeAll(async () => {
  await reiniciarBase();
  admin = await ingresarComoAdmin();
});

describe('Categorías', () => {
  it('se listan sin iniciar sesión', async () => {
    const respuesta = await api().get('/api/categorias');
    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toHaveLength(10);
  });

  it('incluyen cuántos productos tiene cada una', async () => {
    const respuesta = await api().get('/api/categorias');
    const total = respuesta.body.reduce((suma, categoria) => suma + categoria.cantidad_productos, 0);
    expect(total).toBe(33);
  });

  it('responden 404 si no existen o el id no es un número', async () => {
    expect((await api().get('/api/categorias/999')).status).toBe(404);
    expect((await api().get('/api/categorias/abc')).status).toBe(404);
  });

  it('validan el nombre', async () => {
    const sinNombre = await api().post('/api/categorias').set(conSesion(admin)).send({});
    const nombreNumerico = await api().post('/api/categorias').set(conSesion(admin)).send({ nombre: 123 });
    expect(sinNombre.status).toBe(400);
    expect(nombreNumerico.status).toBe(400);
  });

  it('se crean, se editan y se eliminan', async () => {
    const creada = await api()
      .post('/api/categorias')
      .set(conSesion(admin))
      .send({ nombre: '  Refrigeración  ', descripcion: '' });
    expect(creada.status).toBe(201);
    expect(creada.body).toMatchObject({ nombre: 'Refrigeración', descripcion: null });

    const repetida = await api().post('/api/categorias').set(conSesion(admin)).send({ nombre: 'Refrigeración' });
    expect(repetida.status).toBe(409);

    const editada = await api()
      .put(`/api/categorias/${creada.body.id}`)
      .set(conSesion(admin))
      .send({ nombre: 'Coolers y refrigeración', descripcion: 'Coolers' });
    expect(editada.status).toBe(200);
    expect(editada.body.nombre).toBe('Coolers y refrigeración');

    const eliminada = await api().delete(`/api/categorias/${creada.body.id}`).set(conSesion(admin));
    expect(eliminada.status).toBe(200);

    const otraVez = await api().delete(`/api/categorias/${creada.body.id}`).set(conSesion(admin));
    expect(otraVez.status).toBe(404);
  });

  it('no se eliminan si tienen productos, y el error lo explica', async () => {
    const respuesta = await api().delete('/api/categorias/1').set(conSesion(admin));
    expect(respuesta.status).toBe(409);
    expect(respuesta.body.error).toMatch(/producto/);
  });
});

describe('Marcas', () => {
  it('se listan sin iniciar sesión', async () => {
    const respuesta = await api().get('/api/marcas');
    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toHaveLength(12);
  });

  it('se crean, se editan y se eliminan', async () => {
    const creada = await api()
      .post('/api/marcas')
      .set(conSesion(admin))
      .send({ nombre: 'HyperX', pais: 'Estados Unidos' });
    expect(creada.status).toBe(201);

    const editada = await api()
      .put(`/api/marcas/${creada.body.id}`)
      .set(conSesion(admin))
      .send({ nombre: 'HyperX', pais: '' });
    expect(editada.status).toBe(200);
    expect(editada.body.pais).toBeNull();

    const eliminada = await api().delete(`/api/marcas/${creada.body.id}`).set(conSesion(admin));
    expect(eliminada.status).toBe(200);
  });

  it('no se eliminan si tienen productos', async () => {
    const respuesta = await api().delete('/api/marcas/1').set(conSesion(admin));
    expect(respuesta.status).toBe(409);
  });
});
