import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config.js';

export const TAMANO_MAXIMO = 2 * 1024 * 1024;

const PREFIJO = '/uploads/productos/';

const FIRMA_PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export function detectarTipoDeImagen(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg';
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(FIRMA_PNG)) return 'png';
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    return 'webp';
  }
  return null;
}

function carpetaDeProductos() {
  return path.join(config.uploadsDir, 'productos');
}

export async function guardarImagen(productoId, buffer, extension) {
  await fs.mkdir(carpetaDeProductos(), { recursive: true });
  const nombre = `${productoId}-${crypto.randomBytes(6).toString('hex')}.${extension}`;
  await fs.writeFile(path.join(carpetaDeProductos(), nombre), buffer);
  return PREFIJO + nombre;
}

export async function borrarImagen(url) {
  if (!url?.startsWith(PREFIJO)) return;
  await fs.rm(path.join(carpetaDeProductos(), path.basename(url)), { force: true });
}
