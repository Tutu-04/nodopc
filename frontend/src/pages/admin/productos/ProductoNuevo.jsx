import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { obtenerMensajeError } from '../../../api/api';
import MensajeError from '../../../components/MensajeError';
import ProductoForm from './ProductoForm';

export default function ProductoNuevo() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function guardar(datos) {
    setError('');
    setGuardando(true);
    try {
      await api.post('/productos', datos);
      navigate('/admin/productos');
    } catch (e) {
      setError(obtenerMensajeError(e));
      setGuardando(false);
    }
  }

  return (
    <div>
      <h1 className="titulo mb-6">Nuevo producto</h1>
      <MensajeError texto={error} />
      <ProductoForm onGuardar={guardar} guardando={guardando} />
    </div>
  );
}
