import { Link } from 'react-router-dom';
import Icono from './Icono';

export function paginasVisibles(actual: number, total: number): (number | '…')[] {
  const paginas = new Set([1, total, actual - 1, actual, actual + 1]);
  const ordenadas = [...paginas].filter((pagina) => pagina >= 1 && pagina <= total).sort((a, b) => a - b);

  const resultado: (number | '…')[] = [];
  ordenadas.forEach((pagina, indice) => {
    if (indice > 0 && pagina - ordenadas[indice - 1] > 1) resultado.push('…');
    resultado.push(pagina);
  });
  return resultado;
}

const claseBoton =
  'flex min-h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition';

interface Props {
  pagina: number;
  paginas: number;
  enlace: (pagina: number) => string;
}

export default function Paginacion({ pagina, paginas, enlace }: Props) {
  if (paginas <= 1) return null;

  return (
    <nav aria-label="Paginación" className="flex flex-wrap items-center justify-center gap-1.5">
      {pagina > 1 && (
        <Link
          to={enlace(pagina - 1)}
          className={`${claseBoton} border-neutral-300 bg-white hover:bg-neutral-100`}
          aria-label="Página anterior"
        >
          <Icono nombre="anterior" className="size-4" />
        </Link>
      )}

      {paginasVisibles(pagina, paginas).map((numero, indice) =>
        numero === '…' ? (
          <span key={`salto-${indice}`} className="px-1 text-neutral-400">
            …
          </span>
        ) : (
          <Link
            key={numero}
            to={enlace(numero)}
            aria-current={numero === pagina ? 'page' : undefined}
            className={`${claseBoton} ${
              numero === pagina
                ? 'border-neutral-950 bg-neutral-950 text-white'
                : 'border-neutral-300 bg-white hover:bg-neutral-100'
            }`}
          >
            {numero}
          </Link>
        )
      )}

      {pagina < paginas && (
        <Link
          to={enlace(pagina + 1)}
          className={`${claseBoton} border-neutral-300 bg-white hover:bg-neutral-100`}
          aria-label="Página siguiente"
        >
          <Icono nombre="siguiente" className="size-4" />
        </Link>
      )}
    </nav>
  );
}
