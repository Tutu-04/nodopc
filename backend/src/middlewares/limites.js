import { rateLimit } from 'express-rate-limit';

const QUINCE_MINUTOS = 15 * 60 * 1000;

export function crearLimitador({ maximo, ventanaMs = QUINCE_MINUTOS, mensaje, soloFallidos = false }) {
  return rateLimit({
    windowMs: ventanaMs,
    limit: maximo,
    skipSuccessfulRequests: soloFallidos,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req, res) => res.status(429).json({ error: mensaje }),
  });
}

export const limitarLogin = crearLimitador({
  maximo: 10,
  soloFallidos: true,
  mensaje: 'Demasiados intentos fallidos. Esperá 15 minutos y volvé a probar.',
});

export const limitarRegistro = crearLimitador({
  maximo: 20,
  mensaje: 'Se crearon demasiadas cuentas desde esta conexión. Esperá 15 minutos y volvé a probar.',
});
