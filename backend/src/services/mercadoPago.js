import { randomUUID } from 'node:crypto';
import { config } from '../config.js';

const API = 'https://api.mercadopago.com';

function crearError(status, mensaje) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

async function llamar(ruta, { metodo = 'GET', cuerpo } = {}) {
  let respuesta;
  try {
    respuesta = await fetch(API + ruta, {
      method: metodo,
      headers: {
        Authorization: `Bearer ${config.mercadoPago.accessToken}`,
        'Content-Type': 'application/json',
        ...(metodo === 'POST' && { 'X-Idempotency-Key': randomUUID() }),
      },
      body: cuerpo && JSON.stringify(cuerpo),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw crearError(502, 'No se pudo conectar con Mercado Pago. Probá de nuevo en unos minutos.');
  }

  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    console.error(`Mercado Pago respondió ${respuesta.status} en ${ruta}:`, datos.message ?? datos);
    throw crearError(502, 'Mercado Pago rechazó la operación. Probá de nuevo en unos minutos.');
  }
  return datos;
}

export function estaConfigurado() {
  return Boolean(config.mercadoPago.accessToken);
}

function esCredencialDePrueba() {
  return config.mercadoPago.accessToken.startsWith('TEST-');
}

function armarItems(pedido) {
  const items = pedido.items.map((item) => ({
    id: String(item.producto_id ?? 'producto'),
    title: item.producto_nombre,
    quantity: item.cantidad,
    unit_price: Number(item.precio_unitario),
    currency_id: 'ARS',
  }));

  if (pedido.costo_envio > 0) {
    items.push({
      id: 'envio',
      title: `Envío a ${pedido.provincia}`,
      quantity: 1,
      unit_price: Number(pedido.costo_envio),
      currency_id: 'ARS',
    });
  }
  return items;
}

export async function crearPreferencia(pedido) {
  const urlDelPedido = `${config.frontendUrl}/pedidos/${pedido.id}`;
  const venceEn = new Date(Date.now() + pedido.segundos_para_pagar * 1000);

  const preferencia = {
    external_reference: String(pedido.id),
    items: armarItems(pedido),
    payer: { name: pedido.cliente, email: pedido.cliente_email },
    back_urls: {
      success: `${urlDelPedido}?pago=aprobado`,
      pending: `${urlDelPedido}?pago=pendiente`,
      failure: `${urlDelPedido}?pago=rechazado`,
    },
    statement_descriptor: 'NODOPC',
    expires: true,
    expiration_date_to: venceEn.toISOString().replace('Z', '+00:00'),
  };

  if (config.frontendUrl.startsWith('https://')) {
    preferencia.auto_return = 'approved';
  }
  if (config.apiPublicaUrl) {
    preferencia.notification_url = `${config.apiPublicaUrl}/api/pagos/webhook`;
  }

  const datos = await llamar('/checkout/preferences', { metodo: 'POST', cuerpo: preferencia });
  return esCredencialDePrueba() ? datos.sandbox_init_point : datos.init_point;
}

export function obtenerPago(id) {
  return llamar(`/v1/payments/${encodeURIComponent(id)}`);
}

export async function buscarPagoAprobado(pedidoId) {
  const parametros = new URLSearchParams({
    external_reference: String(pedidoId),
    status: 'approved',
    sort: 'date_created',
    criteria: 'desc',
  });
  const datos = await llamar(`/v1/payments/search?${parametros}`);
  return datos.results?.[0] ?? null;
}

export function pagoCubrePedido(pago, pedido) {
  return (
    pago?.status === 'approved' &&
    String(pago.external_reference) === String(pedido.id) &&
    pago.currency_id === 'ARS' &&
    Number(pago.transaction_amount) === Number(pedido.total)
  );
}
