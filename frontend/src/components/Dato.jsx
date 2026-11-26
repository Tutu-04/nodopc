export default function Dato({ titulo, valor }) {
  return (
    <div className="tarjeta p-5">
      <p className="subtitulo">{titulo}</p>
      <p className="mt-2 text-2xl font-extrabold tracking-tight tabular-nums">{valor}</p>
    </div>
  );
}
