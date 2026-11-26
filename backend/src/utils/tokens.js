import { createHash, randomBytes } from 'node:crypto';

export function crearTokenAlAzar() {
  return randomBytes(32).toString('base64url');
}

export function hashearToken(token) {
  return createHash('sha256').update(String(token)).digest('hex');
}
