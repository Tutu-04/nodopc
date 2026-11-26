import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { obtenerMensajeError } from '../../../api/api';
import { useCarritoStore } from '../../../store/carritoStore';
import { formatearPrecio } from '../../../utils/formato';
import Cargando from '../../../components/Cargando';
import MensajeError from '../../../components/MensajeError';
import BotonEliminar from '../../../components/BotonEliminar';
import Paginacion from '../../../components/Paginacion';

const POR_PAGINA = 20;

export default function ProductosLista() {
  const quitarDelCarrito = useCarritoStore((estado) => estado.quitar);
  const [parametros, setParametros] = useSearchParams();
  const buscar = parametros.get('buscar') ?? '';
  const pagina = Math.max(1, Number(parametros.get('pagina')) || 1);

  const [texto, setTexto] = useState(buscar);
  const [resultado, setResultado] = useState({ productos: [], total: 0, paginas: 0 });
  const [recargas, setRecargas] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setTexto(buscar);
  }, [buscar]);

  useEffect(() => {
    let vigente = true;

    async function cargarProductos() {
      setCargando(true);
      try {
        const respuesta = await api.get('/productos', {
          params: { buscar: buscar || undefined, pagina, porPagina: POR_PAGINA },
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
  }, [buscar, pagina, recargas]);

  function manejarBusqueda(evento) {
    evento.preventDefault();
    const nuevos = new URLSearchParams();
    if (texto.trim()) nuevos.set('buscar', texto.trim());
    setParametros(nuevos);
  }

  function enlaceAPagina(numero) {
    const nuevos = new URLSearchParams(parametros);
    if (numero === 1) nuevos.delete('pagina');
    else nuevos.set('pagina', numero);
    const textoConsulta = nuevos.toString();
    return textoConsulta ? `?${textoConsulta}` : '?';
  }

  async function eliminar(producto) {
    setError('');
    try {
      await api.delete(`/productos/${producto.id}`);
      setRecargas((cantidad) => cantidad + 1);
      quitarDelCarrito(producto.id);
    } catch (e) {
      setError(obtenerMensajeError(e));
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="titulo">Productos</h1>
        <Link to="/admin/productos/nuevo" className="btn btn-acento">
          Nuevo producto
        </Link>
      </div>

      <form onSubmit={manejarBusqueda} role="search" className="mb-5 flex flex-wrap gap-2">
        <label htmlFor="buscar-producto" className="sr-only">
          Buscar productos
        </label>
        <input
          id="buscar-producto"
          type="search"
          className="campo max-w-sm"
          placeholder="Buscar por nombre, marca o categoría"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <button type="submit" className="btn btn-secundario">
          Buscar
        </button>
        {!cargando && (
          <span className="flex items-center text-sm text-neutral-500">
            {resultado.total} {resultado.total === 1 ? 'producto' : 'productos'}
          </span>
        )}
      </form>

      <MensajeError texto={error} />

      {cargando ? (
        <Cargando />
      ) : (
        <div className="tabla-caja">
          <table className="tabla">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Marca</th>
                <th>Precio</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {resultado.productos.map((producto) => (
                <tr key={producto.id}>
                  <td className="tabular-nums">{producto.id}</td>
                  <td className="font-bold">
                    <Link to={`/producto/${producto.id}`} className="hover:underline">
                      {producto.nombre}
                    </Link>
                  </td>
                  <td>{producto.categoria}</td>
                  <td>{producto.marca}</td>
                  <td className="tabular-nums">{formatearPrecio(producto.precio)}</td>
                  <td
                    className={
                      producto.stock === 0 ? 'whitespace-nowrap tabular-nums font-bold text-red-700' : 'tabular-nums'
                    }
                  >
                    {producto.stock === 0 ? '0 (sin stock)' : producto.stock}
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/productos/${producto.id}/editar`} className="btn btn-secundario btn-chico">
                        Editar
                      </Link>
                      <BotonEliminar onConfirmar={() => eliminar(producto)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {resultado.productos.length === 0 && !error && (
            <p className="px-4 py-6 text-neutral-600">No hay productos que coincidan.</p>
          )}
        </div>
      )}

      <div className="mt-6">
        <Paginacion pagina={pagina} paginas={resultado.paginas} enlace={enlaceAPagina} />
      </div>
    </div>
  );
}
