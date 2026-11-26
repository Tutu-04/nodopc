import { armarCorreo, enlace } from './plantilla.js';
import type { CorreoArmado } from './plantilla.js';
import type { PedidoConItems } from '../tipos.js';
import { LOCAL } from '../utils/tienda.js';

export interface Mensaje extends CorreoArmado {
  asunto: string;
}

interface Destinatario {
  nombre: string;
}

export type MotivoDeCancelacion = 'cliente' | 'tienda' | 'vencido';

function primerNombre(nombre: string): string {
  return nombre.trim().split(/\s+/)[0];
}

export function bienvenida(usuario: Destinatario): Mensaje {
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

function precio(numero: number): string {
  return formatoPrecio.format(numero);
}

function detalleDelPedido(pedido: PedidoConItems): [string, string][] {
  return [
    ...pedido.items.map((item): [string, string] => [
      `${item.cantidad} × ${item.producto_nombre}`,
      precio(item.cantidad * item.precio_unitario),
    ]),
    ['Envío', pedido.costo_envio > 0 ? precio(pedido.costo_envio) : 'Gratis'],
    ['Total', precio(pedido.total)],
  ];
}

function botonDelPedido(pedido: PedidoConItems): { texto: string; url: string } {
  return { texto: 'Ver el pedido', url: enlace(`/pedidos/${pedido.id}`) };
}

function destino(pedido: PedidoConItems): string {
  return `${pedido.direccion_envio}, ${pedido.provincia}`;
}

export function pedidoPagado(pedido: PedidoConItems): Mensaje {
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

export function pedidoEnviado(pedido: PedidoConItems): Mensaje {
  return {
    asunto: `Tu pedido #${pedido.id} está en camino`,
    ...armarCorreo({
      titulo: 'Tu pedido está en camino',
      parrafos: [`Hola, ${primerNombre(pedido.cliente)}. Despachamos tu pedido #${pedido.id} a ${destino(pedido)}.`],
      boton: botonDelPedido(pedido),
    }),
  };
}

export function pedidoEntregado(pedido: PedidoConItems): Mensaje {
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

const MOTIVOS_DE_CANCELACION: Record<MotivoDeCancelacion, (pedido: PedidoConItems) => string> = {
  cliente: (pedido) => `Cancelaste tu pedido #${pedido.id}.`,
  tienda: (pedido) => `Tuvimos que cancelar tu pedido #${pedido.id}.`,
  vencido: (pedido) => `Cancelamos tu pedido #${pedido.id} porque no se pagó dentro del tiempo de reserva.`,
};

export interface OpcionesDeCancelacion {
  motivo?: MotivoDeCancelacion;
  estabaPagado?: boolean;
}

export function pedidoCancelado(
  pedido: PedidoConItems,
  { motivo = 'tienda', estabaPagado = false }: OpcionesDeCancelacion = {}
): Mensaje {
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

export function recuperarPassword(usuario: Destinatario, { url, minutos }: { url: string; minutos: number }): Mensaje {
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

export function passwordCambiada(usuario: Destinatario): Mensaje {
  return {
    asunto: 'Tu contraseña de NodoPC cambió',
    ...armarCorreo({
      titulo: 'Cambiaste tu contraseña',
      parrafos: [
        `Hola, ${primerNombre(usuario.nombre)}. La contraseña de tu cuenta se cambió recién.`,
        'Si fuiste vos, no tenés que hacer nada.',
      ],
      boton: { texto: 'No fui yo: restablecerla', url: enlace('/olvide-password') },
    }),
  };
}
