import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { config } from '../src/config.js';
import { reiniciarBase } from '../src/migraciones.js';
import { api, conSesion, ingresar, ingresarComoCliente } from './ayudantes.js';

let cliente;
let maria;

function responder(datos, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(datos), { status }));
}

function simularMercadoPago(respuestas) {
  const fetchFalso = vi.fn((url) => {
    const ruta = new URL(url).pathname;
    const [, respuesta] = Object.entries(respuestas).find(([prefijo]) => ruta.startsWith(prefijo)) ?? [];
    return respuesta ? responder(...respuesta) : responder({ message: 'not found' }, 404);
  });
  vi.stubGlobal('fetch', fetchFalso);
  return fetchFalso;
}

function pagoAprobado(pedido, cambios = {}) {
  return {
    id: 1324567890,
    status: 'approved',
    external_reference: String(pedido.id),
    currency_id: 'ARS',
    transaction_amount: pedido.total,
    ...cambios,
  };
}

async function crearPedido() {
  const respuesta = await api()
    .post('/api/pedidos')
    .set(conSesion(cliente))
    .send({
      metodo_entrega: 'envio',
      provincia: 'Tucumán',
      direccion_envio: 'Mitre 789',
      items: [{ producto_id: 20, cantidad: 2 }],
    });
  return respuesta.body;
}

async function pedirPreferencia(pedidoId, token = cliente) {
  return api().post(`/api/pagos/${pedidoId}/mercadopago`).set(conSesion(token));
}

async function estadoDe(pedidoId) {
  const respuesta = await api().get(`/api/pedidos/${pedidoId}`).set(conSesion(cliente));
  return respuesta.body;
}

beforeAll(async () => {
  await reiniciarBase();
  cliente = await ingresarComoCliente();
  maria = await ingresar('maria@nodopc.com', 'cliente123');
  config.mercadoPago.accessToken = 'TEST-token-de-prueba';
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

afterAll(() => {
  config.mercadoPago.accessToken = '';
});

describe('Checkout de Mercado Pago', () => {
  it('aparece como medio de pago cuando hay credenciales', async () => {
    const respuesta = await api().get('/api/pagos/medios');
    expect(respuesta.body).toEqual({ mercadopago: true, simulado: true });
  });

  it('crea la preferencia con los productos, el envío y las URLs de vuelta', async () => {
    const fetchFalso = simularMercadoPago({
      '/checkout/preferences': [{ init_point: 'https://mp/real', sandbox_init_point: 'https://mp/prueba' }],
    });
    const pedido = await crearPedido();

    expect((await pedirPreferencia(pedido.id, maria)).status).toBe(403);

    const respuesta = await pedirPreferencia(pedido.id);
    expect(respuesta.status).toBe(200);
    expect(respuesta.body.url).toBe('https://mp/prueba');

    const [url, opciones] = fetchFalso.mock.calls[0];
    const enviada = JSON.parse(opciones.body);
    expect(url).toBe('https://api.mercadopago.com/checkout/preferences');
    expect(opciones.headers.Authorization).toBe('Bearer TEST-token-de-prueba');
    expect(enviada.external_reference).toBe(String(pedido.id));
    expect(enviada.items).toEqual([
      expect.objectContaining({ title: 'Mouse Logitech G203 Lightsync', quantity: 2, unit_price: 39999 }),
      expect.objectContaining({ id: 'envio', quantity: 1, unit_price: 9500 }),
    ]);
    expect(enviada.back_urls.success).toBe(`http://localhost:5173/pedidos/${pedido.id}?pago=aprobado`);
    expect(enviada.auto_return).toBeUndefined();
    expect((await estadoDe(pedido.id)).medio_pago).toBe('mercadopago');
  });

  it('avisa con un error claro si Mercado Pago no responde', async () => {
    simularMercadoPago({ '/checkout/preferences': [{ message: 'invalid' }, 500] });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const pedido = await crearPedido();

    const respuesta = await pedirPreferencia(pedido.id);
    expect(respuesta.status).toBe(502);
    expect(respuesta.body.error).toMatch(/Mercado Pago/);
  });
});

describe('Confirmación del pago', () => {
  async function pedidoConPreferencia() {
    simularMercadoPago({ '/checkout/preferences': [{ sandbox_init_point: 'https://mp/prueba' }] });
    const pedido = await crearPedido();
    await pedirPreferencia(pedido.id);
    vi.unstubAllGlobals();
    return pedido;
  }

  it('al volver de Mercado Pago busca el pago y acredita el pedido', async () => {
    const pedido = await pedidoConPreferencia();
    simularMercadoPago({ '/v1/payments/search': [{ results: [pagoAprobado(pedido)] }] });

    const respuesta = await api().post(`/api/pagos/${pedido.id}/verificar`).set(conSesion(cliente));
    expect(respuesta.body).toMatchObject({ estado: 'pagado', medio_pago: 'mercadopago', pago_id: '1324567890' });
  });

  it('no acredita un pago por un monto distinto al del pedido', async () => {
    const pedido = await pedidoConPreferencia();
    simularMercadoPago({
      '/v1/payments/search': [{ results: [pagoAprobado(pedido, { transaction_amount: 1 })] }],
    });

    const respuesta = await api().post(`/api/pagos/${pedido.id}/verificar`).set(conSesion(cliente));
    expect(respuesta.body.estado).toBe('pendiente');
  });
});

describe('Sin credenciales', () => {
  it('Mercado Pago no se ofrece ni se puede usar', async () => {
    const pedido = await crearPedido();
    config.mercadoPago.accessToken = '';

    expect((await api().get('/api/pagos/medios')).body.mercadopago).toBe(false);
    expect((await pedirPreferencia(pedido.id)).status).toBe(404);

    config.mercadoPago.accessToken = 'TEST-token-de-prueba';
  });
});
