import { randomUUID } from 'node:crypto';
import * as Pedido from '../models/pedido.model.js';
import { config } from '../config.js';
import { motivoDeRechazo, validarTarjeta } from '../utils/tarjetas.js';
import { firmaEsValida } from '../utils/firmaWebhook.js';
import * as MercadoPago from '../services/mercadoPago.js';

async function buscarPedidoParaPagar(req, res) {
  const pedido = await Pedido.obtenerPorId(req.params.pedidoId);

  if (!pedido) {
    res.status(404).json({ error: 'El pedido no existe' });
    return null;
  }
  if (pedido.usuario_id !== req.usuario.id) {
    res.status(403).json({ error: 'Solo el dueño del pedido lo puede pagar' });
    return null;
  }
  if (pedido.estado !== 'pendiente') {
    res.status(409).json({ error: 'Este pedido ya no está pendiente de pago' });
    return null;
  }
  if (pedido.segundos_para_pagar === 0) {
    res.status(409).json({ error: 'Se terminó el tiempo para pagar este pedido' });
    return null;
  }
  return pedido;
}

export function listarMedios(req, res) {
  res.json({ mercadopago: MercadoPago.estaConfigurado(), simulado: config.pagoSimulado });
}

export async function pagarSimulado(req, res) {
  if (!config.pagoSimulado) {
    return res.status(404).json({ error: 'El pago simulado no está habilitado' });
  }

  const pedido = await buscarPedidoParaPagar(req, res);
  if (!pedido) return;

  const error = validarTarjeta(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const motivo = motivoDeRechazo(req.body.titular);
  if (motivo) {
    return res.status(402).json({ error: `El pago fue rechazado: ${motivo}` });
  }

  const pagado = await Pedido.marcarPagado(pedido.id, {
    medio: 'simulado',
    pagoId: `SIM-${randomUUID().slice(0, 8).toUpperCase()}`,
  });
  if (!pagado) {
    return res.status(409).json({ error: 'Este pedido ya no está pendiente de pago' });
  }

  res.json(await Pedido.obtenerPorId(pedido.id));
}

export async function pagarConMercadoPago(req, res) {
  if (!MercadoPago.estaConfigurado()) {
    return res.status(404).json({ error: 'Mercado Pago no está configurado en esta tienda' });
  }

  const pedido = await buscarPedidoParaPagar(req, res);
  if (!pedido) return;

  const url = await MercadoPago.crearPreferencia(pedido);
  await Pedido.elegirMedioDePago(pedido.id, 'mercadopago');
  res.json({ url });
}

async function acreditarSiCorresponde(pago, pedido) {
  if (!MercadoPago.pagoCubrePedido(pago, pedido)) return false;

  const acreditado = await Pedido.marcarPagado(pedido.id, { medio: 'mercadopago', pagoId: String(pago.id) });
  if (!acreditado && pedido.estado === 'cancelado') {
    console.warn(`El pago ${pago.id} llegó con el pedido ${pedido.id} ya cancelado: hay que devolver el dinero`);
  }
  return acreditado;
}

export async function verificarMercadoPago(req, res) {
  const pedido = await Pedido.obtenerPorId(req.params.pedidoId);
  if (!pedido) {
    return res.status(404).json({ error: 'El pedido no existe' });
  }
  if (req.usuario.rol !== 'admin' && pedido.usuario_id !== req.usuario.id) {
    return res.status(403).json({ error: 'No podés ver un pedido de otro usuario' });
  }

  if (pedido.estado === 'pendiente' && pedido.medio_pago === 'mercadopago' && MercadoPago.estaConfigurado()) {
    const pago = await MercadoPago.buscarPagoAprobado(pedido.id);
    await acreditarSiCorresponde(pago, pedido);
  }

  res.json(await Pedido.obtenerPorId(pedido.id));
}

export async function recibirNotificacion(req, res) {
  if (!MercadoPago.estaConfigurado()) {
    return res.sendStatus(404);
  }

  const tipo = req.query.type ?? req.body.type;
  const dataId = req.query['data.id'] ?? req.body.data?.id;
  if (tipo !== 'payment' || !dataId) {
    return res.sendStatus(200);
  }

  const { secretoWebhook } = config.mercadoPago;
  if (secretoWebhook) {
    const valida = firmaEsValida({
      encabezado: req.get('x-signature'),
      requestId: req.get('x-request-id'),
      dataId: String(dataId),
      secreto: secretoWebhook,
    });
    if (!valida) {
      return res.sendStatus(401);
    }
  }

  const pago = await MercadoPago.obtenerPago(dataId);
  const pedidoId = Number(pago.external_reference);
  const pedido = Number.isInteger(pedidoId) ? await Pedido.obtenerPorId(pedidoId) : undefined;
  if (pedido) {
    await acreditarSiCorresponde(pago, pedido);
  }

  res.sendStatus(200);
}
