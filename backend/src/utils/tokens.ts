import { createHash, randomBytes } from 'node:crypto';

export function crearTokenAlAzar(): string {
  return randomBytes(32).toString('base64url');
}

export function hashearToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
