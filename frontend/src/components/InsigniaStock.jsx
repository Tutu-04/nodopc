export default function InsigniaStock({ stock }) {
  if (stock === 0) {
    return <span className="insignia bg-neutral-200 text-neutral-700">Sin stock</span>;
  }
  if (stock <= 5) {
    return (
      <span className="insignia bg-amber-100 text-amber-900">
        {stock === 1 ? 'Última unidad' : `Últimas ${stock} unidades`}
      </span>
    );
  }
  return null;
}
