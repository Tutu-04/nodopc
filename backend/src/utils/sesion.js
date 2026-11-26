import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export const NOMBRE_COOKIE = 'nodopc_sesion';

const OCHO_HORAS = 8 * 60 * 60 * 1000;

function opcionesCookie() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.cookieSegura,
    path: '/',
  };
}

export function crearToken(usuario) {
  return jwt.sign({ id: usuario.id, nombre: usuario.nombre, rol: usuario.rol }, config.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: '8h',
  });
}

export function leerToken(token) {
  return jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
}

export function guardarSesion(res, usuario) {
  res.cookie(NOMBRE_COOKIE, crearToken(usuario), { ...opcionesCookie(), maxAge: OCHO_HORAS });
}

export function borrarSesion(res) {
  res.clearCookie(NOMBRE_COOKIE, opcionesCookie());
}
