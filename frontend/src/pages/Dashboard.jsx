import { useAuthStore } from '../store/authStore';
import DashboardAdmin from './DashboardAdmin';
import DashboardCliente from './DashboardCliente';

export default function Dashboard() {
  const usuario = useAuthStore((estado) => estado.usuario);

  return (
    <div>
      <p className="antetitulo mb-1">{usuario.rol === 'admin' ? 'Administrador' : 'Cliente'}</p>
      <h1 className="titulo mb-8">Hola, {usuario.nombre}</h1>

      {usuario.rol === 'admin' ? <DashboardAdmin /> : <DashboardCliente />}
    </div>
  );
}
