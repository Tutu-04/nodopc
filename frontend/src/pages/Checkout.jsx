import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { obtenerMensajeError } from '../api/api';
import { useCarritoStore, calcularTotal } from '../store/carritoStore';
import { formatearPrecio } from '../utils/formato';
import Cargando from '../components/Cargando';
import MensajeError from '../components/MensajeError';

export default function Checkout() {
  const navigate = useNavigate();
  const items = useCarritoStore((estado) => estado.items);
  const vaciar = useCarritoStore((estado) => estado.vaciar);

  const [direccion, setDireccion] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function manejarSubmit(evento) {
    evento.preventDefault();
    setError('');
    setEnviando(true);

    try {
      const respuesta = await api.post('/pedidos', {
        direccion_envio: direccion,
        items: items.map((item) => ({ producto_id: item.id, cantidad: item.cantidad })),
      });

      vaciar();
      navigate(`/pedidos/${respuesta.data.id}`, { replace: true });
    } catch (e) {
      setError(obtenerMensajeError(e));
      setEnviando(false);
    }
  }

  if (enviando) return <Cargando texto="Enviando tu pedido..." />;

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

  return (
    <div className="flex flex-col gap-6">
      <h1 className="titulo">Finalizar compra</h1>

      <MensajeError texto={error} />

      <div className="flex flex-wrap items-start gap-6">
        <form onSubmit={manejarSubmit} className="tarjeta flex min-w-0 flex-1 basis-96 flex-col gap-5">
          <h2 className="text-lg font-bold">Datos de envío</h2>
          <div>
            <label htmlFor="direccion" className="etiqueta">
              Dirección de envío
            </label>
            <input
              id="direccion"
              type="text"
              className="campo"
              placeholder="Calle, número y ciudad"
              required
              minLength={5}
              maxLength={200}
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn btn-acento min-h-12 px-6 text-base">
              Confirmar pedido
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
          <p className="flex items-baseline justify-between border-t border-neutral-100 pt-4 font-bold">
            Total
            <span className="text-2xl font-black tracking-tight tabular-nums">{formatearPrecio(calcularTotal(items))}</span>
          </p>
        </aside>
      </div>
    </div>
  );
}
