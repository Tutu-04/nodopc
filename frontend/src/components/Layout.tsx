import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Cargando from './Cargando';
import useRevalidarSesion from '../hooks/useRevalidarSesion';

export default function Layout() {
  useRevalidarSesion();

  return (
    <div className="flex min-h-screen flex-col">
      <p className="bg-neutral-950 px-4 py-2 text-center text-xs text-neutral-300">
        Envíos a todo el país · Retiro en el local · Garantía oficial en todos los productos
      </p>
      <Navbar />
      <main className="contenedor flex-1 py-10">
        <Suspense fallback={<Cargando />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
