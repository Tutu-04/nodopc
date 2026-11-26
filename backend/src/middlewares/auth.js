import { NOMBRE_COOKIE, leerToken } from '../utils/sesion.js';

export function verificarToken(req, res, next) {
  const token = req.cookies?.[NOMBRE_COOKIE];

  if (!token) {
    return res.status(401).json({ error: 'Tenés que iniciar sesión' });
  }

  try {
    req.usuario = leerToken(token);
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
