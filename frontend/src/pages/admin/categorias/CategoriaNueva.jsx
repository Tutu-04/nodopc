import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { obtenerMensajeError } from '../../../api/api';
import MensajeError from '../../../components/MensajeError';
import CategoriaForm from './CategoriaForm';

export default function CategoriaNueva() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function guardar(datos) {
    setError('');
    setGuardando(true);
    try {
      await api.post('/categorias', datos);
      navigate('/admin/categorias');
    } catch (e) {
      setError(obtenerMensajeError(e));
      setGuardando(false);
    }
  }

  return (
    <div>
      <h1 className="titulo mb-6">Nueva categoría</h1>
      <MensajeError texto={error} />
      <CategoriaForm onGuardar={guardar} guardando={guardando} />
    </div>
  );
}
