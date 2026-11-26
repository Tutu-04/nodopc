import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { obtenerMensajeError } from '../../../api/api';
import { formatearFecha, formatearPrecio } from '../../../utils/formato';
import Cargando from '../../../components/Cargando';
import MensajeError from '../../../components/MensajeError';

export default function PedidoEditar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pedido, setPedido] = useState(null);
  const [estado, setEstado] = useState('pendiente');
  const [direccion, setDireccion] = useState('');

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    async function cargarPedido() {
      try {
        const respuesta = await api.get(`/pedidos/${id}`);
        setPedido(respuesta.data);
        setEstado(respuesta.data.estado);
        setDireccion(respuesta.data.direccion_envio);
      } catch (e) {
        setError(obtenerMensajeError(e));
      } finally {
        setCargando(false);
      }
    }

    cargarPedido();
  }, [id]);

  async function manejarSubmit(evento) {
    evento.preventDefault();
    setError('');
    setGuardando(true);
    try {
      await api.put(`/pedidos/${id}`, { estado, direccion_envio: direccion });
      navigate('/admin/pedidos');
    } catch (e) {
      setError(obtenerMensajeError(e));
      setGuardando(false);
    }
  }

  if (cargando) return <Cargando />;

  return (
    <div>
      <h1 className="titulo mb-6">Editar pedido #{id}</h1>
      <MensajeError texto={error} />

      {pedido && (
        <>
          <p className="mb-6 text-sm text-neutral-700">
            Cliente: <strong>{pedido.cliente}</strong> · Fecha: {formatearFecha(pedido.fecha)} · Total:{' '}
            <span className="tabular-nums">{formatearPrecio(pedido.total)}</span>
          </p>

          <form onSubmit={manejarSubmit} className="tarjeta flex max-w-lg flex-col gap-5">
            <div>
              <label htmlFor="estado" className="etiqueta">
                Estado
              </label>
              <select id="estado" className="campo" value={estado} onChange={(e) => setEstado(e.target.value)}>
                <option value="pendiente">Pendiente</option>
                <option value="enviado">Enviado</option>
                <option value="entregado">Entregado</option>
              </select>
            </div>

            <div>
              <label htmlFor="direccion" className="etiqueta">
                Dirección de envío
              </label>
              <input
                id="direccion"
                type="text"
                className="campo"
                required
                minLength={5}
                maxLength={200}
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="submit" className="btn btn-acento" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
              <Link to="/admin/pedidos" className="btn btn-secundario">
                Cancelar
              </Link>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
