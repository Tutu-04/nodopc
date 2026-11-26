import { randomUUID } from 'node:crypto';
import { config } from '../config.js';
import type { ErrorConStatus, PedidoConItems } from '../tipos.js';

const API = 'https://api.mercadopago.com';

export interface PagoDeMercadoPago {
  id: number;
  status: string;
  external_reference: string | null;
  currency_id: string;
  transaction_amount: number;
}

interface ItemDePreferencia {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: 'ARS';
}

interface Preferencia {
  external_reference: string;
  items: ItemDePreferencia[];
  payer: { name: string; email: string };
  back_urls: { success: string; pending: string; failure: string };
  statement_descriptor: string;
  expires: boolean;
  expiration_date_to: string;
  auto_return?: 'approved';
  notification_url?: string;
}

function crearError(status: number, mensaje: string): ErrorConStatus {
  const error: ErrorConStatus = new Error(mensaje);
  error.status = status;
  return error;
}

async function llamar<T>(
  ruta: string,
  { metodo = 'GET', cuerpo }: { metodo?: string; cuerpo?: unknown } = {}
): Promise<T> {
  let respuesta: Response;
  try {
    respuesta = await fetch(API + ruta, {
      method: metodo,
      headers: {
        Authorization: `Bearer ${config.mercadoPago.accessToken}`,
        'Content-Type': 'application/json',
        ...(metodo === 'POST' && { 'X-Idempotency-Key': randomUUID() }),
      },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw crearError(502, 'No se pudo conectar con Mercado Pago. Probá de nuevo en unos minutos.');
  }

  const datos = (await respuesta.json().catch(() => ({}))) as T & { message?: string };
  if (!respuesta.ok) {
    console.error(`Mercado Pago respondió ${respuesta.status} en ${ruta}:`, datos.message ?? datos);
    throw crearError(502, 'Mercado Pago rechazó la operación. Probá de nuevo en unos minutos.');
  }
  return datos;
}

export function estaConfigurado(): boolean {
  return Boolean(config.mercadoPago.accessToken);
}

function esCredencialDePrueba(): boolean {
  return config.mercadoPago.accessToken.startsWith('TEST-');
}

function armarItems(pedido: PedidoConItems): ItemDePreferencia[] {
  const items: ItemDePreferencia[] = pedido.items.map((item) => ({
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

export async function crearPreferencia(pedido: PedidoConItems): Promise<string> {
  const urlDelPedido = `${config.frontendUrl}/pedidos/${pedido.id}`;
  const venceEn = new Date(Date.now() + (pedido.segundos_para_pagar ?? 0) * 1000);

  const preferencia: Preferencia = {
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

  const datos = await llamar<{ init_point: string; sandbox_init_point: string }>('/checkout/preferences', {
    metodo: 'POST',
    cuerpo: preferencia,
  });
  return esCredencialDePrueba() ? datos.sandbox_init_point : datos.init_point;
}

export function obtenerPago(id: string | number): Promise<PagoDeMercadoPago> {
  return llamar<PagoDeMercadoPago>(`/v1/payments/${encodeURIComponent(id)}`);
}

export async function buscarPagoAprobado(pedidoId: number): Promise<PagoDeMercadoPago | null> {
  const parametros = new URLSearchParams({
    external_reference: String(pedidoId),
    status: 'approved',
    sort: 'date_created',
    criteria: 'desc',
  });
  const datos = await llamar<{ results?: PagoDeMercadoPago[] }>(`/v1/payments/search?${parametros}`);
  return datos.results?.[0] ?? null;
}

export function pagoCubrePedido(pago: PagoDeMercadoPago | null, pedido: PedidoConItems): pago is PagoDeMercadoPago {
  return (
    pago?.status === 'approved' &&
    String(pago.external_reference) === String(pedido.id) &&
    pago.currency_id === 'ARS' &&
    Number(pago.transaction_amount) === Number(pedido.total)
  );
}
