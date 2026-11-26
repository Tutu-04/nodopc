export default function Cargando({ texto = 'Cargando...' }) {
  return (
    <p className="flex items-center gap-3 py-10 text-sm text-neutral-500">
      <span
        className="size-5 animate-spin rounded-full border-2 border-neutral-200 border-t-orange-700"
        aria-hidden="true"
      />
      {texto}
    </p>
  );
}
