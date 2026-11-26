import { useEffect } from 'react';
import api from '../api/api';
import { useAuthStore } from '../store/authStore';

export default function useRevalidarSesion() {
  const iniciarSesion = useAuthStore((estado) => estado.iniciarSesion);

  useEffect(() => {
    if (!useAuthStore.getState().usuario) return;

    let vigente = true;

    api
      .get('/auth/yo')
      .then((respuesta) => {
        if (vigente) iniciarSesion(respuesta.data.usuario);
      })
      .catch(() => {});

    return () => {
      vigente = false;
    };
  }, [iniciarSesion]);
}
