import { armarCorreo, enlace } from './plantilla.js';
import { LOCAL } from '../utils/tienda.js';

function primerNombre(nombre) {
  return String(nombre).trim().split(/\s+/)[0];
}

export function bienvenida(usuario) {
  return {
    asunto: 'Te damos la bienvenida a NodoPC',
    ...armarCorreo({
      titulo: `¡Hola, ${primerNombre(usuario.nombre)}!`,
      parrafos: [
        'Tu cuenta en NodoPC ya está lista.',
        'Desde tu panel vas a poder seguir tus pedidos, pagarlos y cambiar tus datos cuando quieras.',
      ],
      boton: { texto: 'Ir al catálogo', url: enlace('/catalogo') },
      notaFinal: 'Si no creaste esta cuenta, podés ignorar este correo.',
    }),
  };
}

const formatoPrecio = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

function precio(numero) {
  return formatoPrecio.format(numero);
}

function detalleDelPedido(pedido) {
  return [
    ...pedido.items.map((item) => [
      `${item.cantidad} × ${item.producto_nombre}`,
      precio(item.cantidad * item.precio_unitario),
    ]),
    ['Envío', pedido.costo_envio > 0 ? precio(pedido.costo_envio) : 'Gratis'],
    ['Total', precio(pedido.total)],
  ];
}

function botonDelPedido(pedido) {
  return { texto: 'Ver el pedido', url: enlace(`/pedidos/${pedido.id}`) };
}

function destino(pedido) {
  return `${pedido.direccion_envio}, ${pedido.provincia}`;
}

export function pedidoPagado(pedido) {
  const proximoPaso =
    pedido.metodo_entrega === 'envio'
      ? `Te avisamos cuando lo despachemos a ${destino(pedido)}.`
      : `Ya podés pasar a retirarlo por ${LOCAL.direccion}, de ${LOCAL.horario}.`;

  return {
    asunto: `Recibimos el pago de tu pedido #${pedido.id}`,
    ...armarCorreo({
      titulo: '¡Pago acreditado!',
      parrafos: [
        `Hola, ${primerNombre(pedido.cliente)}. Ya acreditamos el pago de tu pedido #${pedido.id}.`,
        proximoPaso,
      ],
      tabla: detalleDelPedido(pedido),
      boton: botonDelPedido(pedido),
    }),
  };
}

export function pedidoEnviado(pedido) {
  return {
    asunto: `Tu pedido #${pedido.id} está en camino`,
    ...armarCorreo({
      titulo: 'Tu pedido está en camino',
      parrafos: [`Hola, ${primerNombre(pedido.cliente)}. Despachamos tu pedido #${pedido.id} a ${destino(pedido)}.`],
      boton: botonDelPedido(pedido),
    }),
  };
}

export function pedidoEntregado(pedido) {
  const retiro = pedido.metodo_entrega === 'retiro';
  return {
    asunto: retiro ? `Retiraste tu pedido #${pedido.id}` : `Entregamos tu pedido #${pedido.id}`,
    ...armarCorreo({
      titulo: retiro ? '¡Gracias por pasar!' : '¡Tu pedido llegó!',
      parrafos: [
        `Hola, ${primerNombre(pedido.cliente)}. Tu pedido #${pedido.id} ya está en tus manos.`,
        'Todos los productos tienen garantía oficial. Si algo no funciona como esperabas, respondé este correo.',
      ],
      boton: botonDelPedido(pedido),
    }),
  };
}

const MOTIVOS_DE_CANCELACION = {
  cliente: (pedido) => `Cancelaste tu pedido #${pedido.id}.`,
  tienda: (pedido) => `Tuvimos que cancelar tu pedido #${pedido.id}.`,
  vencido: (pedido) => `Cancelamos tu pedido #${pedido.id} porque no se pagó dentro del tiempo de reserva.`,
};

export function pedidoCancelado(pedido, { motivo = 'tienda', estabaPagado = false } = {}) {
  const parrafos = [`Hola, ${primerNombre(pedido.cliente)}. ${MOTIVOS_DE_CANCELACION[motivo](pedido)}`];
  if (estabaPagado) {
    parrafos.push('Te vamos a devolver el dinero por el mismo medio con el que pagaste.');
  } else {
    parrafos.push('Los productos volvieron al catálogo. Si todavía los querés, podés hacer el pedido de nuevo.');
  }

  return {
    asunto: `Tu pedido #${pedido.id} fue cancelado`,
    ...armarCorreo({
      titulo: 'Pedido cancelado',
      parrafos,
      boton: { texto: 'Ir al catálogo', url: enlace('/catalogo') },
    }),
  };
}

export function recuperarPassword(usuario, { url, minutos }) {
  return {
    asunto: 'Restablecé tu contraseña de NodoPC',
    ...armarCorreo({
      titulo: 'Restablecer la contraseña',
      parrafos: [
        `Hola, ${primerNombre(usuario.nombre)}. Pediste restablecer la contraseña de tu cuenta.`,
        `Usá el botón para elegir una nueva. El enlace sirve una sola vez y vence en ${minutos} minutos.`,
      ],
      boton: { texto: 'Elegir una contraseña nueva', url },
      notaFinal: 'Si no lo pediste vos, ignorá este correo: tu contraseña no cambia.',
    }),
  };
}
