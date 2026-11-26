import request from 'supertest';
import app from '../src/app.js';

export function api() {
  return request(app);
}

export async function ingresar(email, password) {
  const respuesta = await api().post('/api/auth/login').send({ email, password });
  return respuesta.body.token;
}

export function ingresarComoAdmin() {
  return ingresar('admin@nodopc.com', 'admin123');
}

export function ingresarComoCliente() {
  return ingresar('cliente@nodopc.com', 'cliente123');
}

export function conToken(token) {
  return { Authorization: `Bearer ${token}` };
}
