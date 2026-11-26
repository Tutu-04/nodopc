import type { CookieOptions, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import type { UsuarioDeSesion } from '../tipos.js';

export const NOMBRE_COOKIE = 'nodopc_sesion';

const OCHO_HORAS = 8 * 60 * 60 * 1000;

function opcionesCookie(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.cookieSegura,
    path: '/',
  };
}

export function crearToken(usuario: UsuarioDeSesion): string {
  return jwt.sign({ id: usuario.id, nombre: usuario.nombre, rol: usuario.rol }, config.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: '8h',
  });
}

export function leerToken(token: string): UsuarioDeSesion {
  return jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] }) as UsuarioDeSesion;
}

export function guardarSesion(res: Response, usuario: UsuarioDeSesion): void {
  res.cookie(NOMBRE_COOKIE, crearToken(usuario), { ...opcionesCookie(), maxAge: OCHO_HORAS });
}

export function borrarSesion(res: Response): void {
  res.clearCookie(NOMBRE_COOKIE, opcionesCookie());
}
