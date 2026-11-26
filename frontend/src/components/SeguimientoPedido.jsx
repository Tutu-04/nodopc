import Icono from './Icono';

function pasosDe(pedido) {
  const pasos = [
    { estado: 'pendiente', texto: 'Pedido creado' },
    { estado: 'pagado', texto: 'Pago acreditado' },
  ];
  if (pedido.metodo_entrega === 'envio') {
    pasos.push({ estado: 'enviado', texto: 'En camino' });
  }
  pasos.push({ estado: 'entregado', texto: pedido.metodo_entrega === 'envio' ? 'Entregado' : 'Retirado' });
  return pasos;
}

export default function SeguimientoPedido({ pedido }) {
  if (pedido.estado === 'cancelado') return null;

  const pasos = pasosDe(pedido);
  const actual = pasos.findIndex((paso) => paso.estado === pedido.estado);

  return (
    <ol className="tarjeta grid gap-4 sm:grid-flow-col sm:auto-cols-fr" aria-label="Seguimiento del pedido">
      {pasos.map((paso, indice) => {
        const hecho = indice <= actual;
        return (
          <li
            key={paso.estado}
            className="flex items-center gap-3"
            aria-current={indice === actual ? 'step' : undefined}
          >
            <span
              className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                hecho ? 'bg-orange-700 text-white' : 'border border-neutral-300 text-neutral-500'
              }`}
            >
              {hecho ? <Icono nombre="check" className="size-4" grosor={3} /> : indice + 1}
            </span>
            <span className={`text-sm font-semibold ${hecho ? 'text-neutral-950' : 'text-neutral-500'}`}>
              {paso.texto}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
