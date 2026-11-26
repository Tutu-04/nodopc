import fs from 'node:fs';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { reiniciarBase } from '../src/migraciones.js';
import { config } from '../src/config.js';
import { detectarTipoDeImagen } from '../src/utils/imagenes.js';
import { api, conSesion, ingresarComoAdmin, ingresarComoCliente } from './ayudantes.js';

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);
const JPG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const WEBP = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBPVP8 ')]);

let admin: string;

function archivoDe(url: string) {
  return path.join(config.uploadsDir, url.replace('/uploads/', ''));
}

function subir(idProducto: number, contenido: Buffer, nombre = 'foto.png') {
  return api().post(`/api/productos/${idProducto}/imagen`).set(conSesion(admin)).attach('imagen', contenido, nombre);
}

beforeAll(async () => {
  await reiniciarBase();
  admin = await ingresarComoAdmin();
});

describe('detectarTipoDeImagen', () => {
  it('reconoce JPG, PNG y WebP por su contenido', () => {
    expect(detectarTipoDeImagen(JPG)).toBe('jpg');
    expect(detectarTipoDeImagen(PNG)).toBe('png');
    expect(detectarTipoDeImagen(WEBP)).toBe('webp');
  });

  it('rechaza cualquier otra cosa aunque el nombre diga .png', () => {
    expect(detectarTipoDeImagen(Buffer.from('<script>alert(1)</script>'))).toBeNull();
  });
});

describe('POST /api/productos/:id/imagen', () => {
  it('solo la puede usar un administrador', async () => {
    const cliente = await ingresarComoCliente();
    const respuesta = await api()
      .post('/api/productos/1/imagen')
      .set(conSesion(cliente))
      .attach('imagen', PNG, 'foto.png');
    expect(respuesta.status).toBe(403);
  });

  it('guarda la imagen, la asocia al producto y la sirve desde /uploads', async () => {
    const respuesta = await subir(1, PNG);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.imagen_url).toMatch(/^\/uploads\/productos\/1-[a-f0-9]{12}\.png$/);
    expect(fs.existsSync(archivoDe(respuesta.body.imagen_url))).toBe(true);

    const imagen = await api().get(respuesta.body.imagen_url);
    expect(imagen.status).toBe(200);
    expect(imagen.headers['content-type']).toBe('image/png');
    expect(imagen.headers['cross-origin-resource-policy']).toBe('cross-origin');
  });

  it('borra el archivo anterior al reemplazar la imagen', async () => {
    const primera = await subir(2, PNG);
    const segunda = await subir(2, JPG, 'foto.jpg');

    expect(segunda.body.imagen_url).toMatch(/\.jpg$/);
    expect(fs.existsSync(archivoDe(primera.body.imagen_url))).toBe(false);
    expect(fs.existsSync(archivoDe(segunda.body.imagen_url))).toBe(true);
  });

  it('rechaza un archivo que no es una imagen', async () => {
    const respuesta = await subir(3, Buffer.from('<script>alert(1)</script>'), 'trucho.png');
    expect(respuesta.status).toBe(400);
    expect(respuesta.body.error).toMatch(/JPG, PNG o WebP/);
  });

  it('rechaza imágenes de más de 2 MB', async () => {
    const grande = Buffer.concat([PNG, Buffer.alloc(2 * 1024 * 1024)]);
    const respuesta = await subir(3, grande);
    expect(respuesta.status).toBe(413);
  });

  it('pide un archivo y un producto que exista', async () => {
    const sinArchivo = await api().post('/api/productos/3/imagen').set(conSesion(admin));
    const sinProducto = await subir(9999, PNG);
    expect(sinArchivo.status).toBe(400);
    expect(sinProducto.status).toBe(404);
  });
});

describe('Limpieza de archivos', () => {
  it('DELETE /api/productos/:id/imagen quita la imagen y borra el archivo', async () => {
    const subida = await subir(4, PNG);
    const respuesta = await api().delete('/api/productos/4/imagen').set(conSesion(admin));

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.imagen_url).toBeNull();
    expect(fs.existsSync(archivoDe(subida.body.imagen_url))).toBe(false);
  });

  it('al eliminar un producto se borra su imagen', async () => {
    const subida = await subir(5, PNG);
    await api().delete('/api/productos/5').set(conSesion(admin));
    expect(fs.existsSync(archivoDe(subida.body.imagen_url))).toBe(false);
  });

  it('al cambiar la imagen por una dirección se borra el archivo subido', async () => {
    const subida = await subir(6, PNG);
    const producto = subida.body;

    await api()
      .put('/api/productos/6')
      .set(conSesion(admin))
      .send({ ...producto, imagen_url: 'https://ejemplo.com/foto.jpg' });

    expect(fs.existsSync(archivoDe(subida.body.imagen_url))).toBe(false);
  });
});
