import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCarritoStore } from '../store/carritoStore';
import Cargando from '../components/Cargando';

export default function Salir() {
  const navigate = useNavigate();
  const cerrarSesion = useAuthStore((estado) => estado.cerrarSesion);
  const vaciarCarrito = useCarritoStore((estado) => estado.vaciar);

  useEffect(() => {
    cerrarSesion();
    vaciarCarrito();
    navigate('/', { replace: true });
  }, [cerrarSesion, vaciarCarrito, navigate]);

  return <Cargando />;
}
