import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const URL_API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const ORIGEN_API = URL_API.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: URL_API,
  withCredentials: true,
});

export function urlDeImagen(url) {
  if (url?.startsWith('/uploads/')) return ORIGEN_API + url;
  return url;
}

export function subirImagenDeProducto(id, archivo) {
  const formulario = new FormData();
  formulario.append('imagen', archivo);
  return api.post(`/productos/${id}/imagen`, formulario);
}

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
