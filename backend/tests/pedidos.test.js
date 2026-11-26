import { beforeAll, describe, expect, it } from 'vitest';
import { reiniciarBase } from '../src/migraciones.js';
import { api, conSesion, ingresar, ingresarComoAdmin, ingresarComoCliente } from './ayudantes.js';

let admin;
let cliente;
let maria;

async function stockDe(id) {
  const respuesta = await api().get(`/api/productos/${id}`);
  return respuesta.body.stock;
}

const ENVIO_A_TUCUMAN = { metodo_entrega: 'envio', provincia: 'Tucumán', direccion_envio: 'Mitre 789' };

function crearPedido(token, datos) {
  return api().post('/api/pedidos').set(conSesion(token)).send(datos);
}

function cancelarPedido(token, id) {
  return api().post(`/api/pedidos/${id}/cancelar`).set(conSesion(token));
}

function cambiarPedido(id, datos) {
  return api().put(`/api/pedidos/${id}`).set(conSesion(admin)).send(datos);
}

beforeAll(async () => {
  await reiniciarBase();
  admin = await ingresarComoAdmin();
  cliente = await ingresarComoCliente();
  maria = await ingresar('maria@nodopc.com', 'cliente123');
});

describe('Consulta de pedidos', () => {
  it('cada cliente ve solo los suyos', async () => {
    const respuesta = await api().get('/api/pedidos/mios').set(conSesion(cliente));
    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toHaveLength(2);
    expect(respuesta.body[0].id).toBe(24);
  });

  it('el administrador ve todos', async () => {
    const respuesta = await api().get('/api/pedidos').set(conSesion(admin));
    expect(respuesta.body).toHaveLength(28);
  });

  it('un cliente no puede ver el detalle de un pedido ajeno', async () => {
    expect((await api().get('/api/pedidos/20').set(conSesion(cliente))).status).toBe(200);
    expect((await api().get('/api/pedidos/26').set(conSesion(cliente))).status).toBe(403);
    expect((await api().get('/api/pedidos/26').set(conSesion(admin))).status).toBe(200);
    expect((await api().get('/api/pedidos/999').set(conSesion(cliente))).status).toBe(404);
  });
});

describe('Creación de pedidos', () => {
  const unMouse = [{ producto_id: 20, cantidad: 1 }];

  it.each([
    ['sin método de entrega', { provincia: 'Tucumán', direccion_envio: 'Mitre 789', items: unMouse }],
    ['con un método inventado', { ...ENVIO_A_TUCUMAN, metodo_entrega: 'dron', items: unMouse }],
    ['con una provincia que no existe', { ...ENVIO_A_TUCUMAN, provincia: 'Narnia', items: unMouse }],
    ['a domicilio sin dirección', { metodo_entrega: 'envio', provincia: 'Tucumán', items: unMouse }],
    ['sin productos', { ...ENVIO_A_TUCUMAN, items: [] }],
    ['con cantidad 0', { ...ENVIO_A_TUCUMAN, items: [{ producto_id: 1, cantidad: 0 }] }],
    ['con un producto que no existe', { ...ENVIO_A_TUCUMAN, items: [{ producto_id: 9999, cantidad: 1 }] }],
  ])('rechaza un pedido %s', async (_caso, datos) => {
    const respuesta = await crearPedido(cliente, datos);
    expect(respuesta.status).toBe(400);
  });

  it('no descuenta nada si un producto no tiene stock suficiente', async () => {
    const respuesta = await crearPedido(cliente, {
      ...ENVIO_A_TUCUMAN,
      items: [
        { producto_id: 20, cantidad: 1 },
        { producto_id: 19, cantidad: 999 },
      ],
    });

    expect(respuesta.status).toBe(409);
    expect(await stockDe(20)).toBe(35);
  });

  it('usa el precio de la base, suma el envío de la zona y descuenta el stock', async () => {
    const stockInicial = await stockDe(20);

    const creado = await crearPedido(cliente, {
      ...ENVIO_A_TUCUMAN,
      direccion_envio: '  Calle Falsa 123  ',
      items: [{ producto_id: 20, cantidad: '3', precio: 1 }],
    });

    expect(creado.status).toBe(201);
    expect(creado.body).toMatchObject({
      estado: 'pendiente',
      metodo_entrega: 'envio',
      provincia: 'Tucumán',
      direccion_envio: 'Calle Falsa 123',
      costo_envio: 9500,
      total: 39999 * 3 + 9500,
    });
    expect(await stockDe(20)).toBe(stockInicial - 3);
  });

  it('no cobra envío al retirar en el local ni pide dirección', async () => {
    const creado = await crearPedido(cliente, {
      metodo_entrega: 'retiro',
      provincia: 'Tucumán',
      direccion_envio: 'Esto se ignora',
      items: unMouse,
    });

    expect(creado.status).toBe(201);
    expect(creado.body).toMatchObject({
      metodo_entrega: 'retiro',
      provincia: null,
      direccion_envio: null,
      costo_envio: 0,
      total: 39999,
    });
  });

  it('regala el envío desde el subtotal mínimo', async () => {
    const pcArmada = { producto_id: 15, cantidad: 1 };
    const abajo = await crearPedido(cliente, { ...ENVIO_A_TUCUMAN, items: [pcArmada] });
    const arriba = await crearPedido(cliente, {
      ...ENVIO_A_TUCUMAN,
      items: [pcArmada, { producto_id: 23, cantidad: 1 }],
    });

    expect(abajo.body).toMatchObject({ costo_envio: 9500, total: 1499999 + 9500 });
    expect(arriba.body).toMatchObject({ costo_envio: 0, total: 1499999 + 29999 });
  });

  it('deja el pedido reservado durante el tiempo para pagar', async () => {
    const creado = await crearPedido(cliente, { ...ENVIO_A_TUCUMAN, items: unMouse });
    const minutos = (new Date(creado.body.vence_en) - new Date(creado.body.fecha)) / 60000;

    expect(minutos).toBeCloseTo(30, 0);
    expect(creado.body.segundos_para_pagar).toBeGreaterThan(29 * 60);
  });
});

