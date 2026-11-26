import { beforeAll, describe, expect, it } from 'vitest';
import { reiniciarBase } from '../src/migraciones.js';
import { api, conSesion, ingresarComoAdmin } from './ayudantes.js';

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

async function listar(filtros = '') {
  const respuesta = await api().get(`/api/productos${filtros}`);
  return respuesta.body;
}

describe('Listado y búsqueda', () => {
  it('devuelve la primera página, del más nuevo al más viejo', async () => {
    const respuesta = await api().get('/api/productos');
    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toMatchObject({ total: 33, pagina: 1, porPagina: 12, paginas: 3 });
    expect(respuesta.body.productos).toHaveLength(12);
    expect(respuesta.body.productos[0].id).toBe(33);
    expect(typeof respuesta.body.productos[0].precio).toBe('number');
    expect(respuesta.body.productos[0].categoria).toBeTruthy();
  });

  it('pagina sin repetir ni saltear productos', async () => {
    const primera = await listar('?porPagina=12&pagina=1');
    const segunda = await listar('?porPagina=12&pagina=2');
    const tercera = await listar('?porPagina=12&pagina=3');
    const ids = [...primera.productos, ...segunda.productos, ...tercera.productos].map((producto) => producto.id);

    expect(tercera.productos).toHaveLength(9);
    expect(new Set(ids).size).toBe(33);
  });

  it.each([
    ['precio_asc', (a, b) => a.precio - b.precio],
    ['precio_desc', (a, b) => b.precio - a.precio],
    ['nombre', (a, b) => a.nombre.localeCompare(b.nombre, 'es')],
  ])('ordena por %s', async (orden, comparar) => {
    const { productos } = await listar(`?orden=${orden}&porPagina=100`);
    expect(productos).toEqual([...productos].sort(comparar));
  });

  it('filtra por rango de precio y por stock', async () => {
    const { productos } = await listar('?precioMin=100000&precioMax=300000&conStock=1&porPagina=100');
    expect(productos.length).toBeGreaterThan(0);
    expect(productos.every((producto) => producto.precio >= 100000 && producto.precio <= 300000)).toBe(true);
    expect(productos.every((producto) => producto.stock > 0)).toBe(true);
  });

  it('busca varios productos por id, para actualizar el carrito', async () => {
    const { productos } = await listar('?ids=3,1,20');
    expect(productos.map((producto) => producto.id).sort((a, b) => a - b)).toEqual([1, 3, 20]);
  });

  it.each([
    ['página 0', '?pagina=0'],
    ['demasiados por página', '?porPagina=500'],
    ['un orden que no existe', '?orden=al_azar'],
    ['un precio negativo', '?precioMin=-5'],
    ['ids que no son números', '?ids=1,dos'],
    ['una categoría que no es un número', '?categoria=procesadores'],
    ['una marca que no es un número', '?marca=1.5'],
  ])('rechaza %s', async (_caso, filtros) => {
    const respuesta = await api().get(`/api/productos${filtros}`);
    expect(respuesta.status).toBe(400);
  });

  it.each([
    ['categoría', '?categoria=8', 5],
    ['marca', '?marca=6', 4],
    ['categoría, marca y texto', '?categoria=5&marca=6&buscar=nvme', 1],
    ['varias palabras', '?buscar=placa%20de%20video%20asus', 1],
    ['nombre de la categoría', '?buscar=monitores', 3],
  ])('filtra por %s', async (_caso, filtros, cantidad) => {
    const { total } = await listar(filtros);
    expect(total).toBe(cantidad);
  });

  it('trata el texto de búsqueda como dato y no como SQL', async () => {
    const respuesta = await api().get("/api/productos?buscar=' OR '1'='1");
    expect(respuesta.status).toBe(200);
    expect(respuesta.body.total).toBe(0);
  });

  it('devuelve los 3 más vendidos, ordenados', async () => {
    const respuesta = await api().get('/api/productos/mas-vendidos');
    const vendidos = respuesta.body.map((producto) => producto.vendidos);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.map((producto) => producto.id)).toEqual([10, 23, 20]);
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
      .set(conSesion(admin))
      .send({ ...fuente, ...cambio });
    expect(respuesta.status).toBe(400);
  });

  it('crea, edita y elimina un producto', async () => {
    const creado = await api().post('/api/productos').set(conSesion(admin)).send(fuente);
    expect(creado.status).toBe(201);
    expect(creado.body).toMatchObject({ precio: 75999.5, stock: 7, marca: 'Corsair', imagen_url: null });

    const editado = await api()
      .put(`/api/productos/${creado.body.id}`)
      .set(conSesion(admin))
      .send({ ...fuente, stock: 2, precio: 80000 });
    expect(editado.status).toBe(200);
    expect(editado.body).toMatchObject({ stock: 2, precio: 80000 });

    const eliminado = await api().delete(`/api/productos/${creado.body.id}`).set(conSesion(admin));
    expect(eliminado.status).toBe(200);
  });

  it('responde 404 al editar un producto que no existe', async () => {
    const respuesta = await api().put('/api/productos/9999').set(conSesion(admin)).send(fuente);
    expect(respuesta.status).toBe(404);
  });

  it('elimina un producto que figura en pedidos sin perder el historial', async () => {
    const eliminado = await api().delete('/api/productos/12').set(conSesion(admin));
    expect(eliminado.status).toBe(200);
    expect((await api().get('/api/productos/12')).status).toBe(404);

    const pedido = await api().get('/api/pedidos/20').set(conSesion(admin));
    const renglon = pedido.body.items.find((item) => item.producto.startsWith('SSD Kingston NV2'));
    expect(renglon.producto_id).toBeNull();
    expect(pedido.body.total).toBe(287497);

    const masVendidos = await api().get('/api/productos/mas-vendidos');
    expect(masVendidos.body.some((producto) => producto.id === 12)).toBe(false);
  });
});
