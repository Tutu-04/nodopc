import { beforeAll, describe, expect, it } from 'vitest';
import { reiniciarBase } from '../src/migraciones.js';
import { api, conToken, ingresar, ingresarComoAdmin, ingresarComoCliente } from './ayudantes.js';

let admin;
let cliente;
let maria;

async function stockDe(id) {
  const respuesta = await api().get(`/api/productos/${id}`);
  return respuesta.body.stock;
}

function crearPedido(token, datos) {
  return api().post('/api/pedidos').set(conToken(token)).send(datos);
}

beforeAll(async () => {
  await reiniciarBase();
  admin = await ingresarComoAdmin();
  cliente = await ingresarComoCliente();
  maria = await ingresar('maria@nodopc.com', 'cliente123');
});

describe('Consulta de pedidos', () => {
  it('cada cliente ve solo los suyos', async () => {
    const respuesta = await api().get('/api/pedidos/mios').set(conToken(cliente));
    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toHaveLength(2);
    expect(respuesta.body[0].id).toBe(24);
  });

  it('el administrador ve todos', async () => {
    const respuesta = await api().get('/api/pedidos').set(conToken(admin));
    expect(respuesta.body).toHaveLength(28);
  });

  it('un cliente no puede ver el detalle de un pedido ajeno', async () => {
    expect((await api().get('/api/pedidos/20').set(conToken(cliente))).status).toBe(200);
    expect((await api().get('/api/pedidos/26').set(conToken(cliente))).status).toBe(403);
    expect((await api().get('/api/pedidos/26').set(conToken(admin))).status).toBe(200);
    expect((await api().get('/api/pedidos/999').set(conToken(cliente))).status).toBe(404);
  });
});

describe('Creación de pedidos', () => {
  it.each([
    ['sin dirección', { items: [{ producto_id: 1, cantidad: 1 }] }],
    ['sin productos', { direccion_envio: 'Calle 123', items: [] }],
    ['con cantidad 0', { direccion_envio: 'Calle 123', items: [{ producto_id: 1, cantidad: 0 }] }],
    ['con un producto que no existe', { direccion_envio: 'Calle 123', items: [{ producto_id: 9999, cantidad: 1 }] }],
  ])('rechaza un pedido %s', async (_caso, datos) => {
    const respuesta = await crearPedido(cliente, datos);
    expect(respuesta.status).toBe(400);
  });

  it('no descuenta nada si un producto no tiene stock suficiente', async () => {
    const respuesta = await crearPedido(cliente, {
      direccion_envio: 'Calle 123',
      items: [
        { producto_id: 20, cantidad: 1 },
        { producto_id: 19, cantidad: 999 },
      ],
    });

    expect(respuesta.status).toBe(409);
    expect(await stockDe(20)).toBe(35);
  });

  it('usa el precio de la base, descuenta el stock y lo devuelve al cancelar', async () => {
    const stockInicial = await stockDe(20);

    const creado = await crearPedido(cliente, {
      direccion_envio: '  Calle Falsa 123  ',
      items: [{ producto_id: 20, cantidad: '3', precio: 1 }],
    });

    expect(creado.status).toBe(201);
    expect(creado.body).toMatchObject({ total: 39999 * 3, estado: 'pendiente', direccion_envio: 'Calle Falsa 123' });
    expect(await stockDe(20)).toBe(stockInicial - 3);

    const ajeno = await api().delete(`/api/pedidos/${creado.body.id}`).set(conToken(maria));
    expect(ajeno.status).toBe(403);

    const cancelado = await api().delete(`/api/pedidos/${creado.body.id}`).set(conToken(cliente));
    expect(cancelado.status).toBe(200);
    expect(await stockDe(20)).toBe(stockInicial);
  });
});

describe('Gestión del administrador', () => {
  it('cambia el estado de un pedido y valida los valores', async () => {
    const invalido = await api()
      .put('/api/pedidos/26')
      .set(conToken(admin))
      .send({ estado: 'volando', direccion_envio: 'Calle 123' });
    expect(invalido.status).toBe(400);

    const enviado = await api()
      .put('/api/pedidos/26')
      .set(conToken(admin))
      .send({ estado: 'enviado', direccion_envio: 'San Martín 456, Rosario' });
    expect(enviado.status).toBe(200);
    expect(enviado.body.estado).toBe('enviado');
  });

  it('no deja eliminar un pedido que ya salió', async () => {
    const respuesta = await api().delete('/api/pedidos/26').set(conToken(admin));
    expect(respuesta.status).toBe(409);
  });
});
