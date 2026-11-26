import { describe, expect, it } from 'vitest';
import { urlDeImagen } from './api';

describe('urlDeImagen', () => {
  it('apunta las imágenes subidas al servidor de la API', () => {
    expect(urlDeImagen('/uploads/productos/1-abc.png')).toBe('http://localhost:3000/uploads/productos/1-abc.png');
  });

  it('deja igual las direcciones externas y las de la carpeta public', () => {
    expect(urlDeImagen('https://ejemplo.com/a.jpg')).toBe('https://ejemplo.com/a.jpg');
    expect(urlDeImagen('/productos/1.jpg')).toBe('/productos/1.jpg');
    expect(urlDeImagen(null)).toBeNull();
  });
});
