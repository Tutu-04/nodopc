const ICONOS = {
  carrito:
    'M2 3h3l2.6 12.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.5L21.5 8H6.2 M9 20.5a1 1 0 1 0 0-2a1 1 0 1 0 0 2 M18 20.5a1 1 0 1 0 0-2a1 1 0 1 0 0 2',
  buscar: 'M11 18a7 7 0 1 0 0-14a7 7 0 1 0 0 14 M20 20l-3.5-3.5',
  flecha: 'M5 12h14 M13 6l6 6-6 6',
  volver: 'M19 12H5 M11 6l-6 6 6 6',
  mas: 'M12 5v14 M5 12h14',
  menos: 'M5 12h14',
  envio:
    'M3 7h11v9H3z M14 10h4l3 3v3h-7z M7 19.5a1.5 1.5 0 1 0 0-3a1.5 1.5 0 1 0 0 3 M17 19.5a1.5 1.5 0 1 0 0-3a1.5 1.5 0 1 0 0 3',
  pago: 'M3 6h18v12H3z M3 10h18 M7 15h4',
  garantia: 'M12 3l8 3v6c0 4.5-3.4 8.2-8 9c-4.6-.8-8-4.5-8-9V6z M8.5 12l2.5 2.5l4.5-5',
  usuario: 'M12 12a4 4 0 1 0 0-8a4 4 0 1 0 0 8 M4 21a8 8 0 0 1 16 0',
  salir: 'M9 4H5v16h4 M16 8l4 4-4 4 M20 12H10',
  panel: 'M4 4h7v7H4z M13 4h7v4h-7z M13 10h7v10h-7z M4 13h7v7H4z',
  pedidos: 'M6 3h12v18l-3-2-3 2-3-2-3 2z M9 8h6 M9 12h6',
  productos: 'M3 7l9-4 9 4v10l-9 4-9-4z M3 7l9 4 9-4 M12 11v10',
  categorias: 'M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z',
  marcas: 'M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3.1-5.4 3.1 1.2-6-4.5-4.2 6.1-.7z',
  usuarios:
    'M9 11a3.5 3.5 0 1 0 0-7a3.5 3.5 0 1 0 0 7 M2.5 20a6.5 6.5 0 0 1 13 0 M16 4.5a3.5 3.5 0 0 1 0 6.5 M18 14a6.5 6.5 0 0 1 3.5 6',
  admin: 'M4 6h10 M18 6h2 M16 4v4 M4 12h4 M12 12h8 M10 10v4 M4 18h12 M18 16v4',
  check: 'M5 12l5 5 9-10',
  alerta: 'M12 3l10 18H2z M12 10v4 M12 17.5h.01',
  cerrar: 'M6 6l12 12 M18 6L6 18',
  inicio: 'M3 11l9-7 9 7 M5 10v10h14V10',
  anterior: 'M15 6l-6 6 6 6',
  siguiente: 'M9 6l6 6-6 6',
  menu: 'M4 7h16 M4 12h16 M4 17h16',
};

export type NombreDeIcono = keyof typeof ICONOS;

interface Props {
  nombre: NombreDeIcono;
  className?: string;
  grosor?: number;
}

export default function Icono({ nombre, className = 'size-5', grosor = 2 }: Props) {
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
      <path d={ICONOS[nombre]} />
    </svg>
  );
}
