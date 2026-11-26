import { beforeAll, describe, expect, it } from 'vitest';
import pool from '../src/db.js';
import { reiniciarBase } from '../src/migraciones.js';
import { pasaLuhn, venceEnElFuturo } from '../src/utils/tarjetas.js';
import { api, conSesion, ingresar, ingresarComoCliente } from './ayudantes.js';

const TARJETA = { numero: '4509 9535 6623 3704', titular: 'APRO', vencimiento: '12/30', cvv: '123' };

let cliente: string;
let maria: string;

async function crearPedido() {
  const respuesta = await api()
    .post('/api/pedidos')
    .set(conSesion(cliente))
    .send({ metodo_entrega: 'retiro', items: [{ producto_id: 23, cantidad: 1 }] });
  return respuesta.body;
}

function pagarSimulado(token: string, pedidoId: number, tarjeta: Record<string, string> = TARJETA) {
  return api().post(`/api/pagos/${pedidoId}/simulado`).set(conSesion(token)).send(tarjeta);
}

beforeAll(async () => {
  await reiniciarBase();
  cliente = await ingresarComoCliente();
  maria = await ingresar('maria@nodopc.com', 'cliente123');
});

describe('Validación de tarjetas', () => {
  it('controla el dígito verificador del número', () => {
    expect(pasaLuhn('4509953566233704')).toBe(true);
    expect(pasaLuhn('5031755734530604')).toBe(true);
    expect(pasaLuhn('4509953566233705')).toBe(false);
    expect(pasaLuhn('4509')).toBe(false);
  });

  it('acepta un vencimiento desde el mes en curso', () => {
    const hoy = new Date(2026, 10, 20);
    expect(venceEnElFuturo('11/26', hoy)).toBe(true);
    expect(venceEnElFuturo('01/27', hoy)).toBe(true);
    expect(venceEnElFuturo('10/26', hoy)).toBe(false);
    expect(venceEnElFuturo('13/30', hoy)).toBe(false);
    expect(venceEnElFuturo('1230', hoy)).toBe(false);
  });
});

describe('GET /api/pagos/medios', () => {
  it('informa qué medios de pago están habilitados', async () => {
    const respuesta = await api().get('/api/pagos/medios');
    expect(respuesta.body).toMatchObject({ simulado: true });
  });
});

describe('Pago simulado', () => {
  it('pide sesión y solo deja pagar al dueño del pedido', async () => {
    const pedido = await crearPedido();

    expect((await api().post(`/api/pagos/${pedido.id}/simulado`).send(TARJETA)).status).toBe(401);
    expect((await pagarSimulado(maria, pedido.id)).status).toBe(403);
    expect((await pagarSimulado(cliente, 9999)).status).toBe(404);
  });

  it.each([
    ['un número que no pasa la verificación', { numero: '4509 9535 6623 3705' }],
    ['sin titular', { titular: '' }],
    ['una tarjeta vencida', { vencimiento: '01/20' }],
    ['un código de seguridad corto', { cvv: '12' }],
  ])('rechaza %s', async (_caso, cambio) => {
    const pedido = await crearPedido();
    const respuesta = await pagarSimulado(cliente, pedido.id, { ...TARJETA, ...cambio });
    expect(respuesta.status).toBe(400);
  });

  it('simula un rechazo del banco con los titulares de prueba', async () => {
    const pedido = await crearPedido();
    const respuesta = await pagarSimulado(cliente, pedido.id, { ...TARJETA, titular: 'fund' });

    expect(respuesta.status).toBe(402);
    expect(respuesta.body.error).toMatch(/fondos insuficientes/);

    const despues = await api().get(`/api/pedidos/${pedido.id}`).set(conSesion(cliente));
    expect(despues.body.estado).toBe('pendiente');
  });

  it('aprueba el pago, marca el pedido como pagado y no deja pagarlo dos veces', async () => {
    const pedido = await crearPedido();
    const respuesta = await pagarSimulado(cliente, pedido.id);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toMatchObject({ estado: 'pagado', medio_pago: 'simulado', vence_en: null });
    expect(respuesta.body.pago_id).toMatch(/^SIM-[0-9A-F]{8}$/);
    expect(respuesta.body.pagado_en).not.toBeNull();

    expect((await pagarSimulado(cliente, pedido.id)).status).toBe(409);
  });

  it('no deja pagar un pedido cuyo plazo venció', async () => {
    const pedido = await crearPedido();
    await pool.execute('UPDATE pedidos SET vence_en = NOW() - INTERVAL 1 MINUTE WHERE id = ?', [pedido.id]);

    const respuesta = await pagarSimulado(cliente, pedido.id);
    expect(respuesta.status).toBe(409);
    expect(respuesta.body.error).toMatch(/tiempo para pagar/);
  });
});
