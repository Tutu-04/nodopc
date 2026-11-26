import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCarritoStore, contarProductos } from '../store/carritoStore';
import Icono from './Icono';

function claseLink({ isActive }: { isActive: boolean }): string {
  return isActive ? 'nav-link nav-link-activo' : 'nav-link';
}

export default function Navbar() {
  const navigate = useNavigate();
  const usuario = useAuthStore((estado) => estado.usuario);
  const items = useCarritoStore((estado) => estado.items);

  const { pathname } = useLocation();

  const [busqueda, setBusqueda] = useState('');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const cantidadCarrito = contarProductos(items);

  useEffect(() => {
    setMenuAbierto(false);
  }, [pathname]);

  const enlaces = [
    { a: '/', texto: 'Inicio', exacto: true },
    { a: '/catalogo', texto: 'Catálogo' },
    { a: '/armador', texto: 'Armá tu PC' },
    ...(usuario
      ? [
          { a: '/dashboard', texto: 'Mi panel' },
          { a: '/mis-pedidos', texto: 'Mis pedidos' },
        ]
      : []),
    ...(usuario?.rol === 'admin' ? [{ a: '/admin', texto: 'Administración' }] : []),
  ];

  function salir() {
    navigate('/salir');
  }

  function buscar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const texto = busqueda.trim();
    setBusqueda('');
    navigate(texto ? `/catalogo?buscar=${encodeURIComponent(texto)}` : '/catalogo');
  }

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="contenedor flex flex-wrap items-center gap-x-6 gap-y-3 py-3.5">
        <Link to="/" className="flex items-center gap-2.5" aria-label="NodoPC, ir al inicio">
          <span className="flex size-9 items-center justify-center rounded-lg bg-neutral-950 text-lg font-black text-white">
            N
          </span>
          <span className="text-lg font-black tracking-[0.2em]">
            NODO<span className="text-orange-700">PC</span>
          </span>
        </Link>

        <form
          role="search"
          onSubmit={buscar}
          className="order-last flex h-11 w-full min-w-0 items-center md:order-none md:w-auto md:flex-1 md:basis-72 gap-2.5 rounded-full border border-neutral-200 bg-neutral-100 px-4 focus-within:border-orange-600 focus-within:ring-4 focus-within:ring-orange-100"
        >
          <Icono nombre="buscar" className="size-4.5 shrink-0 text-neutral-500" />
          <label htmlFor="buscador-encabezado" className="sr-only">
            Buscar productos
          </label>
          <input
            id="buscador-encabezado"
            type="search"
            className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-500"
            placeholder="Buscar procesadores, monitores, teclados…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </form>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            {usuario ? (
              <>
                <Link
                  to="/cuenta"
                  className="flex min-h-9 items-center gap-2 rounded-lg px-2 text-sm text-neutral-600 hover:bg-neutral-100"
                >
                  <Icono nombre="usuario" className="size-4.5" />
                  Hola, <strong className="font-semibold text-neutral-950">{usuario.nombre}</strong>
                </Link>
                <button type="button" onClick={salir} className="btn btn-secundario btn-chico">
                  <Icono nombre="salir" className="size-4" />
                  Salir
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={claseLink}>
                  Ingresar
                </NavLink>
                <Link to="/registro" className="btn btn-chico">
                  Crear cuenta
                </Link>
              </>
            )}
          </div>

          <NavLink
            to="/carrito"
            aria-label={`Carrito, ${cantidadCarrito} ${cantidadCarrito === 1 ? 'producto' : 'productos'}`}
            className={({ isActive }) =>
              `relative inline-flex h-11 items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold transition ${
                isActive ? 'border-neutral-950 bg-neutral-950 text-white' : 'border-neutral-200 hover:bg-neutral-100'
              }`
            }
          >
            <Icono nombre="carrito" className="size-5" />
            <span className="hidden sm:inline">Carrito</span>
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-orange-700 px-1.5 text-xs font-bold text-white">
              {cantidadCarrito}
            </span>
          </NavLink>

          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-xl border border-neutral-200 hover:bg-neutral-100 md:hidden"
            aria-expanded={menuAbierto}
            aria-controls="menu-movil"
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMenuAbierto((abierto) => !abierto)}
          >
            <Icono nombre={menuAbierto ? 'cerrar' : 'menu'} className="size-5" />
          </button>
        </div>
      </div>

      {menuAbierto && (
        <div id="menu-movil" className="border-t border-neutral-100 md:hidden">
          <nav aria-label="Menú" className="contenedor flex flex-col gap-1 py-3">
            {enlaces.map((enlace) => (
              <NavLink key={enlace.a} to={enlace.a} end={enlace.exacto} className={claseLink}>
                {enlace.texto}
              </NavLink>
            ))}
            <div className="mt-2 flex flex-wrap gap-2 border-t border-neutral-100 pt-3">
              {usuario ? (
                <>
                  <Link to="/cuenta" className="btn btn-secundario btn-chico">
                    <Icono nombre="usuario" className="size-4" />
                    Mi cuenta
                  </Link>
                  <button type="button" onClick={salir} className="btn btn-secundario btn-chico">
                    <Icono nombre="salir" className="size-4" />
                    Salir
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-secundario btn-chico">
                    Ingresar
                  </Link>
                  <Link to="/registro" className="btn btn-chico">
                    Crear cuenta
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}

      <div className="hidden border-t border-neutral-100 md:block">
        <nav aria-label="Principal" className="contenedor flex flex-wrap items-center gap-1 py-2">
          {enlaces.map((enlace) => (
            <NavLink key={enlace.a} to={enlace.a} end={enlace.exacto} className={claseLink}>
              {enlace.texto}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
