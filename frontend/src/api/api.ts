import axios from 'axios';
import type { AxiosError } from 'axios';
import { useAuthStore } from '../store/authStore';

const URL_API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const ORIGEN_API = URL_API.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: URL_API,
  withCredentials: true,
});

export function urlDeImagen(url: string | null | undefined): string | null | undefined {
  if (url?.startsWith('/uploads/')) return ORIGEN_API + url;
  return url;
}

export function subirImagenDeProducto(id: number, archivo: File) {
  const formulario = new FormData();
  formulario.append('imagen', archivo);
  return api.post(`/productos/${id}/imagen`, formulario);
}

export async function pedirLinkDeMercadoPago(pedidoId: number): Promise<string> {
  const respuesta = await api.post<{ url: string }>(`/pagos/${pedidoId}/mercadopago`);
  return respuesta.data.url;
}

api.interceptors.response.use(
  (respuesta) => respuesta,
  (error: AxiosError) => {
    if (error.response?.status === 401 && useAuthStore.getState().usuario) {
      useAuthStore.getState().cerrarSesion();
    }
    return Promise.reject(error);
  }
);

export function obtenerMensajeError(error: unknown): string {
  const respuesta = (error as AxiosError<{ error?: string }>)?.response;
  return respuesta?.data?.error || 'No se pudo conectar con el servidor';
}

export default api;
