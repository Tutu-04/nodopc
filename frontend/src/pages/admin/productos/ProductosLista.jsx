import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { obtenerMensajeError } from '../../../api/api';
import { useCarritoStore } from '../../../store/carritoStore';
import { formatearPrecio } from '../../../utils/formato';
import Cargando from '../../../components/Cargando';
import MensajeError from '../../../components/MensajeError';
import BotonEliminar from '../../../components/BotonEliminar';

export default function ProductosLista() {
  const quitarDelCarrito = useCarritoStore((estado) => estado.quitar);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargarProductos() {
      try {
        const respuesta = await api.get('/productos');
        setProductos(respuesta.data);
      } catch (e) {
        setError(obtenerMensajeError(e));
      } finally {
        setCargando(false);
      }
    }

    cargarProductos();
  }, []);

  async function eliminar(producto) {
    setError('');
    try {
      await api.delete(`/productos/${producto.id}`);
      setProductos((actuales) => actuales.filter((p) => p.id !== producto.id));
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
              {productos.map((producto) => (
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
          {productos.length === 0 && !error && <p className="py-6 text-neutral-600">No hay productos cargados.</p>}
        </div>
      )}
    </div>
  );
}
