import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { obtenerMensajeError } from '../api/api';
import { formatearFecha, formatearPrecio } from '../utils/formato';
import EstadoPedido from '../components/EstadoPedido';
import Icono from '../components/Icono';
import Cargando from '../components/Cargando';
import MensajeError from '../components/MensajeError';

export default function PedidoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pedido, setPedido] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargarPedido() {
      setCargando(true);
      setError('');
      try {
        const respuesta = await api.get(`/pedidos/${id}`);
        setPedido(respuesta.data);
      } catch (e) {
        setError(obtenerMensajeError(e));
      } finally {
        setCargando(false);
      }
    }

    cargarPedido();
  }, [id]);

  if (cargando) return <Cargando />;

  if (error) {
    return (
      <div className="tarjeta flex flex-col items-start gap-4">
        <MensajeError texto={error} />
        <button type="button" className="btn btn-secundario" onClick={() => navigate('/mis-pedidos')}>
          Ir a mis pedidos
        </button>
      </div>
    );
  }

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="titulo">Pedido #{pedido.id}</h1>
          <EstadoPedido estado={pedido.estado} />
        </div>
        <button type="button" className="btn btn-secundario btn-chico" onClick={() => navigate(-1)}>
          <Icono nombre="volver" className="size-4" />
          Volver
        </button>
      </div>

      <dl className="tarjeta grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div>
          <dt className="subtitulo">Fecha</dt>
          <dd className="mt-1 font-medium">{formatearFecha(pedido.fecha)}</dd>
        </div>
        <div>
          <dt className="subtitulo">Cliente</dt>
          <dd className="mt-1 font-medium">
            {pedido.cliente}
            <span className="block text-sm font-normal text-neutral-500">{pedido.cliente_email}</span>
          </dd>
        </div>
        <div>
          <dt className="subtitulo">Dirección de envío</dt>
          <dd className="mt-1 font-medium">{pedido.direccion_envio}</dd>
        </div>
      </dl>

      <div>
        <h2 className="mb-3 text-lg font-bold tracking-tight">Productos</h2>
        <div className="tabla-caja">
          <table className="tabla">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio unitario</th>
                <th className="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {pedido.items.map((item) => (
                <tr key={item.id}>
                  <td className="font-medium">
                    {item.producto}
                    {item.producto_id === null && (
                      <span className="ml-2 text-xs font-normal text-neutral-500">(ya no está en el catálogo)</span>
                    )}
                  </td>
                  <td className="tabular-nums">{item.cantidad}</td>
                  <td className="tabular-nums">{formatearPrecio(item.precio_unitario)}</td>
                  <td className="text-right font-semibold tabular-nums">
                    {formatearPrecio(item.precio_unitario * item.cantidad)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="tarjeta flex items-baseline justify-between text-lg font-bold">
        Total: <span className="text-2xl font-black tracking-tight tabular-nums">{formatearPrecio(pedido.total)}</span>
      </p>
    </div>
  );
}
