import { useCuentaRegresiva } from '../hooks/useCuentaRegresiva';
import { formatearCuentaRegresiva } from '../utils/tarjetas';

export default function TiempoParaPagar({ segundos }) {
  const restantes = useCuentaRegresiva(segundos);
  if (restantes === null) return null;

  return (
    <p className="text-sm text-neutral-600">
      {restantes > 0 ? (
        <>
          Tenés <strong className="tabular-nums">{formatearCuentaRegresiva(restantes)}</strong> para completar el pago.
        </>
      ) : (
        <strong className="text-red-700">Se terminó el tiempo para pagar este pedido.</strong>
      )}
    </p>
  );
}
