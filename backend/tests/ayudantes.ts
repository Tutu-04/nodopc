import request from 'supertest';
import app from '../src/app.js';
import type { Response } from 'supertest';

export function api() {
  return request(app);
}

export function cookieDeSesion(respuesta: Response): string {
  const encabezado = respuesta.headers['set-cookie'] as unknown as string[] | undefined;
  const cookie = encabezado?.find((linea) => linea.startsWith('nodopc_sesion='));
  return cookie?.split(';')[0] ?? '';
}

export async function ingresar(email: string, password: string): Promise<string> {
  const respuesta = await api().post('/api/auth/login').send({ email, password });
  return cookieDeSesion(respuesta);
}

export function ingresarComoAdmin(): Promise<string> {
  return ingresar('admin@nodopc.com', 'admin123');
}

export function ingresarComoCliente(): Promise<string> {
  return ingresar('cliente@nodopc.com', 'cliente123');
}

export function conSesion(cookie: string): { Cookie: string } {
  return { Cookie: cookie };
}
