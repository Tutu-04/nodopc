import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { obtenerMensajeError } from '../api/api';
import { formatearFecha, formatearPrecio } from '../utils/formato';
import EstadoPedido from '../components/EstadoPedido';
import Cargando from '../components/Cargando';
import MensajeError from '../components/MensajeError';
import BotonEliminar from '../components/BotonEliminar';
import type { Pedido } from '../tipos';

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargarPedidos() {
      try {
        const respuesta = await api.get('/pedidos/mios');
        setPedidos(respuesta.data);
      } catch (e) {
        setError(obtenerMensajeError(e));
      } finally {
        setCargando(false);
      }
    }

    cargarPedidos();
  }, []);

  async function cancelar(pedido: Pedido) {
    setError('');
    try {
      const respuesta = await api.post(`/pedidos/${pedido.id}/cancelar`);
      setPedidos((actuales) => actuales.map((p) => (p.id === pedido.id ? { ...p, ...respuesta.data } : p)));
    } catch (e) {
      setError(obtenerMensajeError(e));
    }
  }

  return (
    <div>
      <h1 className="titulo mb-6">Mis pedidos</h1>

      <MensajeError texto={error} />

      {cargando ? (
        <Cargando />
      ) : pedidos.length === 0 ? (
        <div className="tarjeta flex flex-col items-start gap-4">
          <p className="text-neutral-600">Todavía no hiciste ningún pedido.</p>
          <Link to="/catalogo" className="btn btn-acento">
            Ir al catálogo
          </Link>
        </div>
      ) : (
        <div className="tabla-caja">
          <table className="tabla">
            <thead>
              <tr>
                <th>N.º</th>
                <th>Fecha</th>
                <th>Entrega</th>
                <th>Estado</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((pedido) => (
                <tr key={pedido.id}>
                  <td className="tabular-nums">#{pedido.id}</td>
                  <td>{formatearFecha(pedido.fecha)}</td>
                  <td>{pedido.metodo_entrega === 'envio' ? `Envío a ${pedido.provincia}` : 'Retiro en el local'}</td>
                  <td>
                    <EstadoPedido estado={pedido.estado} />
                  </td>
                  <td className="tabular-nums">{formatearPrecio(pedido.total)}</td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <Link to={`/pedidos/${pedido.id}`} className="btn btn-secundario btn-chico">
                        Ver
                      </Link>
                      {pedido.estado === 'pendiente' && (
                        <>
                          <Link to={`/pedidos/${pedido.id}`} className="btn btn-acento btn-chico">
                            Pagar
                          </Link>
                          <BotonEliminar
                            onConfirmar={() => cancelar(pedido)}
                            texto="Cancelar"
                            textoConfirmar="Sí, cancelar"
                          />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
