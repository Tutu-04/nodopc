import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { obtenerMensajeError } from '../../../api/api';
import MensajeError from '../../../components/MensajeError';
import UsuarioForm from './UsuarioForm';

export default function UsuarioNuevo() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function guardar(datos) {
    setError('');
    setGuardando(true);
    try {
      await api.post('/usuarios', datos);
      navigate('/admin/usuarios');
    } catch (e) {
      setError(obtenerMensajeError(e));
      setGuardando(false);
    }
  }

  return (
    <div>
      <h1 className="titulo mb-6">Nuevo usuario</h1>
      <MensajeError texto={error} />
      <UsuarioForm onGuardar={guardar} guardando={guardando} />
    </div>
  );
}
