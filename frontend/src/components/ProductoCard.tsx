import type { ProductoDeLista } from '../tipos';
import { Link } from 'react-router-dom';
import { useCarritoStore } from '../store/carritoStore';
import { formatearPrecio } from '../utils/formato';
import ImagenProducto from './ImagenProducto';
import InsigniaStock from './InsigniaStock';
import Icono from './Icono';

export default function ProductoCard({ producto }: { producto: ProductoDeLista }) {
  const agregar = useCarritoStore((estado) => estado.agregar);
  const sinStock = producto.stock === 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link to={`/producto/${producto.id}`} className="relative block" tabIndex={-1} aria-hidden="true">
        <ImagenProducto producto={producto} className="h-44 p-4" />
        <span className="absolute top-3 left-3">
          <InsigniaStock stock={producto.stock} />
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-4 pt-3.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{producto.marca}</span>

        <h3 className="text-sm leading-snug font-semibold">
          <Link to={`/producto/${producto.id}`} className="hover:text-orange-700">
            {producto.nombre}
          </Link>
        </h3>

        <p className="mt-auto pt-2 text-xl font-extrabold tracking-tight tabular-nums">
          {formatearPrecio(producto.precio)}
        </p>

        <button type="button" className="btn mt-1.5 w-full" disabled={sinStock} onClick={() => agregar(producto)}>
          {sinStock ? (
            'Sin stock'
          ) : (
            <>
              <Icono nombre="mas" className="size-4" />
              Agregar al carrito
            </>
          )}
        </button>
      </div>
    </article>
  );
}
