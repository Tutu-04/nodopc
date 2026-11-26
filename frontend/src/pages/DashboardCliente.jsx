import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { obtenerMensajeError } from '../api/api';
import { formatearFecha, formatearPrecio } from '../utils/formato';
import Dato from '../components/Dato';
import EstadoPedido from '../components/EstadoPedido';
import Cargando from '../components/Cargando';
import MensajeError from '../components/MensajeError';

export default function DashboardCliente() {
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

  if (cargando) return <Cargando />;

  const pendientes = pedidos.filter((pedido) => pedido.estado === 'pendiente').length;
  const totalGastado = pedidos.reduce((suma, pedido) => suma + pedido.total, 0);
  const ultimos = pedidos.slice(0, 3);

  return (
    <div className="flex flex-col gap-8">
      <MensajeError texto={error} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Dato titulo="Pedidos realizados" valor={pedidos.length} />
        <Dato titulo="Pedidos pendientes" valor={pendientes} />
        <Dato titulo="Total comprado" valor={formatearPrecio(totalGastado)} />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-bold tracking-tight">Tus últimos pedidos</h2>

        {ultimos.length === 0 ? (
          <p className="tarjeta text-neutral-600">Todavía no hiciste ningún pedido.</p>
        ) : (
          <div className="tabla-caja">
            <table className="tabla">
              <thead>
                <tr>
                  <th>N.º</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {ultimos.map((pedido) => (
                  <tr key={pedido.id}>
                    <td className="tabular-nums">#{pedido.id}</td>
                    <td>{formatearFecha(pedido.fecha)}</td>
                    <td>
                      <EstadoPedido estado={pedido.estado} />
                    </td>
                    <td className="tabular-nums">{formatearPrecio(pedido.total)}</td>
                    <td className="text-right">
                      <Link to={`/pedidos/${pedido.id}`} className="btn btn-secundario btn-chico">
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="flex flex-wrap gap-3">
        <Link to="/catalogo" className="btn btn-acento">
          Ir al catálogo
        </Link>
        <Link to="/mis-pedidos" className="btn btn-secundario">
          Ver todos mis pedidos
        </Link>
        <Link to="/carrito" className="btn btn-secundario">
          Ver mi carrito
        </Link>
      </div>
    </div>
  );
}
