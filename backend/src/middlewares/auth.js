import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function verificarToken(req, res, next) {
  const cabecera = req.headers.authorization;

  if (!cabecera || !cabecera.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Tenés que iniciar sesión' });
  }

  const token = cabecera.split(' ')[1];

  try {
    req.usuario = jwt.verify(token, config.jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: 'La sesión no es válida o venció. Volvé a iniciar sesión' });
  }
}

export function soloAdmin(req, res, next) {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'No tenés permiso para hacer esto' });
  }
  next();
}
