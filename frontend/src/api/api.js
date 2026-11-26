import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    if (error.response?.status === 401 && useAuthStore.getState().usuario) {
      useAuthStore.getState().cerrarSesion();
    }
    return Promise.reject(error);
  }
);

export function obtenerMensajeError(error) {
  return error.response?.data?.error || 'No se pudo conectar con el servidor';
}

export default api;
