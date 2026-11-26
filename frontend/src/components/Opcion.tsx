import type { ReactNode } from 'react';

interface Props<T extends string> {
  nombre: string;
  valor: T;
  elegido: boolean;
  onElegir: (valor: T) => void;
  titulo: ReactNode;
  detalle?: ReactNode;
  extra?: ReactNode;
  deshabilitada?: boolean;
}

export default function Opcion<T extends string>({
  nombre,
  valor,
  elegido,
  onElegir,
  titulo,
  detalle,
  extra,
  deshabilitada = false,
}: Props<T>) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
        elegido ? 'border-orange-600 bg-orange-50 ring-4 ring-orange-100' : 'border-neutral-300 hover:bg-neutral-50'
      } ${deshabilitada ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      <input
        type="radio"
        name={nombre}
        value={valor}
        checked={elegido}
        disabled={deshabilitada}
        onChange={() => onElegir(valor)}
        className="mt-1 size-4 accent-orange-700"
      />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex flex-wrap items-baseline justify-between gap-2 font-semibold">
          {titulo}
          {extra && <span className="text-sm font-bold tabular-nums">{extra}</span>}
        </span>
        {detalle && <span className="text-sm text-neutral-600">{detalle}</span>}
      </span>
    </label>
  );
}
