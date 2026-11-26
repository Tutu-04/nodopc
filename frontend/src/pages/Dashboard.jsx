import { lazy, Suspense } from 'react';
import { useAuthStore } from '../store/authStore';
import Cargando from '../components/Cargando';
import DashboardCliente from './DashboardCliente';

const DashboardAdmin = lazy(() => import('./DashboardAdmin'));

export default function Dashboard() {
  const usuario = useAuthStore((estado) => estado.usuario);

  return (
    <div>
      <p className="antetitulo mb-1">{usuario.rol === 'admin' ? 'Administrador' : 'Cliente'}</p>
      <h1 className="titulo mb-8">Hola, {usuario.nombre}</h1>

      {usuario.rol === 'admin' ? (
        <Suspense fallback={<Cargando />}>
          <DashboardAdmin />
        </Suspense>
      ) : (
        <DashboardCliente />
      )}
    </div>
  );
}
