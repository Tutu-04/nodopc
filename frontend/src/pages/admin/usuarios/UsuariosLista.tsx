import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { obtenerMensajeError } from '../../../api/api';
import { useAuthStore } from '../../../store/authStore';
import { formatearFecha } from '../../../utils/formato';
import Cargando from '../../../components/Cargando';
import MensajeError from '../../../components/MensajeError';
import BotonEliminar from '../../../components/BotonEliminar';
import type { Usuario } from '../../../tipos';

export default function UsuariosLista() {
  const usuarioActual = useAuthStore((estado) => estado.usuario);

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargarUsuarios() {
      try {
        const respuesta = await api.get('/usuarios');
        setUsuarios(respuesta.data);
      } catch (e) {
        setError(obtenerMensajeError(e));
      } finally {
        setCargando(false);
      }
    }

    cargarUsuarios();
  }, []);

  async function eliminar(usuario: Usuario) {
    setError('');
    try {
      await api.delete(`/usuarios/${usuario.id}`);
      setUsuarios((actuales) => actuales.filter((u) => u.id !== usuario.id));
    } catch (e) {
      setError(obtenerMensajeError(e));
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="titulo">Usuarios</h1>
        <Link to="/admin/usuarios/nuevo" className="btn btn-acento">
          Nuevo usuario
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
                <th>Email</th>
                <th>Rol</th>
                <th>Alta</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td className="tabular-nums">{usuario.id}</td>
                  <td className="font-bold">{usuario.nombre}</td>
                  <td>{usuario.email}</td>
                  <td className="text-xs font-bold uppercase tracking-wider">{usuario.rol}</td>
                  <td>{formatearFecha(usuario.creado_en)}</td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/usuarios/${usuario.id}/editar`} className="btn btn-secundario btn-chico">
                        Editar
                      </Link>
                      {usuario.id !== usuarioActual?.id && <BotonEliminar onConfirmar={() => eliminar(usuario)} />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