describe('Compras al mismo tiempo', () => {
  it('no venden más unidades de las que hay en stock', async () => {
    const stockInicial = await stockDe(19);
    const compras = Array.from({ length: stockInicial + 3 }, () =>
      crearPedido(cliente, { ...ENVIO_A_TUCUMAN, items: [{ producto_id: 19, cantidad: 1 }] })
    );

    const respuestas = await Promise.all(compras);
    const aprobadas = respuestas.filter((respuesta) => respuesta.status === 201);
    const rechazadas = respuestas.filter((respuesta) => respuesta.status === 409);

    expect(aprobadas).toHaveLength(stockInicial);
    expect(rechazadas).toHaveLength(3);
    expect(await stockDe(19)).toBe(0);
  });
});

describe('Cancelación', () => {
  it('el cliente cancela su pedido pendiente y el stock vuelve', async () => {
    const stockInicial = await stockDe(21);
    const creado = await crearPedido(cliente, { ...ENVIO_A_TUCUMAN, items: [{ producto_id: 21, cantidad: 2 }] });
    expect(await stockDe(21)).toBe(stockInicial - 2);

    expect((await cancelarPedido(maria, creado.body.id)).status).toBe(403);

    const cancelado = await cancelarPedido(cliente, creado.body.id);
    expect(cancelado.status).toBe(200);
    expect(cancelado.body).toMatchObject({ estado: 'cancelado', vence_en: null });
    expect(await stockDe(21)).toBe(stockInicial);

    expect((await cancelarPedido(cliente, creado.body.id)).status).toBe(409);
    expect(await stockDe(21)).toBe(stockInicial);
  });

  it('el cliente no puede cancelar un pedido que ya pagó, el administrador sí', async () => {
    const stockInicial = await stockDe(22);

    expect((await cancelarPedido(cliente, 24)).status).toBe(409);

    const cancelado = await cancelarPedido(admin, 24);
    expect(cancelado.status).toBe(200);
    expect(await stockDe(22)).toBe(stockInicial + 1);
  });

  it('nadie puede cancelar un pedido que ya salió', async () => {
    expect((await cancelarPedido(admin, 27)).status).toBe(409);
    expect((await cancelarPedido(admin, 1)).status).toBe(409);
  });
});

describe('Gestión del administrador', () => {
  it('rechaza estados que no existen', async () => {
    const respuesta = await cambiarPedido(26, { estado: 'volando' });
    expect(respuesta.status).toBe(400);
  });

  it('sigue el recorrido de un envío: pagado, enviado y entregado', async () => {
    expect((await cambiarPedido(26, { estado: 'entregado' })).status).toBe(409);
    expect((await cambiarPedido(26, { estado: 'pendiente' })).status).toBe(409);

    const enviado = await cambiarPedido(26, { estado: 'enviado' });
    expect(enviado.status).toBe(200);
    expect(enviado.body).toMatchObject({ estado: 'enviado', estados_siguientes: ['entregado'] });

    const entregado = await cambiarPedido(26, { estado: 'entregado' });
    expect(entregado.body).toMatchObject({ estado: 'entregado', estados_siguientes: [] });
  });

  it('un retiro en el local pasa de pagado a entregado sin envío', async () => {
    const creado = await crearPedido(cliente, { metodo_entrega: 'retiro', items: [{ producto_id: 23, cantidad: 1 }] });

    const pagado = await cambiarPedido(creado.body.id, { estado: 'pagado' });
    expect(pagado.status).toBe(200);
    expect(pagado.body.pagado_en).not.toBeNull();
    expect(pagado.body.estados_siguientes).toEqual(['entregado']);

    expect((await cambiarPedido(creado.body.id, { estado: 'enviado' })).status).toBe(409);
    expect((await cambiarPedido(creado.body.id, { estado: 'entregado' })).status).toBe(200);
  });

  it('cancelar se hace con su propia ruta para devolver el stock', async () => {
    const respuesta = await cambiarPedido(28, { estado: 'cancelado' });
    expect(respuesta.status).toBe(409);
  });

  it('corrige la dirección solo mientras el pedido no salió', async () => {
    const corregido = await cambiarPedido(28, { direccion_envio: 'Rivadavia 2200, Buenos Aires' });
    expect(corregido.status).toBe(200);
    expect(corregido.body).toMatchObject({ estado: 'pagado', direccion_envio: 'Rivadavia 2200, Buenos Aires' });

    expect((await cambiarPedido(28, { direccion_envio: 'abc' })).status).toBe(400);
    expect((await cambiarPedido(27, { direccion_envio: 'Otra dirección 123' })).status).toBe(409);
  });

  it('elimina solo pedidos cancelados', async () => {
    expect((await api().delete('/api/pedidos/27').set(conSesion(admin))).status).toBe(409);

    const eliminado = await api().delete('/api/pedidos/25').set(conSesion(admin));
    expect(eliminado.status).toBe(200);
    expect((await api().get('/api/pedidos/25').set(conSesion(admin))).status).toBe(404);
  });
});
