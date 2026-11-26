import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { obtenerMensajeError, subirImagenDeProducto } from '../../../api/api';
import MensajeError from '../../../components/MensajeError';
import ProductoForm from './ProductoForm';

export default function ProductoNuevo() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function guardar(datos, archivo) {
    setError('');
    setGuardando(true);

    let creado;
    try {
      const respuesta = await api.post('/productos', datos);
      creado = respuesta.data;
    } catch (e) {
      setError(obtenerMensajeError(e));
      setGuardando(false);
      return;
    }

    if (archivo) {
      try {
        await subirImagenDeProducto(creado.id, archivo);
      } catch (e) {
        navigate(`/admin/productos/${creado.id}/editar`, {
          state: { error: `El producto se creó, pero la imagen no se pudo subir: ${obtenerMensajeError(e)}` },
        });
        return;
      }
    }

    navigate('/admin/productos');
  }

  return (
    <div>
      <h1 className="titulo mb-6">Nuevo producto</h1>
      <MensajeError texto={error} />
      <ProductoForm onGuardar={guardar} guardando={guardando} />
    </div>
  );
}
