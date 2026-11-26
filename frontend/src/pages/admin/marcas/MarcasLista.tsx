import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { obtenerMensajeError } from '../../../api/api';
import Cargando from '../../../components/Cargando';
import MensajeError from '../../../components/MensajeError';
import BotonEliminar from '../../../components/BotonEliminar';
import type { Marca } from '../../../tipos';

export default function MarcasLista() {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargarMarcas() {
      try {
        const respuesta = await api.get('/marcas');
        setMarcas(respuesta.data);
      } catch (e) {
        setError(obtenerMensajeError(e));
      } finally {
        setCargando(false);
      }
    }

    cargarMarcas();
  }, []);

  async function eliminar(marca: Marca) {
    setError('');
    try {
      await api.delete(`/marcas/${marca.id}`);
      setMarcas((actuales) => actuales.filter((m) => m.id !== marca.id));
    } catch (e) {
      setError(obtenerMensajeError(e));
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="titulo">Marcas</h1>
        <Link to="/admin/marcas/nueva" className="btn btn-acento">
          Nueva marca
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
                <th>País</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {marcas.map((marca) => (
                <tr key={marca.id}>
                  <td className="tabular-nums">{marca.id}</td>
                  <td className="font-bold">{marca.nombre}</td>
                  <td>{marca.pais}</td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/marcas/${marca.id}/editar`} className="btn btn-secundario btn-chico">
                        Editar
                      </Link>
                      <BotonEliminar onConfirmar={() => eliminar(marca)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {marcas.length === 0 && !error && <p className="py-6 text-neutral-600">No hay marcas cargadas.</p>}
        </div>
      )}
    </div>
  );
}
