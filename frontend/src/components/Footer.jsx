import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-neutral-950 text-neutral-400">
      <div className="contenedor flex flex-col gap-8 py-12">
        <div className="flex flex-wrap justify-between gap-10">
          <div className="flex max-w-xs flex-col gap-3">
            <span className="text-lg font-black tracking-[0.2em] text-white">
              NODO<span className="text-orange-400">PC</span>
            </span>
            <p className="text-sm leading-relaxed">Componentes, PC armadas, monitores y periféricos.</p>
          </div>

          <nav aria-label="Pie de página" className="flex flex-col gap-2.5 text-sm">
            <span className="text-xs font-bold uppercase tracking-widest text-white">Navegación</span>
            <Link to="/" className="hover:text-white">
              Inicio
            </Link>
            <Link to="/catalogo" className="hover:text-white">
              Catálogo
            </Link>
            <Link to="/carrito" className="hover:text-white">
              Carrito
            </Link>
          </nav>

          <div className="flex flex-col gap-2.5 text-sm">
            <span className="text-xs font-bold uppercase tracking-widest text-white">Proyecto</span>
            <span>Proyecto final de Programación</span>
            <span>Lazarte · Paez Carabajal</span>
          </div>
        </div>

        <p className="border-t border-neutral-800 pt-5 text-sm">© 2026 NodoPC</p>
      </div>
    </footer>
  );
}
