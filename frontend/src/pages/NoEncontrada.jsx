import { Link } from 'react-router-dom';

export default function NoEncontrada() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-5 py-16 text-center">
      <p className="text-7xl font-black tracking-tight text-orange-700">404</p>
      <h1 className="titulo">No encontramos esta página</h1>
      <p className="text-neutral-600">Puede que la dirección esté mal escrita o que la página ya no exista.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link to="/catalogo" className="btn btn-acento">
          Ver el catálogo
        </Link>
        <Link to="/" className="btn btn-secundario">
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
