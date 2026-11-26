import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { obtenerMensajeError, pedirLinkDeMercadoPago } from '../api/api';
import { useCarritoStore, calcularTotal } from '../store/carritoStore';
import { formatearPrecio } from '../utils/formato';
import { LOCAL, calcularEnvio, faltaParaEnvioGratis } from '../utils/envios';
import Cargando from '../components/Cargando';
import MensajeError from '../components/MensajeError';
import Opcion from '../components/Opcion';

export default function Checkout() {
  const navigate = useNavigate();
  const items = useCarritoStore((estado) => estado.items);
  const vaciar = useCarritoStore((estado) => estado.vaciar);

  const [condiciones, setCondiciones] = useState(null);
  const [medios, setMedios] = useState(null);
  const [metodo, setMetodo] = useState('envio');
  const [provincia, setProvincia] = useState('');
  const [direccion, setDireccion] = useState('');
  const [medio, setMedio] = useState('');

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    async function cargarOpciones() {
      try {
        const [respuestaEnvios, respuestaMedios] = await Promise.all([api.get('/envios'), api.get('/pagos/medios')]);
        setCondiciones(respuestaEnvios.data);
        setMedios(respuestaMedios.data);
        setMedio(respuestaMedios.data.mercadopago ? 'mercadopago' : respuestaMedios.data.simulado ? 'simulado' : '');
      } catch (e) {
        setError(obtenerMensajeError(e));
      } finally {
        setCargando(false);
      }
    }

    cargarOpciones();
  }, []);

  const subtotal = calcularTotal(items);
  const envio = calcularEnvio({ metodo, provincia, subtotal, condiciones });
  const faltante = faltaParaEnvioGratis(subtotal, condiciones);

  async function manejarSubmit(evento) {
    evento.preventDefault();
    setError('');
    setEnviando(true);

    let pedido;
    try {
      const respuesta = await api.post('/pedidos', {
        metodo_entrega: metodo,
        provincia: metodo === 'envio' ? provincia : undefined,
        direccion_envio: metodo === 'envio' ? direccion : undefined,
        items: items.map((item) => ({ producto_id: item.id, cantidad: item.cantidad })),
      });
      pedido = respuesta.data;
      vaciar();
    } catch (e) {
      setError(obtenerMensajeError(e));
      setEnviando(false);
      return;
    }

    if (medio === 'simulado') {
      navigate(`/pedidos/${pedido.id}/pagar`, { replace: true });
      return;
    }

    try {
      window.location.assign(await pedirLinkDeMercadoPago(pedido.id));
    } catch (e) {
      navigate(`/pedidos/${pedido.id}`, { replace: true, state: { aviso: obtenerMensajeError(e) } });
    }
  }

  if (cargando) return <Cargando />;
  if (enviando) return <Cargando texto="Preparando tu pedido..." />;

  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="titulo">Finalizar compra</h1>
        <div className="tarjeta flex flex-col items-start gap-4">
          <p className="text-neutral-600">No hay productos en tu carrito.</p>
          <Link to="/catalogo" className="btn btn-acento">
            Ir al catálogo
          </Link>
        </div>
      </div>
    );
  }

  const hayMedios = medios && (medios.mercadopago || medios.simulado);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="titulo">Finalizar compra</h1>

      <MensajeError texto={error} />

      <div className="flex flex-wrap items-start gap-6">
        <form onSubmit={manejarSubmit} className="flex min-w-0 flex-1 basis-96 flex-col gap-6">
          <fieldset className="tarjeta flex flex-col gap-4">
            <legend className="sr-only">Entrega</legend>
            <h2 className="text-lg font-bold">1. Entrega</h2>

            <div className="grid gap-3 sm:grid-cols-2">
              <Opcion
                nombre="entrega"
                valor="envio"
                elegido={metodo === 'envio'}
                onElegir={setMetodo}
                titulo="Envío a domicilio"
                detalle={condiciones && `Gratis en compras desde ${formatearPrecio(condiciones.envioGratisDesde)}`}
              />
              <Opcion
                nombre="entrega"
                valor="retiro"
                elegido={metodo === 'retiro'}
                onElegir={setMetodo}
                titulo="Retiro en el local"
                detalle={LOCAL.direccion}
                extra="Gratis"
              />
            </div>

            {metodo === 'envio' ? (
              <div className="grid gap-4 sm:grid-cols-[minmax(0,14rem)_1fr]">
                <div>
                  <label htmlFor="provincia" className="etiqueta">
                    Provincia
                  </label>
                  <select
                    id="provincia"
                    className="campo"
                    required
                    value={provincia}
                    onChange={(e) => setProvincia(e.target.value)}
                  >
                    <option value="">Elegí una provincia</option>
                    {condiciones?.provincias.map((opcion) => (
                      <option key={opcion.nombre} value={opcion.nombre}>
                        {opcion.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="direccion" className="etiqueta">
                    Dirección
                  </label>
                  <input
                    id="direccion"
                    type="text"
                    className="campo"
                    placeholder="Calle, número, piso y ciudad"
                    required
                    minLength={5}
                    maxLength={200}
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                  />
                </div>
                {faltante > 0 && (
                  <p className="ayuda sm:col-span-2">
                    Te faltan {formatearPrecio(faltante)} para tener el envío gratis.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-neutral-600">
                Te avisamos cuando esté listo. Horario de atención: {LOCAL.horario}.
              </p>
            )}
          </fieldset>

          <fieldset className="tarjeta flex flex-col gap-4">
            <legend className="sr-only">Pago</legend>
            <h2 className="text-lg font-bold">2. Pago</h2>

            {!hayMedios ? (
              <p className="text-sm text-neutral-600">Por el momento no hay medios de pago habilitados.</p>
            ) : (
              <div className="grid gap-3">
                {medios.mercadopago && (
                  <Opcion
                    nombre="medio"
                    valor="mercadopago"
                    elegido={medio === 'mercadopago'}
                    onElegir={setMedio}
                    titulo="Mercado Pago"
                    detalle="Tarjeta de crédito, débito, dinero en cuenta o efectivo. Te llevamos a Mercado Pago."
                  />
                )}
                {medios.simulado && (
                  <Opcion
                    nombre="medio"
                    valor="simulado"
                    elegido={medio === 'simulado'}
                    onElegir={setMedio}
                    titulo="Tarjeta de prueba"
                    detalle="Pago simulado para probar la tienda. No se cobra nada."
                  />
                )}
              </div>
            )}
          </fieldset>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn btn-acento min-h-12 px-6 text-base" disabled={!hayMedios || !medio}>
              {medio === 'mercadopago' ? 'Confirmar e ir a pagar' : 'Confirmar y pagar'}
            </button>
            <Link to="/carrito" className="btn btn-secundario min-h-12 px-6 text-base">
              Volver al carrito
            </Link>
          </div>
        </form>

        <aside className="tarjeta flex w-full flex-col gap-4 lg:w-96">
          <h2 className="text-lg font-bold">Resumen</h2>
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 text-sm">
                <span className="text-neutral-600">
                  {item.cantidad} × {item.nombre}
                </span>
                <span className="font-semibold whitespace-nowrap tabular-nums">
                  {formatearPrecio(item.precio * item.cantidad)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="flex flex-col gap-2 border-t border-neutral-100 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-600">Subtotal</dt>
              <dd className="font-semibold tabular-nums">{formatearPrecio(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-600">Envío</dt>
              <dd className="font-semibold tabular-nums">
                {envio === null ? 'Elegí la provincia' : envio === 0 ? 'Gratis' : formatearPrecio(envio)}
              </dd>
            </div>
          </dl>

          <p className="flex items-baseline justify-between border-t border-neutral-100 pt-4 font-bold">
            Total
            <span className="text-2xl font-black tracking-tight tabular-nums">
              {formatearPrecio(subtotal + (envio ?? 0))}
            </span>
          </p>

          {condiciones && (
            <p className="ayuda mt-0">
              Al confirmar reservamos el stock durante {condiciones.minutosParaPagar} minutos para que completes el
              pago.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
