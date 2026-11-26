import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { obtenerMensajeError } from '../api/api';
import { formatearPrecio } from '../utils/formato';
import { TARJETA_DE_PRUEBA, formatearNumeroDeTarjeta, formatearVencimiento } from '../utils/tarjetas';
import Cargando from '../components/Cargando';
import MensajeError from '../components/MensajeError';
import Icono from '../components/Icono';
import TiempoParaPagar from '../components/TiempoParaPagar';
import type { PedidoConItems } from '../tipos';

const TARJETA_VACIA = { numero: '', titular: '', vencimiento: '', cvv: '' };

export default function PagoSimulado() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pedido, setPedido] = useState<PedidoConItems | null>(null);
  const [tarjeta, setTarjeta] = useState(TARJETA_VACIA);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [pagando, setPagando] = useState(false);

  useEffect(() => {
    async function cargarPedido() {
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

  function cambiar(campo: keyof typeof TARJETA_VACIA, valor: string) {
    setTarjeta((actual) => ({ ...actual, [campo]: valor }));
  }

  async function manejarSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError('');
    setPagando(true);
    try {
      await api.post(`/pagos/${id}/simulado`, tarjeta);
      navigate(`/pedidos/${id}?pago=aprobado`, { replace: true });
    } catch (e) {
      setError(obtenerMensajeError(e));
      setPagando(false);
    }
  }

  if (cargando) return <Cargando />;

  if (!pedido) {
    return (
      <div className="tarjeta flex flex-col items-start gap-4">
        <MensajeError texto={error} />
        <Link to="/mis-pedidos" className="btn btn-secundario">
          Ir a mis pedidos
        </Link>
      </div>
    );
  }

  if (pedido.estado !== 'pendiente') {
    return (
      <div className="tarjeta flex max-w-xl flex-col items-start gap-4">
        <h1 className="titulo">Pedido #{pedido.id}</h1>
        <p className="text-neutral-600">Este pedido ya no está pendiente de pago.</p>
        <Link to={`/pedidos/${pedido.id}`} className="btn btn-acento">
          Ver el pedido
        </Link>
      </div>
    );
  }

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <p className="antetitulo">Pedido #{pedido.id}</p>
        <h1 className="titulo mt-1">Pagar {formatearPrecio(pedido.total)}</h1>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
        <Icono nombre="pago" className="mt-0.5 size-4 shrink-0" />
        <div className="flex flex-col gap-1">
          <p>
            <strong>Pago simulado.</strong> No se cobra nada y los datos de la tarjeta no se guardan.
          </p>
          <p>
            Usá la tarjeta {TARJETA_DE_PRUEBA.numero} con cualquier vencimiento futuro. Para simular un rechazo, poné
            FUND (fondos insuficientes) u OTHE como titular.
          </p>
        </div>
      </div>

      <MensajeError texto={error} />

      <form onSubmit={manejarSubmit} className="tarjeta flex flex-col gap-5">
        <TiempoParaPagar segundos={pedido.segundos_para_pagar} />

        <div>
          <label htmlFor="numero" className="etiqueta">
            Número de tarjeta
          </label>
          <input
            id="numero"
            className="campo tabular-nums"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="0000 0000 0000 0000"
            required
            value={tarjeta.numero}
            onChange={(e) => cambiar('numero', formatearNumeroDeTarjeta(e.target.value))}
          />
        </div>

        <div>
          <label htmlFor="titular" className="etiqueta">
            Titular
          </label>
          <input
            id="titular"
            className="campo uppercase"
            autoComplete="cc-name"
            placeholder="Como figura en la tarjeta"
            required
            maxLength={60}
            value={tarjeta.titular}
            onChange={(e) => cambiar('titular', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="vencimiento" className="etiqueta">
              Vencimiento
            </label>
            <input
              id="vencimiento"
              className="campo tabular-nums"
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM/AA"
              required
              value={tarjeta.vencimiento}
              onChange={(e) => cambiar('vencimiento', formatearVencimiento(e.target.value))}
            />
          </div>
          <div>
            <label htmlFor="cvv" className="etiqueta">
              Código de seguridad
            </label>
            <input
              id="cvv"
              className="campo tabular-nums"
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="123"
              required
              maxLength={4}
              value={tarjeta.cvv}
              onChange={(e) => cambiar('cvv', e.target.value.replace(/\D/g, ''))}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn btn-acento min-h-12 px-6 text-base" disabled={pagando}>
            {pagando ? 'Procesando...' : `Pagar ${formatearPrecio(pedido.total)}`}
          </button>
          <button type="button" className="btn btn-secundario min-h-12" onClick={() => setTarjeta(TARJETA_DE_PRUEBA)}>
            Completar con la tarjeta de prueba
          </button>
        </div>
      </form>

      <Link to={`/pedidos/${pedido.id}`} className="text-sm font-semibold text-neutral-600 hover:text-neutral-950">
        Pagar más tarde
      </Link>
    </div>
  );
}
