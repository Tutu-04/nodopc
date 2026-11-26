import * as Pedido from '../models/pedido.model.js';
import { enviarCorreo } from './correo.js';
import { pedidoCancelado, pedidoEntregado, pedidoEnviado, pedidoPagado } from '../correos/mensajes.js';
import type { Mensaje, OpcionesDeCancelacion } from '../correos/mensajes.js';
import type { EstadoPedido, PedidoConItems } from '../tipos.js';

const MENSAJES: Partial<Record<EstadoPedido, (pedido: PedidoConItems, opciones?: OpcionesDeCancelacion) => Mensaje>> = {
  pagado: pedidoPagado,
  enviado: pedidoEnviado,
  entregado: pedidoEntregado,
  cancelado: pedidoCancelado,
};

export async function notificarPedido(pedidoId: number, opciones?: OpcionesDeCancelacion): Promise<void> {
  try {
    const pedido = await Pedido.obtenerPorId(pedidoId);
    const armarMensaje = pedido && MENSAJES[pedido.estado];
    if (!pedido || !armarMensaje) return;

    await enviarCorreo({ para: pedido.cliente_email, ...armarMensaje(pedido, opciones) });
  } catch (error) {
    console.error(`No se pudo avisar el cambio del pedido ${pedidoId}:`, (error as Error).message);
  }
}
