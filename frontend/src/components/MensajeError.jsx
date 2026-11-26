import Icono from './Icono';

export default function MensajeError({ texto }) {
  if (!texto) return null;

  return (
    <p
      role="alert"
      className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      <Icono nombre="alerta" className="mt-0.5 size-4 shrink-0" />
      <span>{texto}</span>
    </p>
  );
}
