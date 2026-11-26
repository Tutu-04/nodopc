const ICONOS = {
  procesador: 'M7 7h10v10H7z M10 10h4v4h-4z M9 2v3 M15 2v3 M9 19v3 M15 19v3 M2 9h3 M2 15h3 M19 9h3 M19 15h3',
  video:
    'M2 7h20v10H2z M8.5 9.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5 M15.5 9.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5 M5 17v3 M9 17v2',
  mother: 'M4 4h16v16H4z M8 8h5v5H8z M16 7v2 M16 12v5 M7 16h4',
  ram: 'M3 8h18v8H3z M7 11v2 M11 11v2 M15 11v2 M6 16v3 M18 16v3',
  disco: 'M4 5h16v14H4z M4 13h16 M8 16.5h.01 M12 16.5h4',
  pc: 'M7 2h10v20H7z M10 6h4 M10 10h4 M12 15.5a1.5 1.5 0 1 0 0 3a1.5 1.5 0 1 0 0-3',
  monitor: 'M3 4h18v12H3z M8 21h8 M12 16v5',
  perif: 'M2 7h20v10H2z M6 11h.01 M10 11h.01 M14 11h.01 M18 11h.01 M7 14h10',
  fuente: 'M13 2L4 14h7l-1 8 9-12h-7z',
  caja: 'M3 7l9-4 9 4v10l-9 4-9-4z M3 7l9 4 9-4 M12 11v10',
};

function normalizar(texto) {
  return (texto ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function elegirIcono(categoria) {
  const nombre = normalizar(categoria);

  if (nombre.includes('procesador')) return ICONOS.procesador;
  if (nombre.includes('video') || nombre.includes('grafica')) return ICONOS.video;
  if (nombre.includes('mother') || nombre.includes('placa madre')) return ICONOS.mother;
  if (nombre.includes('memoria') || nombre.includes('ram')) return ICONOS.ram;
  if (nombre.includes('almacenamiento') || nombre.includes('disco') || nombre.includes('ssd')) return ICONOS.disco;
  if (nombre.includes('pc') || nombre.includes('gabinete')) return ICONOS.pc;
  if (nombre.includes('monitor')) return ICONOS.monitor;
  if (nombre.includes('perif') || nombre.includes('teclado') || nombre.includes('mouse')) return ICONOS.perif;
  if (nombre.includes('fuente')) return ICONOS.fuente;
  return ICONOS.caja;
}

export default function IconoCategoria({ categoria, className = 'size-6', grosor = 1.8 }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={grosor}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={elegirIcono(categoria)} />
    </svg>
  );
}
