import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api, { obtenerMensajeError } from '../api/api';
import ProductoCard from '../components/ProductoCard';
import IconoCategoria from '../components/IconoCategoria';
import Icono from '../components/Icono';
import Cargando from '../components/Cargando';
import MensajeError from '../components/MensajeError';

function claseLink({ isActive }) {
  return isActive ? 'menu-link menu-link-activo' : 'menu-link';
}

export default function Catalogo() {
  const { categoriaId } = useParams();
  const [parametros] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [productos, setProductos] = useState([]);

  const [marcaId, setMarcaId] = useState('');
  const [textoBuscador, setTextoBuscador] = useState(() => parametros.get('buscar') ?? '');
  const [buscar, setBuscar] = useState(() => (parametros.get('buscar') ?? '').trim());
  const [soloConStock, setSoloConStock] = useState(false);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargarFiltros() {
      try {
        const respuestaCategorias = await api.get('/categorias');
        const respuestaMarcas = await api.get('/marcas');
        setCategorias(respuestaCategorias.data);
        setMarcas(respuestaMarcas.data);
      } catch (e) {
        setError(obtenerMensajeError(e));
      }
    }

    cargarFiltros();
  }, []);

  useEffect(() => {
    const textoDeLaUrl = parametros.get('buscar');
    if (textoDeLaUrl !== null) {
      setTextoBuscador(textoDeLaUrl);
      setBuscar(textoDeLaUrl.trim());
    }
  }, [location.key, parametros]);

  useEffect(() => {
    const espera = setTimeout(() => {
      setBuscar(textoBuscador.trim());
    }, 400);

    return () => clearTimeout(espera);
  }, [textoBuscador]);

  useEffect(() => {
    let vigente = true;

    async function cargarProductos() {
      setCargando(true);
      setError('');
      try {
        const respuesta = await api.get('/productos', {
          params: { categoria: categoriaId, marca: marcaId, buscar: buscar, porPagina: 100 },
        });
        if (vigente) setProductos(respuesta.data.productos);
      } catch (e) {
        if (vigente) setError(obtenerMensajeError(e));
      } finally {
        if (vigente) setCargando(false);
      }
    }

    cargarProductos();

    return () => {
      vigente = false;
    };
  }, [categoriaId, marcaId, buscar]);

  function manejarBusqueda(evento) {
    evento.preventDefault();
    setBuscar(textoBuscador.trim());
  }

  function limpiarFiltros() {
    setTextoBuscador('');
    setBuscar('');
    setMarcaId('');
    setSoloConStock(false);
    navigate('/catalogo');
  }

  const productosVisibles = soloConStock ? productos.filter((p) => p.stock > 0) : productos;
  const hayFiltros = Boolean(textoBuscador || buscar || marcaId || soloConStock || categoriaId);
  const categoriaActual = categorias.find((c) => String(c.id) === categoriaId);
  const marcaActual = marcas.find((m) => String(m.id) === marcaId);

  const filtrosActivos = [
    buscar && `"${buscar}"`,
    categoriaActual && `categoría ${categoriaActual.nombre}`,
    marcaActual && `marca ${marcaActual.nombre}`,
    soloConStock && 'solo con stock',
  ].filter(Boolean);

  return (
    <div className="flex flex-wrap items-start gap-8">
      <aside aria-label="Filtros" className="tarjeta flex w-64 shrink-0 flex-col gap-6 p-5">
        <form onSubmit={manejarBusqueda} role="search">
          <label htmlFor="buscador" className="subtitulo mb-2 block">
            Buscar
          </label>
          <div className="relative">
            <input
              id="buscador"
              type="text"
              className="campo pr-10"
              placeholder="Ej: placa de video asus"
              autoComplete="off"
              value={textoBuscador}
              onChange={(e) => setTextoBuscador(e.target.value)}
            />
            {textoBuscador && (
              <button
                type="button"
                className="absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950"
                aria-label="Borrar búsqueda"
                onClick={() => setTextoBuscador('')}
              >
                <Icono nombre="cerrar" className="size-4" />
              </button>
            )}
          </div>
          <p className="ayuda">Busca por nombre, marca o categoría.</p>
        </form>

        <div>
          <p className="subtitulo mb-2">Categoría</p>
          <nav aria-label="Categorías" className="flex flex-col gap-0.5">
            <NavLink to="/catalogo" end className={claseLink}>
              <Icono nombre="categorias" className="size-4.5" grosor={1.8} />
              Todas
            </NavLink>
            {categorias.map((categoria) => (
              <NavLink key={categoria.id} to={`/catalogo/categoria/${categoria.id}`} className={claseLink}>
                <IconoCategoria categoria={categoria.nombre} className="size-4.5" />
                {categoria.nombre}
              </NavLink>
            ))}
          </nav>
        </div>

        <div>
          <label htmlFor="marca" className="subtitulo mb-2 block">
            Marca
          </label>
          <select id="marca" className="campo" value={marcaId} onChange={(e) => setMarcaId(e.target.value)}>
            <option value="">Todas</option>
            {marcas.map((marca) => (
              <option key={marca.id} value={marca.id}>
                {marca.nombre}
              </option>
            ))}
          </select>
        </div>

        <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm font-medium">
          <input
            type="checkbox"
            className="size-4 accent-orange-700"
            checked={soloConStock}
            onChange={(e) => setSoloConStock(e.target.checked)}
          />
          Solo con stock
        </label>

        {hayFiltros && (
          <button type="button" className="btn btn-secundario" onClick={limpiarFiltros}>
            Limpiar filtros
          </button>
        )}
      </aside>

      <section className="min-w-0 flex-1 basis-xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="antetitulo mb-1">Tienda</p>
            <h1 className="titulo">{categoriaActual ? categoriaActual.nombre : 'Catálogo'}</h1>
          </div>
          {!cargando && <span className="text-sm text-neutral-500">{productosVisibles.length} productos</span>}
          {filtrosActivos.length > 0 && (
            <p className="w-full text-sm text-neutral-500">Filtrando por: {filtrosActivos.join(' · ')}</p>
          )}
        </div>

        <MensajeError texto={error} />

        {cargando ? (
          <Cargando />
        ) : (
          <>
            {productosVisibles.length === 0 && !error && (
              <div className="tarjeta flex flex-col items-start gap-3">
                <p className="text-neutral-600">No hay productos que coincidan con los filtros.</p>
                <button type="button" className="btn btn-secundario" onClick={limpiarFiltros}>
                  Limpiar filtros y ver todo
                </button>
              </div>
            )}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {productosVisibles.map((producto) => (
                <ProductoCard key={producto.id} producto={producto} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
