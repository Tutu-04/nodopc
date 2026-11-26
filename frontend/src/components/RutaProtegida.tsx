import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function RutaProtegida({ soloAdmin = false }: { soloAdmin?: boolean }) {
  const usuario = useAuthStore((estado) => estado.usuario);
  const location = useLocation();

  if (!usuario) {
    return <Navigate to="/login" state={{ desde: location.pathname }} replace />;
  }

  if (soloAdmin && usuario.rol !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
