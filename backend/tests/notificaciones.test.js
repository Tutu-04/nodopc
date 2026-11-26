import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { reiniciarBase } from '../src/migraciones.js';
import { enviarCorreo } from '../src/services/correo.js';
import pool from '../src/db.js';
import { cancelarVencidos } from '../src/models/pedido.model.js';
import { notificarPedido } from '../src/services/notificaciones.js';
import { api, conSesion, ingresarComoAdmin, ingresarComoCliente } from './ayudantes.js';

vi.mock('../src/services/correo.js', () => ({ enviarCorreo: vi.fn(async () => true) }));

function correosA(email) {
  return vi
    .mocked(enviarCorreo)
    .mock.calls.map(([correo]) => correo)
    .filter((correo) => correo.para === email);
}

const CLIENTE = 'cliente@nodopc.com';
const TARJETA = { numero: '4509 9535 6623 3704', titular: 'APRO', vencimiento: '12/30', cvv: '123' };

let admin;
let cliente;

async function crearPedido(datos = { metodo_entrega: 'envio', provincia: 'Tucumán', direccion_envio: 'Mitre 789' }) {
  const respuesta = await api()
    .post('/api/pedidos')
    .set(conSesion(cliente))
    .send({ ...datos, items: [{ producto_id: 20, cantidad: 2 }] });
  return respuesta.body;
}

function pagar(pedidoId) {
  return api().post(`/api/pagos/${pedidoId}/simulado`).set(conSesion(cliente)).send(TARJETA);
}

function cambiarEstado(pedidoId, estado) {
  return api().put(`/api/pedidos/${pedidoId}`).set(conSesion(admin)).send({ estado });
}

async function esperarCorreo(email, asunto) {
  await vi.waitFor(() => expect(correosA(email).map((correo) => correo.asunto)).toContain(asunto));
  return correosA(email).find((correo) => correo.asunto === asunto);
}

beforeAll(async () => {
  await reiniciarBase();
  admin = await ingresarComoAdmin();
  cliente = await ingresarComoCliente();
});

beforeEach(() => {
  vi.mocked(enviarCorreo).mockClear();
});

describe('Correo de bienvenida', () => {
  it('se manda al registrarse y saluda por el nombre', async () => {
    const respuesta = await api()
      .post('/api/auth/registro')
      .send({ nombre: 'Ana <b>Pérez</b>', email: 'ana@example.com', password: 'clave1234' });
    expect(respuesta.status).toBe(201);

    const [correo] = correosA('ana@example.com');
    expect(correo.asunto).toBe('Te damos la bienvenida a NodoPC');
    expect(correo.html).toContain('¡Hola, Ana!');
    expect(correo.texto).toContain('http://localhost:5173/catalogo');
  });

  it('no se manda si el registro falla', async () => {
    await api().post('/api/auth/registro').send({ nombre: 'Ana', email: 'ana@example.com', password: 'clave1234' });
    expect(enviarCorreo).not.toHaveBeenCalled();
  });
});

describe('Correos de cada pedido', () => {
  it('avisa el pago con el detalle y el próximo paso del envío', async () => {
    const pedido = await crearPedido();
    expect(correosA(CLIENTE)).toHaveLength(0);

    await pagar(pedido.id);
    const correo = await esperarCorreo(CLIENTE, `Recibimos el pago de tu pedido #${pedido.id}`);

    expect(correo.texto).toContain('2 × Mouse Logitech G203 Lightsync');
    expect(correo.texto).toContain('Envío: $');
    expect(correo.texto).toContain('Te avisamos cuando lo despachemos a Mitre 789, Tucumán.');
    expect(correo.texto).toContain(`http://localhost:5173/pedidos/${pedido.id}`);
  });

  it('a un retiro le dice dónde pasar a buscarlo', async () => {
    const pedido = await crearPedido({ metodo_entrega: 'retiro' });
    await pagar(pedido.id);

    const correo = await esperarCorreo(CLIENTE, `Recibimos el pago de tu pedido #${pedido.id}`);
    expect(correo.texto).toContain('Ya podés pasar a retirarlo por Av. Mate de Luna 1850');
    expect(correo.texto).toContain('Envío: Gratis');
  });

  it('avisa cuando el pedido sale y cuando llega', async () => {
    const pedido = await crearPedido();
    await pagar(pedido.id);

    await cambiarEstado(pedido.id, 'enviado');
    await esperarCorreo(CLIENTE, `Tu pedido #${pedido.id} está en camino`);

    await cambiarEstado(pedido.id, 'entregado');
    await esperarCorreo(CLIENTE, `Entregamos tu pedido #${pedido.id}`);
  });

  it('no manda nada si el estado no cambia', async () => {
    await api().put('/api/pedidos/28').set(conSesion(admin)).send({ direccion_envio: 'Rivadavia 2300, Buenos Aires' });
    await notificarPedido(9999);

    expect(enviarCorreo).not.toHaveBeenCalled();
  });

  it('explica por qué se canceló y si hay que devolver el dinero', async () => {
    const delCliente = await crearPedido();
    await api().post(`/api/pedidos/${delCliente.id}/cancelar`).set(conSesion(cliente));
    const correoCliente = await esperarCorreo(CLIENTE, `Tu pedido #${delCliente.id} fue cancelado`);
    expect(correoCliente.texto).toContain(`Cancelaste tu pedido #${delCliente.id}.`);
    expect(correoCliente.texto).toContain('volvieron al catálogo');

    const pagado = await crearPedido();
    await pagar(pagado.id);
    await api().post(`/api/pedidos/${pagado.id}/cancelar`).set(conSesion(admin));
    const correoTienda = await esperarCorreo(CLIENTE, `Tu pedido #${pagado.id} fue cancelado`);
    expect(correoTienda.texto).toContain('Tuvimos que cancelar');
    expect(correoTienda.texto).toContain('Te vamos a devolver el dinero');
  });

  it('avisa los pedidos que se cancelan por no pagarse a tiempo', async () => {
    const pedido = await crearPedido();
    await pool.execute('UPDATE pedidos SET vence_en = NOW() - INTERVAL 1 MINUTE WHERE id = ?', [pedido.id]);

    const cancelados = await cancelarVencidos();
    await Promise.all(cancelados.map((id) => notificarPedido(id, { motivo: 'vencido' })));

    const [correo] = correosA(CLIENTE);
    expect(correo.texto).toContain('porque no se pagó dentro del tiempo de reserva');
  });
});
