import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { obtenerMensajeError } from '../../../api/api';
import Cargando from '../../../components/Cargando';
import MensajeError from '../../../components/MensajeError';
import BotonEliminar from '../../../components/BotonEliminar';

export default function CategoriasLista() {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargarCategorias() {
      try {
        const respuesta = await api.get('/categorias');
        setCategorias(respuesta.data);
      } catch (e) {
        setError(obtenerMensajeError(e));
      } finally {
        setCargando(false);
      }
    }

    cargarCategorias();
  }, []);

  async function eliminar(categoria) {
    setError('');
    try {
      await api.delete(`/categorias/${categoria.id}`);
      setCategorias((actuales) => actuales.filter((c) => c.id !== categoria.id));
    } catch (e) {
      setError(obtenerMensajeError(e));
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="titulo">Categorías</h1>
        <Link to="/admin/categorias/nueva" className="btn btn-acento">
          Nueva categoría
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
                <th>Descripción</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((categoria) => (
                <tr key={categoria.id}>
                  <td className="tabular-nums">{categoria.id}</td>
                  <td className="font-bold">{categoria.nombre}</td>
                  <td>{categoria.descripcion}</td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/categorias/${categoria.id}/editar`} className="btn btn-secundario btn-chico">
                        Editar
                      </Link>
                      <BotonEliminar onConfirmar={() => eliminar(categoria)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categorias.length === 0 && !error && <p className="py-6 text-neutral-600">No hay categorías cargadas.</p>}
        </div>
      )}
    </div>
  );
}
