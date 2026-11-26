import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuthStore } from '../store/authStore';
import { useCarritoStore } from '../store/carritoStore';
import Cargando from '../components/Cargando';

export default function Salir() {
  const navigate = useNavigate();
  const cerrarSesion = useAuthStore((estado) => estado.cerrarSesion);
  const vaciarCarrito = useCarritoStore((estado) => estado.vaciar);

  useEffect(() => {
    async function salir() {
      try {
        await api.post('/auth/salir');
      } finally {
        cerrarSesion();
        vaciarCarrito();
        navigate('/', { replace: true });
      }
    }

    salir();
  }, [cerrarSesion, vaciarCarrito, navigate]);

  return <Cargando />;
}
