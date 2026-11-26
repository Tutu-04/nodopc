export default function EncabezadoAcceso({ titulo, descripcion }) {
  return (
    <div className="mb-6 flex flex-col items-center gap-3 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-neutral-950 text-xl font-black text-white">
        N
      </span>
      <h1 className="titulo">{titulo}</h1>
      <p className="text-sm text-neutral-500">{descripcion}</p>
    </div>
  );
}
