import type { NextFunction, Request, Response } from 'express';
import * as Usuario from '../models/usuario.model.js';
import { NOMBRE_COOKIE, leerToken } from '../utils/sesion.js';

export function verificarToken(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.[NOMBRE_COOKIE];

  if (!token) {
    res.status(401).json({ error: 'Tenés que iniciar sesión' });
    return;
  }

  try {
    req.usuario = leerToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'La sesión no es válida o venció. Volvé a iniciar sesión' });
  }
}

export async function soloAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (req.usuario.rol !== 'admin') {
    res.status(403).json({ error: 'No tenés permiso para hacer esto' });
    return;
  }

  const usuario = await Usuario.obtenerPorId(req.usuario.id);
  if (usuario?.rol !== 'admin') {
    res.status(403).json({ error: 'No tenés permiso para hacer esto' });
    return;
  }
  next();
}
