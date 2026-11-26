import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { obtenerMensajeError } from '../../../api/api';
import MensajeError from '../../../components/MensajeError';
import MarcaForm from './MarcaForm';
import type { DatosDeMarca } from './MarcaForm';

export default function MarcaNueva() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function guardar(datos: DatosDeMarca) {
    setError('');
    setGuardando(true);
    try {
      await api.post('/marcas', datos);
      navigate('/admin/marcas');
    } catch (e) {
      setError(obtenerMensajeError(e));
      setGuardando(false);
    }
  }

  return (
    <div>
      <h1 className="titulo mb-6">Nueva marca</h1>
      <MensajeError texto={error} />
      <MarcaForm onGuardar={guardar} guardando={guardando} />
    </div>
  );
}
