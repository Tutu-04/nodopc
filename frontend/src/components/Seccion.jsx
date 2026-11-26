export default function Seccion({ titulo, descripcion, children }) {
  return (
    <section className="tarjeta flex min-w-0 flex-col gap-5">
      <div>
        <h2 className="text-lg font-bold tracking-tight">{titulo}</h2>
        {descripcion && <p className="mt-1 text-sm text-neutral-500">{descripcion}</p>}
      </div>
      {children}
    </section>
  );
}
