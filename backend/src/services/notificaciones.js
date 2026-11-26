import * as Pedido from '../models/pedido.model.js';
import { enviarCorreo } from './correo.js';
import { pedidoCancelado, pedidoEntregado, pedidoEnviado, pedidoPagado } from '../correos/mensajes.js';

const MENSAJES = {
  pagado: pedidoPagado,
  enviado: pedidoEnviado,
  entregado: pedidoEntregado,
  cancelado: pedidoCancelado,
};

export async function notificarPedido(pedidoId, opciones) {
  try {
    const pedido = await Pedido.obtenerPorId(pedidoId);
    const armarMensaje = MENSAJES[pedido?.estado];
    if (!armarMensaje) return;

    await enviarCorreo({ para: pedido.cliente_email, ...armarMensaje(pedido, opciones) });
  } catch (error) {
    console.error(`No se pudo avisar el cambio del pedido ${pedidoId}:`, error.message);
  }
}
