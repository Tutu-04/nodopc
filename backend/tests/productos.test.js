import { beforeAll, describe, expect, it } from 'vitest';
import { reiniciarBase } from '../src/migraciones.js';
import { api, conToken, ingresarComoAdmin } from './ayudantes.js';

let admin;

const fuente = {
  nombre: 'Fuente Corsair CV650',
  descripcion: '650 W',
  precio: '75999.50',
  stock: '7',
  imagen_url: '',
  categoria_id: '1',
  marca_id: '7',
};

beforeAll(async () => {
  await reiniciarBase();
  admin = await ingresarComoAdmin();
});

describe('Listado y búsqueda', () => {
  it('devuelve todos los productos, del más nuevo al más viejo', async () => {
    const respuesta = await api().get('/api/productos');
    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toHaveLength(24);
    expect(respuesta.body[0].id).toBe(24);
    expect(typeof respuesta.body[0].precio).toBe('number');
    expect(respuesta.body[0].categoria).toBeTruthy();
  });

  it.each([
    ['categoría', '?categoria=8', 5],
    ['marca', '?marca=6', 3],
    ['categoría, marca y texto', '?categoria=5&marca=6&buscar=nvme', 1],
    ['varias palabras', '?buscar=placa%20de%20video%20asus', 1],
    ['nombre de la categoría', '?buscar=monitores', 3],
  ])('filtra por %s', async (_caso, filtros, cantidad) => {
    const respuesta = await api().get(`/api/productos${filtros}`);
    expect(respuesta.body).toHaveLength(cantidad);
  });

  it('trata el texto de búsqueda como dato y no como SQL', async () => {
    const respuesta = await api().get("/api/productos?buscar=' OR '1'='1");
    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toHaveLength(0);
  });

  it('devuelve los 3 más vendidos, ordenados', async () => {
    const respuesta = await api().get('/api/productos/mas-vendidos');
    const vendidos = respuesta.body.map((producto) => producto.vendidos);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.map((producto) => producto.id)).toEqual([10, 23, 12]);
    expect(vendidos).toEqual([...vendidos].sort((a, b) => b - a));
  });

  it('responde 404 si el producto no existe', async () => {
    expect((await api().get('/api/productos/9999')).status).toBe(404);
    expect((await api().get('/api/productos/abc')).status).toBe(404);
  });
});

describe('Alta, edición y baja', () => {
  it.each([
    ['precio 0', { precio: 0 }],
    ['precio que no es un número', { precio: 'caro' }],
    ['stock negativo', { stock: -1 }],
    ['stock con decimales', { stock: 1.5 }],
    ['sin categoría', { categoria_id: '' }],
    ['categoría que no existe', { categoria_id: 999 }],
  ])('rechaza un producto con %s', async (_caso, cambio) => {
    const respuesta = await api()
      .post('/api/productos')
      .set(conToken(admin))
      .send({ ...fuente, ...cambio });
    expect(respuesta.status).toBe(400);
  });

  it('crea, edita y elimina un producto', async () => {
    const creado = await api().post('/api/productos').set(conToken(admin)).send(fuente);
    expect(creado.status).toBe(201);
    expect(creado.body).toMatchObject({ precio: 75999.5, stock: 7, marca: 'Corsair', imagen_url: null });

    const editado = await api()
      .put(`/api/productos/${creado.body.id}`)
      .set(conToken(admin))
      .send({ ...fuente, stock: 2, precio: 80000 });
    expect(editado.status).toBe(200);
    expect(editado.body).toMatchObject({ stock: 2, precio: 80000 });

    const eliminado = await api().delete(`/api/productos/${creado.body.id}`).set(conToken(admin));
    expect(eliminado.status).toBe(200);
  });

  it('responde 404 al editar un producto que no existe', async () => {
    const respuesta = await api().put('/api/productos/9999').set(conToken(admin)).send(fuente);
    expect(respuesta.status).toBe(404);
  });

  it('elimina un producto que figura en pedidos sin perder el historial', async () => {
    const eliminado = await api().delete('/api/productos/12').set(conToken(admin));
    expect(eliminado.status).toBe(200);
    expect((await api().get('/api/productos/12')).status).toBe(404);

    const pedido = await api().get('/api/pedidos/20').set(conToken(admin));
    const renglon = pedido.body.items.find((item) => item.producto.startsWith('SSD Kingston NV2'));
    expect(renglon.producto_id).toBeNull();
    expect(pedido.body.total).toBe(279997);

    const masVendidos = await api().get('/api/productos/mas-vendidos');
    expect(masVendidos.body.some((producto) => producto.id === 12)).toBe(false);
  });
});
