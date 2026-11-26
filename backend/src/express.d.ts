import type { UsuarioDeSesion } from './tipos.js';

declare global {
  namespace Express {
    interface Request {
      usuario: UsuarioDeSesion;
    }
  }
}

export {};
