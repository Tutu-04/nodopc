import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { obtenerMensajeError } from '../../../api/api';
import { formatearFecha, formatearPrecio } from '../../../utils/formato';
import EstadoPedido from '../../../components/EstadoPedido';
import Cargando from '../../../components/Cargando';
import MensajeError from '../../../components/MensajeError';
import BotonEliminar from '../../../components/BotonEliminar';

export default function PedidosLista() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargarPedidos() {
      try {
        const respuesta = await api.get('/pedidos');
        setPedidos(respuesta.data);
      } catch (e) {
        setError(obtenerMensajeError(e));
      } finally {
        setCargando(false);
      }
    }

    cargarPedidos();
  }, []);

  async function eliminar(pedido) {
    setError('');
    try {
      await api.delete(`/pedidos/${pedido.id}`);
      setPedidos((actuales) => actuales.filter((p) => p.id !== pedido.id));
    } catch (e) {
      setError(obtenerMensajeError(e));
    }
  }

  return (
    <div>
      <h1 className="titulo mb-4">Pedidos</h1>

      <MensajeError texto={error} />

      {cargando ? (
        <Cargando />
      ) : (
        <div className="tabla-caja">
          <table className="tabla">
            <thead>
              <tr>
                <th>N.º</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((pedido) => (
                <tr key={pedido.id}>
                  <td className="tabular-nums">#{pedido.id}</td>
                  <td>{pedido.cliente}</td>
                  <td>{formatearFecha(pedido.fecha)}</td>
                  <td>
                    <EstadoPedido estado={pedido.estado} />
                  </td>
                  <td className="tabular-nums">{formatearPrecio(pedido.total)}</td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <Link to={`/pedidos/${pedido.id}`} className="btn btn-secundario btn-chico">
                        Ver
                      </Link>
                      <Link to={`/admin/pedidos/${pedido.id}/editar`} className="btn btn-secundario btn-chico">
                        Editar
                      </Link>
                      {pedido.estado === 'pendiente' && (
                        <BotonEliminar onConfirmar={() => eliminar(pedido)} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pedidos.length === 0 && !error && <p className="py-6 text-neutral-600">Todavía no hay pedidos.</p>}
        </div>
      )}
    </div>
  );
}
