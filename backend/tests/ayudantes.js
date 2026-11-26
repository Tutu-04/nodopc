import request from 'supertest';
import app from '../src/app.js';

export function api() {
  return request(app);
}

export function cookieDeSesion(respuesta) {
  const cookie = respuesta.headers['set-cookie']?.find((linea) => linea.startsWith('nodopc_sesion='));
  return cookie?.split(';')[0];
}

export async function ingresar(email, password) {
  const respuesta = await api().post('/api/auth/login').send({ email, password });
  return cookieDeSesion(respuesta);
}

export function ingresarComoAdmin() {
  return ingresar('admin@nodopc.com', 'admin123');
}

export function ingresarComoCliente() {
  return ingresar('cliente@nodopc.com', 'cliente123');
}

export function conSesion(cookie) {
  return { Cookie: cookie };
}
