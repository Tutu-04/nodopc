import { cancelarVencidos } from './models/pedido.model.js';

const CADA_UN_MINUTO = 60 * 1000;

async function cancelarPedidosVencidos() {
  try {
    const cancelados = await cancelarVencidos();
    if (cancelados > 0) {
      console.log(`Se cancelaron ${cancelados} pedido(s) que no se pagaron a tiempo`);
    }
  } catch (error) {
    console.error('No se pudieron revisar los pedidos vencidos:', error.message);
  }
}

export function iniciarTareas() {
  cancelarPedidosVencidos();
  setInterval(cancelarPedidosVencidos, CADA_UN_MINUTO).unref();
}
