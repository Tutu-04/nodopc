import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { obtenerMensajeError } from '../api/api';
import { useAuthStore } from '../store/authStore';
import { formatearPrecio } from '../utils/formato';
import ProductoCard from '../components/ProductoCard';
import ImagenProducto from '../components/ImagenProducto';
import IconoCategoria from '../components/IconoCategoria';
import Icono from '../components/Icono';
import Cargando from '../components/Cargando';
import MensajeError from '../components/MensajeError';

const BENEFICIOS = [
  { icono: 'envio', titulo: 'Envíos a todo el país', texto: 'Seguí tu pedido desde tu cuenta' },
  { icono: 'pago', titulo: 'Pagá como quieras', texto: 'Tarjeta o transferencia' },
  { icono: 'garantia', titulo: 'Garantía oficial', texto: 'En todos los productos' },
];

export default function Home() {
  const usuario = useAuthStore((estado) => estado.usuario);

  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [masVendidos, setMasVendidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargarDatos() {
      try {
        const respuestaCategorias = await api.get('/categorias');
        const respuestaProductos = await api.get('/productos', { params: { porPagina: 8 } });
        const respuestaMasVendidos = await api.get('/productos/mas-vendidos');

        setCategorias(respuestaCategorias.data);
        setProductos(respuestaProductos.data.productos);
        setMasVendidos(respuestaMasVendidos.data);
      } catch (e) {
        setError(obtenerMensajeError(e));
      } finally {
        setCargando(false);
      }
    }

    cargarDatos();
  }, []);

  return (
    <div className="flex flex-col gap-14">
      <section className="flex flex-wrap items-center gap-10 rounded-3xl border border-orange-200 bg-orange-50 p-8 md:p-11">
        <div className="flex min-w-0 flex-1 basis-96 flex-col items-start gap-5">
          <span className="insignia border border-orange-200 bg-white tracking-widest text-orange-700 uppercase">
            Tienda de hardware
          </span>
          <h1 className="text-4xl leading-[1.05] font-black tracking-tight md:text-5xl">
            Todo para armar tu PC, en un solo lugar.
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-neutral-600">
            Componentes, PC armadas, monitores y periféricos de las mejores marcas.
          </p>
          <div className="mt-1 flex flex-wrap gap-3">
            <Link to="/catalogo" className="btn btn-acento min-h-12 px-6 text-base">
              Ver catálogo
              <Icono nombre="flecha" className="size-4.5" />
            </Link>
            {usuario ? (
              <Link to="/dashboard" className="btn btn-secundario min-h-12 px-6 text-base">
                Mi panel
              </Link>
            ) : (
              <Link to="/registro" className="btn btn-secundario min-h-12 px-6 text-base">
                Crear cuenta
              </Link>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1 basis-96 overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-lg shadow-orange-900/5">
          <div className="flex items-center justify-between gap-3 border-b border-neutral-100 px-5 py-4">
            <h2 className="text-base font-extrabold">Los más vendidos</h2>
            <Link to="/catalogo" className="text-sm font-semibold hover:text-orange-700">
              Ver catálogo →
            </Link>
          </div>

          {!cargando && !error && masVendidos.length === 0 && (
            <p className="px-5 py-6 text-sm text-neutral-500">Todavía no hay ventas registradas.</p>
          )}

          {masVendidos.map((producto, indice) => (
            <Link
              key={producto.id}
              to={`/producto/${producto.id}`}
              className="flex items-center gap-4 border-b border-neutral-100 px-5 py-3.5 transition last:border-b-0 hover:bg-orange-50/60"
            >
              <span className="w-6 shrink-0 text-lg font-black text-orange-700">{indice + 1}</span>
              {producto.imagen_url ? (
                <span className="w-12 shrink-0 overflow-hidden rounded-xl border border-neutral-200">
                  <ImagenProducto producto={producto} className="h-12 p-1" tamanoIcono="size-6" />
                </span>
              ) : (
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                  <IconoCategoria categoria={producto.categoria} className="size-6" />
                </span>
              )}
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-sm leading-snug font-semibold">{producto.nombre}</span>
                <span className="text-xs text-neutral-500">{producto.vendidos} vendidos</span>
              </span>
              <span className="text-base font-extrabold whitespace-nowrap tabular-nums">
                {formatearPrecio(producto.precio)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-label="Beneficios" className="-mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        {BENEFICIOS.map((beneficio) => (
          <div key={beneficio.titulo} className="tarjeta flex items-center gap-4 p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-700">
              <Icono nombre={beneficio.icono} className="size-5.5" grosor={1.8} />
            </span>
            <div>
              <p className="text-sm font-bold">{beneficio.titulo}</p>
              <p className="text-sm text-neutral-500">{beneficio.texto}</p>
            </div>
          </div>
        ))}
      </section>

      <MensajeError texto={error} />
      {cargando && <Cargando />}

      {!cargando && !error && (
        <>
          <section className="flex flex-col gap-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="antetitulo mb-1">Explorá</p>
                <h2 className="text-3xl font-extrabold tracking-tight">Categorías</h2>
              </div>
              <Link to="/catalogo" className="text-sm font-semibold hover:text-orange-700">
                Ver todo el catálogo →
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categorias.map((categoria) => (
                <Link
                  key={categoria.id}
                  to={`/catalogo/categoria/${categoria.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-orange-300 hover:shadow-md"
                >
                  <span className="flex size-13 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                    <IconoCategoria categoria={categoria.nombre} className="size-6.5" />
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="font-bold">{categoria.nombre}</span>
                    <span className="text-sm leading-snug text-neutral-500">
                      {categoria.descripcion || `${categoria.cantidad_productos} productos`}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="antetitulo mb-1">Novedades</p>
                <h2 className="text-3xl font-extrabold tracking-tight">Últimos productos</h2>
              </div>
              <Link to="/catalogo" className="text-sm font-semibold hover:text-orange-700">
                Ver todos →
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {productos.map((producto) => (
                <ProductoCard key={producto.id} producto={producto} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
