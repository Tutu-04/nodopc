import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api, { obtenerMensajeError, pedirLinkDeMercadoPago } from '../api/api';
import { useAuthStore } from '../store/authStore';
import { formatearFecha, formatearPrecio } from '../utils/formato';
import { LOCAL } from '../utils/envios';
import EstadoPedido from '../components/EstadoPedido';
import SeguimientoPedido from '../components/SeguimientoPedido';
import TiempoParaPagar from '../components/TiempoParaPagar';
import BotonEliminar from '../components/BotonEliminar';
import Icono from '../components/Icono';
import Cargando from '../components/Cargando';
import MensajeError from '../components/MensajeError';

const MEDIOS = { mercadopago: 'Mercado Pago', simulado: 'Tarjeta de prueba' };

function Aviso({ tipo, children }) {
  const estilos = {
    exito: 'border-green-200 bg-green-50 text-green-900',
    info: 'border-sky-200 bg-sky-50 text-sky-950',
    alerta: 'border-amber-200 bg-amber-50 text-amber-950',
  };
  return (
    <p role="status" className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${estilos[tipo]}`}>
      <Icono nombre={tipo === 'exito' ? 'check' : 'alerta'} className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

function avisoDelPago(resultado, pedido) {
  if (!resultado) return null;
  if (pedido.estado === 'pagado') {
    return <Aviso tipo="exito">¡Listo! Recibimos tu pago. Te avisamos cuando el pedido cambie de estado.</Aviso>;
  }
  if (pedido.estado !== 'pendiente') return null;
  if (resultado === 'rechazado') {
    return <Aviso tipo="alerta">El pago no se pudo completar. Podés intentarlo de nuevo con otro medio.</Aviso>;
  }
  return <Aviso tipo="info">Mercado Pago todavía está procesando el pago. Te avisamos apenas se acredite.</Aviso>;
}

export default function PedidoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [parametros] = useSearchParams();
  const usuario = useAuthStore((estado) => estado.usuario);

  const [pedido, setPedido] = useState(null);
  const [medios, setMedios] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState(state?.aviso ?? '');
  const [yendoAPagar, setYendoAPagar] = useState(false);

  const resultadoDelPago = parametros.get('pago');

  const cargarPedido = useCallback(async () => {
    const respuesta = resultadoDelPago ? await api.post(`/pagos/${id}/verificar`) : await api.get(`/pedidos/${id}`);
    setPedido(respuesta.data);

    if (respuesta.data.estado === 'pendiente') {
      const respuestaMedios = await api.get('/pagos/medios');
      setMedios(respuestaMedios.data);
    }
  }, [id, resultadoDelPago]);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      setError('');
      try {
        await cargarPedido();
      } catch (e) {
        setError(obtenerMensajeError(e));
      } finally {
        setCargando(false);
      }
    }

    cargar();
  }, [cargarPedido]);

  async function pagarConMercadoPago() {
    setAviso('');
    setYendoAPagar(true);
    try {
      window.location.assign(await pedirLinkDeMercadoPago(pedido.id));
    } catch (e) {
      setAviso(obtenerMensajeError(e));
      setYendoAPagar(false);
    }
  }

  async function cancelar() {
    setAviso('');
    try {
      const respuesta = await api.post(`/pedidos/${pedido.id}/cancelar`);
      setPedido(respuesta.data);
    } catch (e) {
      setAviso(obtenerMensajeError(e));
    }
  }

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

  const esDueno = usuario?.id === pedido.usuario_id;
  const puedePagar = esDueno && pedido.estado === 'pendiente' && pedido.segundos_para_pagar !== 0;
  const subtotal = pedido.total - pedido.costo_envio;

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

      {avisoDelPago(resultadoDelPago, pedido)}
      <MensajeError texto={aviso} />

      {puedePagar && medios && (
        <section className="tarjeta flex flex-col gap-4 border-orange-200 bg-orange-50/40">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold">Falta el pago</h2>
            <TiempoParaPagar segundos={pedido.segundos_para_pagar} />
          </div>
          <div className="flex flex-wrap gap-3">
            {medios.mercadopago && (
              <button type="button" className="btn btn-acento" disabled={yendoAPagar} onClick={pagarConMercadoPago}>
                {yendoAPagar ? 'Abriendo Mercado Pago...' : 'Pagar con Mercado Pago'}
              </button>
            )}
            {medios.simulado && (
              <Link
                to={`/pedidos/${pedido.id}/pagar`}
                className={`btn ${medios.mercadopago ? 'btn-secundario' : 'btn-acento'}`}
              >
                Pagar con tarjeta de prueba
              </Link>
            )}
            <BotonEliminar onConfirmar={cancelar} texto="Cancelar pedido" textoConfirmar="Sí, cancelar" />
          </div>
        </section>
      )}

      <SeguimientoPedido pedido={pedido} />

      <dl className="tarjeta grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="subtitulo">Fecha</dt>
          <dd className="mt-1 font-medium">{formatearFecha(pedido.fecha)}</dd>
        </div>
        <div>
          <dt className="subtitulo">Cliente</dt>
          <dd className="mt-1 font-medium">
            {pedido.cliente}
            <span className="block text-sm font-normal break-all text-neutral-500">{pedido.cliente_email}</span>
          </dd>
        </div>
        <div>
          <dt className="subtitulo">
            {pedido.metodo_entrega === 'envio' ? 'Envío a domicilio' : 'Retiro en el local'}
          </dt>
          <dd className="mt-1 font-medium">
            {pedido.metodo_entrega === 'envio' ? pedido.direccion_envio : LOCAL.direccion}
            <span className="block text-sm font-normal text-neutral-500">
              {pedido.metodo_entrega === 'envio' ? pedido.provincia : LOCAL.horario}
            </span>
          </dd>
        </div>
        <div>
          <dt className="subtitulo">Pago</dt>
          <dd className="mt-1 font-medium">
            {pedido.pagado_en ? (MEDIOS[pedido.medio_pago] ?? 'Acreditado a mano') : 'Sin pagar'}
            {pedido.pagado_en && (
              <span className="block text-sm font-normal text-neutral-500">
                {formatearFecha(pedido.pagado_en)}
                {pedido.pago_id && (
                  <>
                    {' · '}
                    <span className="whitespace-nowrap">Operación {pedido.pago_id}</span>
                  </>
                )}
              </span>
            )}
          </dd>
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

      <dl className="tarjeta ml-auto flex w-full max-w-sm flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-neutral-600">Subtotal</dt>
          <dd className="font-semibold tabular-nums">{formatearPrecio(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-neutral-600">Envío</dt>
          <dd className="font-semibold tabular-nums">
            {pedido.costo_envio > 0 ? formatearPrecio(pedido.costo_envio) : 'Gratis'}
          </dd>
        </div>
        <div className="mt-2 flex items-baseline justify-between border-t border-neutral-100 pt-3 text-base font-bold">
          <dt>Total</dt>
          <dd className="text-2xl font-black tracking-tight tabular-nums">{formatearPrecio(pedido.total)}</dd>
        </div>
      </dl>
    </div>
  );
}
