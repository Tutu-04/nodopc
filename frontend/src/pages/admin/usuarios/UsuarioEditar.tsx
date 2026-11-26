import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { obtenerMensajeError } from '../../../api/api';
import { useAuthStore } from '../../../store/authStore';
import Cargando from '../../../components/Cargando';
import MensajeError from '../../../components/MensajeError';
import UsuarioForm from './UsuarioForm';
import type { Usuario } from '../../../tipos';
import type { DatosDeUsuario } from './UsuarioForm';

export default function UsuarioEditar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const usuarioActual = useAuthStore((estado) => estado.usuario);
  const iniciarSesion = useAuthStore((estado) => estado.iniciarSesion);

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    async function cargarUsuario() {
      try {
        const respuesta = await api.get(`/usuarios/${id}`);
        setUsuario(respuesta.data);
      } catch (e) {
        setError(obtenerMensajeError(e));
      } finally {
        setCargando(false);
      }
    }

    cargarUsuario();
  }, [id]);

  async function guardar(datos: DatosDeUsuario) {
    setError('');
    setGuardando(true);
    try {
      const respuesta = await api.put(`/usuarios/${id}`, datos);
      const editado = respuesta.data;

      if (editado.id === usuarioActual?.id) {
        iniciarSesion({ id: editado.id, nombre: editado.nombre, email: editado.email, rol: editado.rol });
      }

      navigate('/admin/usuarios');
    } catch (e) {
      setError(obtenerMensajeError(e));
      setGuardando(false);
    }
  }

  if (cargando) return <Cargando />;

  return (
    <div>
      <h1 className="titulo mb-6">Editar usuario</h1>
      <MensajeError texto={error} />
      {usuario && <UsuarioForm inicial={usuario} onGuardar={guardar} guardando={guardando} />}
    </div>
  );
}
