import { randomUUID } from 'node:crypto';
import * as Pedido from '../models/pedido.model.js';
import { config } from '../config.js';
import { motivoDeRechazo, validarTarjeta } from '../utils/tarjetas.js';

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
  res.json({ simulado: config.pagoSimulado });
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
