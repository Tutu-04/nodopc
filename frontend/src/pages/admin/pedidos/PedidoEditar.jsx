import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { obtenerMensajeError } from '../../../api/api';
import { formatearFecha, formatearPrecio } from '../../../utils/formato';
import EstadoPedido, { textoDeEstado } from '../../../components/EstadoPedido';
import Cargando from '../../../components/Cargando';
import MensajeError from '../../../components/MensajeError';

export default function PedidoEditar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pedido, setPedido] = useState(null);
  const [estado, setEstado] = useState('');
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
        setDireccion(respuesta.data.direccion_envio ?? '');
      } catch (e) {
        setError(obtenerMensajeError(e));
      } finally {
        setCargando(false);
      }
    }

    cargarPedido();
  }, [id]);

  const puedeCambiarDireccion = pedido?.metodo_entrega === 'envio' && ['pendiente', 'pagado'].includes(pedido.estado);

  async function manejarSubmit(evento) {
    evento.preventDefault();
    setError('');
    setGuardando(true);
    try {
      await api.put(`/pedidos/${id}`, {
        estado,
        direccion_envio: puedeCambiarDireccion ? direccion : undefined,
      });
      navigate('/admin/pedidos');
    } catch (e) {
      setError(obtenerMensajeError(e));
      setGuardando(false);
    }
  }

  if (cargando) return <Cargando />;

  return (
    <div>
      <h1 className="titulo mb-6">Gestionar pedido #{id}</h1>
      <MensajeError texto={error} />

      {pedido && (
        <div className="flex max-w-lg flex-col gap-6">
          <dl className="tarjeta grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="subtitulo">Cliente</dt>
              <dd className="mt-1 font-medium">{pedido.cliente}</dd>
            </div>
            <div>
              <dt className="subtitulo">Fecha</dt>
              <dd className="mt-1 font-medium">{formatearFecha(pedido.fecha)}</dd>
            </div>
            <div>
              <dt className="subtitulo">Entrega</dt>
              <dd className="mt-1 font-medium">
                {pedido.metodo_entrega === 'envio' ? `Envío a ${pedido.provincia}` : 'Retiro en el local'}
              </dd>
            </div>
            <div>
              <dt className="subtitulo">Total</dt>
              <dd className="mt-1 font-medium tabular-nums">{formatearPrecio(pedido.total)}</dd>
            </div>
            <div className="col-span-2">
              <dt className="subtitulo">Estado actual</dt>
              <dd className="mt-1">
                <EstadoPedido estado={pedido.estado} />
              </dd>
            </div>
          </dl>

          <form onSubmit={manejarSubmit} className="tarjeta flex flex-col gap-5">
            <div>
              <label htmlFor="estado" className="etiqueta">
                Pasar a
              </label>
              <select
                id="estado"
                className="campo"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                disabled={pedido.estados_siguientes.length === 0}
              >
                <option value={pedido.estado}>{textoDeEstado(pedido.estado)} (sin cambios)</option>
                {pedido.estados_siguientes.map((siguiente) => (
                  <option key={siguiente} value={siguiente}>
                    {textoDeEstado(siguiente)}
                  </option>
                ))}
              </select>
              {pedido.estado === 'pendiente' && (
                <p className="ayuda">Marcalo como pagado solo si cobraste por otro medio, como una transferencia.</p>
              )}
            </div>

            {puedeCambiarDireccion && (
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
            )}

            <div className="flex flex-wrap gap-3">
              <button type="submit" className="btn btn-acento" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
              <Link to="/admin/pedidos" className="btn btn-secundario">
                Volver
              </Link>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
