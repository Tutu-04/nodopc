import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCarritoStore, contarProductos } from '../store/carritoStore';
import Icono from './Icono';

function claseLink({ isActive }) {
  return isActive ? 'nav-link nav-link-activo' : 'nav-link';
}

export default function Navbar() {
  const navigate = useNavigate();
  const usuario = useAuthStore((estado) => estado.usuario);
  const items = useCarritoStore((estado) => estado.items);

  const [busqueda, setBusqueda] = useState('');
  const cantidadCarrito = contarProductos(items);

  function salir() {
    navigate('/salir');
  }

  function buscar(evento) {
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
          className="flex h-11 min-w-0 flex-1 basis-72 items-center gap-2.5 rounded-full border border-neutral-200 bg-neutral-100 px-4 focus-within:border-orange-600 focus-within:ring-4 focus-within:ring-orange-100"
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

        <div className="flex flex-wrap items-center gap-2">
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
            Carrito
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-orange-700 px-1.5 text-xs font-bold text-white">
              {cantidadCarrito}
            </span>
          </NavLink>
        </div>
      </div>

      <div className="border-t border-neutral-100">
        <nav aria-label="Principal" className="contenedor flex flex-wrap items-center gap-1 py-2">
          <NavLink to="/" end className={claseLink}>
            Inicio
          </NavLink>
          <NavLink to="/catalogo" className={claseLink}>
            Catálogo
          </NavLink>

          {usuario && (
            <>
              <NavLink to="/dashboard" className={claseLink}>
                Mi panel
              </NavLink>
              <NavLink to="/mis-pedidos" className={claseLink}>
                Mis pedidos
              </NavLink>
            </>
          )}

          {usuario?.rol === 'admin' && (
            <NavLink to="/admin" className={claseLink}>
              Administración
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
