import { useCallback, useEffect, useState } from 'react';
import { NavLink, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api, { obtenerMensajeError } from '../api/api';
import ProductoCard from '../components/ProductoCard';
import IconoCategoria from '../components/IconoCategoria';
import Icono from '../components/Icono';
import Paginacion from '../components/Paginacion';
import Cargando from '../components/Cargando';
import MensajeError from '../components/MensajeError';
import { formatearPrecio } from '../utils/formato';

const POR_PAGINA = 12;

const ORDENES = [
  { valor: 'recientes', texto: 'Más nuevos' },
  { valor: 'precio_asc', texto: 'Menor precio' },
  { valor: 'precio_desc', texto: 'Mayor precio' },
  { valor: 'nombre', texto: 'Nombre (A-Z)' },
];

function claseLink({ isActive }) {
  return isActive ? 'menu-link menu-link-activo' : 'menu-link';
}

export default function Catalogo() {
  const { categoriaId } = useParams();
  const [parametros, setParametros] = useSearchParams();
  const navigate = useNavigate();

  const buscar = parametros.get('buscar') ?? '';
  const marcaId = parametros.get('marca') ?? '';
  const soloConStock = parametros.get('stock') === '1';
  const orden = parametros.get('orden') ?? 'recientes';
  const precioMin = parametros.get('min') ?? '';
  const precioMax = parametros.get('max') ?? '';
  const pagina = Math.max(1, Number(parametros.get('pagina')) || 1);

  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [resultado, setResultado] = useState({ productos: [], total: 0, paginas: 0 });

  const [textoBuscador, setTextoBuscador] = useState(buscar);
  const [minimo, setMinimo] = useState(precioMin);
  const [maximo, setMaximo] = useState(precioMax);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const actualizarFiltros = useCallback(
    (cambios, { reemplazar = true } = {}) => {
      setParametros(
        (actuales) => {
          const nuevos = new URLSearchParams(actuales);
          for (const [clave, valor] of Object.entries(cambios)) {
            if (valor === '' || valor === false || valor === null) nuevos.delete(clave);
            else nuevos.set(clave, valor);
          }
          if (!('pagina' in cambios)) nuevos.delete('pagina');
          return nuevos;
        },
        { replace: reemplazar }
      );
    },
    [setParametros]
  );

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
    setTextoBuscador(buscar);
  }, [buscar]);

  useEffect(() => {
    setMinimo(precioMin);
    setMaximo(precioMax);
  }, [precioMin, precioMax]);

  useEffect(() => {
    const espera = setTimeout(() => {
      if (textoBuscador.trim() !== buscar) {
        actualizarFiltros({ buscar: textoBuscador.trim() });
      }
    }, 400);

    return () => clearTimeout(espera);
  }, [textoBuscador, buscar, actualizarFiltros]);

  const consulta = parametros.toString();

  useEffect(() => {
    let vigente = true;
    const filtros = new URLSearchParams(consulta);

    async function cargarProductos() {
      setCargando(true);
      setError('');
      try {
        const respuesta = await api.get('/productos', {
          params: {
            categoria: categoriaId,
            buscar: filtros.get('buscar') || undefined,
            marca: filtros.get('marca') || undefined,
            conStock: filtros.get('stock') || undefined,
            orden: filtros.get('orden') || undefined,
            precioMin: filtros.get('min') || undefined,
            precioMax: filtros.get('max') || undefined,
            pagina: filtros.get('pagina') || undefined,
            porPagina: POR_PAGINA,
          },
        });
        if (vigente) setResultado(respuesta.data);
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
  }, [categoriaId, consulta]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pagina]);

  function manejarBusqueda(evento) {
    evento.preventDefault();
    actualizarFiltros({ buscar: textoBuscador.trim() });
  }

  function aplicarPrecios(evento) {
    evento.preventDefault();
    actualizarFiltros({ min: minimo, max: maximo });
  }

  function limpiarFiltros() {
    setTextoBuscador('');
    navigate('/catalogo');
  }

  function enlaceAPagina(numero) {
    const nuevos = new URLSearchParams(parametros);
    if (numero === 1) nuevos.delete('pagina');
    else nuevos.set('pagina', numero);
    const texto = nuevos.toString();
    return texto ? `?${texto}` : '?';
  }

  function enlaceACategoria(id) {
    const nuevos = new URLSearchParams(parametros);
    nuevos.delete('pagina');
    const texto = nuevos.toString();
    return { pathname: id ? `/catalogo/categoria/${id}` : '/catalogo', search: texto ? `?${texto}` : '' };
  }

  const categoriaActual = categorias.find((c) => String(c.id) === categoriaId);
  const marcaActual = marcas.find((m) => String(m.id) === marcaId);
  const hayFiltros = Boolean(buscar || marcaId || soloConStock || precioMin || precioMax || categoriaId);

  const filtrosActivos = [
    buscar && `"${buscar}"`,
    categoriaActual && `categoría ${categoriaActual.nombre}`,
    marcaActual && `marca ${marcaActual.nombre}`,
    precioMin && `desde ${formatearPrecio(precioMin)}`,
    precioMax && `hasta ${formatearPrecio(precioMax)}`,
    soloConStock && 'solo con stock',
  ].filter(Boolean);

  return (
    <div className="flex flex-wrap items-start gap-8">
      <aside aria-label="Filtros" className="tarjeta flex w-full shrink-0 flex-col gap-6 p-5 md:w-64">
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
            <NavLink to={enlaceACategoria(null)} end className={claseLink}>
              <Icono nombre="categorias" className="size-4.5" grosor={1.8} />
              Todas
            </NavLink>
            {categorias.map((categoria) => (
              <NavLink key={categoria.id} to={enlaceACategoria(categoria.id)} className={claseLink}>
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
          <select
            id="marca"
            className="campo"
            value={marcaId}
            onChange={(e) => actualizarFiltros({ marca: e.target.value })}
          >
            <option value="">Todas</option>
            {marcas.map((marca) => (
              <option key={marca.id} value={marca.id}>
                {marca.nombre}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={aplicarPrecios}>
          <p className="subtitulo mb-2">Precio</p>
          <div className="flex items-center gap-2">
            <label htmlFor="precio-min" className="sr-only">
              Precio mínimo
            </label>
            <input
              id="precio-min"
              type="number"
              min="0"
              step="1000"
              inputMode="numeric"
              className="campo"
              placeholder="Mínimo"
              value={minimo}
              onChange={(e) => setMinimo(e.target.value)}
            />
            <span className="text-neutral-400">–</span>
            <label htmlFor="precio-max" className="sr-only">
              Precio máximo
            </label>
            <input
              id="precio-max"
              type="number"
              min="0"
              step="1000"
              inputMode="numeric"
              className="campo"
              placeholder="Máximo"
              value={maximo}
              onChange={(e) => setMaximo(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secundario btn-chico mt-2 w-full">
            Aplicar precio
          </button>
        </form>

        <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm font-medium">
          <input
            type="checkbox"
            className="size-4 accent-orange-700"
            checked={soloConStock}
            onChange={(e) => actualizarFiltros({ stock: e.target.checked ? '1' : '' })}
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
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="antetitulo mb-1">Tienda</p>
            <h1 className="titulo">{categoriaActual ? categoriaActual.nombre : 'Catálogo'}</h1>
            {!cargando && (
              <p className="mt-1 text-sm text-neutral-500">
                {resultado.total} {resultado.total === 1 ? 'producto' : 'productos'}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="orden" className="subtitulo mb-1.5 block">
              Ordenar por
            </label>
            <select
              id="orden"
              className="campo w-48"
              value={orden}
              onChange={(e) => actualizarFiltros({ orden: e.target.value === 'recientes' ? '' : e.target.value })}
            >
              {ORDENES.map((opcion) => (
                <option key={opcion.valor} value={opcion.valor}>
                  {opcion.texto}
                </option>
              ))}
            </select>
          </div>

          {filtrosActivos.length > 0 && (
            <p className="w-full text-sm text-neutral-500">Filtrando por: {filtrosActivos.join(' · ')}</p>
          )}
        </div>

        <MensajeError texto={error} />

        {cargando ? (
          <Cargando />
        ) : (
          <div className="flex flex-col gap-8">
            {resultado.productos.length === 0 && !error && (
              <div className="tarjeta flex flex-col items-start gap-3">
                <p className="text-neutral-600">No hay productos que coincidan con los filtros.</p>
                <button type="button" className="btn btn-secundario" onClick={limpiarFiltros}>
                  Limpiar filtros y ver todo
                </button>
              </div>
            )}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {resultado.productos.map((producto) => (
                <ProductoCard key={producto.id} producto={producto} />
              ))}
            </div>
            <Paginacion pagina={pagina} paginas={resultado.paginas} enlace={enlaceAPagina} />
          </div>
        )}
      </section>
    </div>
  );
}
