import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function RutaSoloInvitados() {
  const usuario = useAuthStore((estado) => estado.usuario);
  const location = useLocation();

  if (usuario) {
    const destino = location.state?.desde || '/dashboard';
    return <Navigate to={destino} replace />;
  }

  return <Outlet />;
}
