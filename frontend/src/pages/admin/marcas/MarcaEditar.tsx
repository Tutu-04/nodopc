import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { obtenerMensajeError } from '../../../api/api';
import Cargando from '../../../components/Cargando';
import MensajeError from '../../../components/MensajeError';
import MarcaForm from './MarcaForm';
import type { Marca } from '../../../tipos';
import type { DatosDeMarca } from './MarcaForm';

export default function MarcaEditar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [marca, setMarca] = useState<Marca | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    async function cargarMarca() {
      try {
        const respuesta = await api.get(`/marcas/${id}`);
        setMarca(respuesta.data);
      } catch (e) {
        setError(obtenerMensajeError(e));
      } finally {
        setCargando(false);
      }
    }

    cargarMarca();
  }, [id]);

  async function guardar(datos: DatosDeMarca) {
    setError('');
    setGuardando(true);
    try {
      await api.put(`/marcas/${id}`, datos);
      navigate('/admin/marcas');
    } catch (e) {
      setError(obtenerMensajeError(e));
      setGuardando(false);
    }
  }

  if (cargando) return <Cargando />;

  return (
    <div>
      <h1 className="titulo mb-6">Editar marca</h1>
      <MensajeError texto={error} />
      {marca && <MarcaForm inicial={marca} onGuardar={guardar} guardando={guardando} />}
    </div>
  );
}
