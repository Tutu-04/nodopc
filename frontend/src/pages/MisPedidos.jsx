import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { obtenerMensajeError } from '../api/api';
import { formatearFecha, formatearPrecio } from '../utils/formato';
import EstadoPedido from '../components/EstadoPedido';
import Cargando from '../components/Cargando';
import MensajeError from '../components/MensajeError';
import BotonEliminar from '../components/BotonEliminar';

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState([]);
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

  async function cancelar(pedido) {
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
                <th>Dirección de envío</th>
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
                  <td>{pedido.direccion_envio}</td>
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
                        <BotonEliminar
                          onConfirmar={() => cancelar(pedido)}
                          texto="Cancelar"
                          textoConfirmar="Sí, cancelar"
                        />
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
