import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { obtenerMensajeError } from '../../../api/api';
import Cargando from '../../../components/Cargando';
import MensajeError from '../../../components/MensajeError';
import CategoriaForm from './CategoriaForm';
import type { Categoria } from '../../../tipos';
import type { DatosDeCategoria } from './CategoriaForm';

export default function CategoriaEditar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    async function cargarCategoria() {
      try {
        const respuesta = await api.get(`/categorias/${id}`);
        setCategoria(respuesta.data);
      } catch (e) {
        setError(obtenerMensajeError(e));
      } finally {
        setCargando(false);
      }
    }

    cargarCategoria();
  }, [id]);

  async function guardar(datos: DatosDeCategoria) {
    setError('');
    setGuardando(true);
    try {
      await api.put(`/categorias/${id}`, datos);
      navigate('/admin/categorias');
    } catch (e) {
      setError(obtenerMensajeError(e));
      setGuardando(false);
    }
  }

  if (cargando) return <Cargando />;

  return (
    <div>
      <h1 className="titulo mb-6">Editar categoría</h1>
      <MensajeError texto={error} />
      {categoria && <CategoriaForm inicial={categoria} onGuardar={guardar} guardando={guardando} />}
    </div>
  );
}
