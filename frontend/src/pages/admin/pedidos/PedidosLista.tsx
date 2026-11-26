import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { obtenerMensajeError } from '../../../api/api';
import { formatearFecha, formatearPrecio } from '../../../utils/formato';
import EstadoPedido, { textoDeEstado } from '../../../components/EstadoPedido';
import Cargando from '../../../components/Cargando';
import MensajeError from '../../../components/MensajeError';
import BotonEliminar from '../../../components/BotonEliminar';
import type { EstadoPedido as Estado, Pedido } from '../../../tipos';

const ESTADOS: Estado[] = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'];

export default function PedidosLista() {
  const [parametros, setParametros] = useSearchParams();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const filtro = parametros.get('estado') ?? '';

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

  function filtrar(estado: string) {
    setParametros(estado ? { estado } : {}, { replace: true });
  }

  async function cancelar(pedido: Pedido) {
    setError('');
    try {
      const respuesta = await api.post(`/pedidos/${pedido.id}/cancelar`);
      setPedidos((actuales) => actuales.map((p) => (p.id === pedido.id ? { ...p, ...respuesta.data } : p)));
    } catch (e) {
      setError(obtenerMensajeError(e));
    }
  }

  async function eliminar(pedido: Pedido) {
    setError('');
    try {
      await api.delete(`/pedidos/${pedido.id}`);
      setPedidos((actuales) => actuales.filter((p) => p.id !== pedido.id));
    } catch (e) {
      setError(obtenerMensajeError(e));
    }
  }

  const visibles = filtro ? pedidos.filter((pedido) => pedido.estado === filtro) : pedidos;
  const cantidad = (estado: Estado) => pedidos.filter((pedido) => pedido.estado === estado).length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="titulo">Pedidos</h1>
        <div className="w-full sm:w-64">
          <label htmlFor="filtro-estado" className="etiqueta">
            Estado
          </label>
          <select id="filtro-estado" className="campo" value={filtro} onChange={(e) => filtrar(e.target.value)}>
            <option value="">Todos ({pedidos.length})</option>
            {ESTADOS.map((estado) => (
              <option key={estado} value={estado}>
                {textoDeEstado(estado)} ({cantidad(estado)})
              </option>
            ))}
          </select>
        </div>
      </div>

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
                <th>Entrega</th>
                <th>Estado</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((pedido) => (
                <tr key={pedido.id}>
                  <td className="tabular-nums">#{pedido.id}</td>
                  <td>{pedido.cliente}</td>
                  <td className="whitespace-nowrap">{formatearFecha(pedido.fecha)}</td>
                  <td>{pedido.metodo_entrega === 'envio' ? pedido.provincia : 'Retiro'}</td>
                  <td>
                    <EstadoPedido estado={pedido.estado} />
                  </td>
                  <td className="tabular-nums">{formatearPrecio(pedido.total)}</td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <Link to={`/pedidos/${pedido.id}`} className="btn btn-secundario btn-chico">
                        Ver
                      </Link>
                      {!['entregado', 'cancelado'].includes(pedido.estado) && (
                        <Link to={`/admin/pedidos/${pedido.id}/editar`} className="btn btn-secundario btn-chico">
                          Gestionar
                        </Link>
                      )}
                      {['pendiente', 'pagado'].includes(pedido.estado) && (
                        <BotonEliminar
                          onConfirmar={() => cancelar(pedido)}
                          texto="Cancelar"
                          textoConfirmar="Sí, cancelar"
                        />
                      )}
                      {pedido.estado === 'cancelado' && <BotonEliminar onConfirmar={() => eliminar(pedido)} />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visibles.length === 0 && !error && (
            <p className="px-4 py-6 text-neutral-600">
              {filtro ? 'No hay pedidos en este estado.' : 'Todavía no hay pedidos.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
