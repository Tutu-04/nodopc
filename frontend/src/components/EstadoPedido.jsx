const ESTADOS = {
  pendiente: { texto: 'Pendiente de pago', clases: 'bg-amber-100 text-amber-900' },
  pagado: { texto: 'Pagado', clases: 'bg-blue-100 text-blue-900' },
  enviado: { texto: 'Enviado', clases: 'bg-pink-100 text-pink-900' },
  entregado: { texto: 'Entregado', clases: 'bg-green-100 text-green-900' },
  cancelado: { texto: 'Cancelado', clases: 'bg-neutral-200 text-neutral-700' },
};

export function textoDeEstado(estado) {
  return ESTADOS[estado]?.texto ?? estado;
}

export default function EstadoPedido({ estado }) {
  const { clases = 'bg-neutral-100 text-neutral-800' } = ESTADOS[estado] ?? {};
  return <span className={`insignia whitespace-nowrap ${clases}`}>{textoDeEstado(estado)}</span>;
}
