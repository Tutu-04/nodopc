import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { obtenerMensajeError } from '../../../api/api';
import Cargando from '../../../components/Cargando';
import MensajeError from '../../../components/MensajeError';
import ProductoForm from './ProductoForm';

export default function ProductoEditar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    async function cargarProducto() {
      try {
        const respuesta = await api.get(`/productos/${id}`);
        setProducto(respuesta.data);
      } catch (e) {
        setError(obtenerMensajeError(e));
      } finally {
        setCargando(false);
      }
    }

    cargarProducto();
  }, [id]);

  async function guardar(datos) {
    setError('');
    setGuardando(true);
    try {
      await api.put(`/productos/${id}`, datos);
      navigate('/admin/productos');
    } catch (e) {
      setError(obtenerMensajeError(e));
      setGuardando(false);
    }
  }

  if (cargando) return <Cargando />;

  return (
    <div>
      <h1 className="titulo mb-6">Editar producto</h1>
      <MensajeError texto={error} />
      {producto && <ProductoForm inicial={producto} onGuardar={guardar} guardando={guardando} />}
    </div>
  );
}
