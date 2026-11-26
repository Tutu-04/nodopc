import { Suspense } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Icono from './Icono';
import Cargando from './Cargando';

const SECCIONES = [
  { ruta: '/admin/productos', texto: 'Productos', icono: 'productos' },
  { ruta: '/admin/categorias', texto: 'Categorías', icono: 'categorias' },
  { ruta: '/admin/marcas', texto: 'Marcas', icono: 'marcas' },
  { ruta: '/admin/usuarios', texto: 'Usuarios', icono: 'usuarios' },
  { ruta: '/admin/pedidos', texto: 'Pedidos', icono: 'pedidos' },
];

function claseLink({ isActive }) {
  return isActive ? 'menu-link menu-link-activo' : 'menu-link';
}

export default function AdminLayout() {
  return (
    <div className="flex flex-wrap items-start gap-8">
      <aside className="tarjeta w-60 shrink-0 p-3">
        <p className="subtitulo px-3 pt-2 pb-3">Administración</p>
        <nav aria-label="Administración" className="flex flex-col gap-0.5">
          {SECCIONES.map((seccion) => (
            <NavLink key={seccion.ruta} to={seccion.ruta} className={claseLink}>
              <Icono nombre={seccion.icono} className="size-4.5" />
              {seccion.texto}
            </NavLink>
          ))}
        </nav>
      </aside>

      <section className="min-w-0 flex-1 basis-xl">
        <Suspense fallback={<Cargando />}>
          <Outlet />
        </Suspense>
      </section>
    </div>
  );
}
