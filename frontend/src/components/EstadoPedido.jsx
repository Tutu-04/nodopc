const COLORES = {
  pendiente: 'bg-amber-100 text-amber-900',
  enviado: 'bg-sky-100 text-sky-900',
  entregado: 'bg-green-100 text-green-900',
};

export default function EstadoPedido({ estado }) {
  return <span className={`insignia capitalize ${COLORES[estado]}`}>{estado}</span>;
}
