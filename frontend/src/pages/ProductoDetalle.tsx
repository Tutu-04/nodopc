import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { obtenerMensajeError } from '../api/api';
import { useCarritoStore } from '../store/carritoStore';
import { formatearPrecio } from '../utils/formato';
import { filasDeFicha } from '../utils/fichaTecnica';
import ImagenProducto from '../components/ImagenProducto';
import InsigniaStock from '../components/InsigniaStock';
import Icono from '../components/Icono';
import Cargando from '../components/Cargando';
import MensajeError from '../components/MensajeError';
import type { Producto } from '../tipos';

export default function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const agregar = useCarritoStore((estado) => estado.agregar);

  const [producto, setProducto] = useState<Producto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargarProducto() {
      setCargando(true);
      setError('');
      try {
        const respuesta = await api.get(`/productos/${id}`);
        setProducto(respuesta.data);
      } catch (e) {
        setError(obtenerMensajeError(e));
      } finally {
        setCargando(false);
      }
    }

    cargarProducto();
  }, [id]);

  function agregarYVerCarrito() {
    if (!producto) return;
    agregar(producto);
    navigate('/carrito');
  }

  if (cargando) return <Cargando />;

  if (error || !producto) {
    return (
      <div className="tarjeta flex flex-col items-start gap-4">
        <MensajeError texto={error} />
        <button type="button" className="btn btn-secundario" onClick={() => navigate('/catalogo')}>
          Ir al catálogo
        </button>
      </div>
    );
  }

  const sinStock = producto.stock === 0;
  const ficha = filasDeFicha(producto.componente, producto.especificaciones);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Ruta" className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
          <Link to="/catalogo" className="hover:text-orange-700">
            Catálogo
          </Link>
          <span aria-hidden="true">/</span>
          <Link to={`/catalogo/categoria/${producto.categoria_id}`} className="hover:text-orange-700">
            {producto.categoria}
          </Link>
        </nav>
        <button type="button" className="btn btn-secundario btn-chico" onClick={() => navigate(-1)}>
          <Icono nombre="volver" className="size-4" />
          Volver
        </button>
      </div>

      <div className="flex flex-wrap gap-8">
        <div className="flex min-w-0 flex-1 basis-96 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
          <ImagenProducto producto={producto} className="h-full min-h-96 p-8" tamanoIcono="size-28" />
        </div>

        <div className="tarjeta flex min-w-0 flex-1 basis-96 flex-col items-start gap-4 p-8">
          <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
            {producto.categoria} · {producto.marca}
          </span>
          <h1 className="text-3xl leading-tight font-black tracking-tight">{producto.nombre}</h1>
          <InsigniaStock stock={producto.stock} />
          <p className="leading-relaxed text-neutral-600">{producto.descripcion}</p>

          <p className="mt-2 text-4xl font-black tracking-tight tabular-nums">{formatearPrecio(producto.precio)}</p>

          <p className="text-sm text-neutral-500">
            {sinStock ? 'Sin stock por el momento' : `Stock disponible: ${producto.stock}`}
          </p>

          <div className="mt-2 flex w-full flex-wrap gap-3">
            <button
              type="button"
              className="btn btn-acento min-h-12 flex-1 px-6 text-base"
              disabled={sinStock}
              onClick={agregarYVerCarrito}
            >
              <Icono nombre="carrito" className="size-5" />
              Agregar al carrito
            </button>
            <Link to="/catalogo" className="btn btn-secundario min-h-12 px-6 text-base">
              Seguir comprando
            </Link>
          </div>

          {ficha.length > 0 && (
            <section className="mt-3 w-full border-t border-neutral-100 pt-5">
              <h2 className="subtitulo mb-2">Ficha técnica</h2>
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
                {ficha.map(([etiqueta, valor]) => (
                  <div key={etiqueta} className="contents">
                    <dt className="text-neutral-500">{etiqueta}</dt>
                    <dd className="font-medium">{valor}</dd>
                  </div>
                ))}
              </dl>
              <Link
                to={`/armador?${producto.componente}=${producto.id}`}
                className="mt-3 inline-block text-sm font-semibold text-orange-700 hover:underline"
              >
                Armá una PC con este componente
              </Link>
            </section>
          )}

          <ul className="mt-3 flex w-full flex-col gap-2.5 border-t border-neutral-100 pt-5 text-sm text-neutral-600">
            <li className="flex items-center gap-3">
              <Icono nombre="envio" className="size-5 text-orange-700" grosor={1.8} />
              Envíos a todo el país
            </li>
            <li className="flex items-center gap-3">
              <Icono nombre="garantia" className="size-5 text-orange-700" grosor={1.8} />
              Garantía oficial
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
