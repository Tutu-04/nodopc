import { beforeAll, describe, expect, it } from 'vitest';
import pool from '../src/db.js';
import { reiniciarBase } from '../src/migraciones.js';
import { api } from './ayudantes.js';

function verificar(seleccion) {
  return api().post('/api/armador/verificar').send({ seleccion });
}

const ARMADO_AM5 = {
  procesador: 1,
  motherboard: 7,
  memoria: 11,
  almacenamiento: 12,
  fuente: 30,
  gabinete: 33,
};

beforeAll(reiniciarBase);

describe('GET /api/armador', () => {
  it('devuelve los siete pasos con sus productos, del más barato al más caro', async () => {
    const respuesta = await api().get('/api/armador');
    const pasos = respuesta.body.pasos;

    expect(respuesta.status).toBe(200);
    expect(pasos.map((paso) => paso.clave)).toEqual([
      'procesador',
      'motherboard',
      'memoria',
      'placa_de_video',
      'almacenamiento',
      'fuente',
      'gabinete',
    ]);
    expect(pasos.map((paso) => paso.productos.length)).toEqual([5, 4, 3, 3, 3, 3, 2]);

    const procesadores = pasos[0].productos;
    expect(procesadores.map((p) => p.precio)).toEqual([...procesadores.map((p) => p.precio)].sort((a, b) => a - b));
    expect(procesadores[0]).toMatchObject({
      nombre: 'Procesador AMD Ryzen 5 5600',
      marca: 'AMD',
      especificaciones: { socket: 'AM4', consumo: 76, graficos_integrados: false },
    });
  });

  it('deja afuera los componentes que no tienen sus especificaciones completas', async () => {
    await pool.execute('UPDATE productos SET especificaciones = NULL WHERE id = 25');

    const respuesta = await api().get('/api/armador');
    expect(respuesta.body.pasos[0].productos.map((p) => p.id)).not.toContain(25);

    await reiniciarBase();
  });
});

describe('POST /api/armador/verificar', () => {
  it('aprueba un armado compatible', async () => {
    const respuesta = await verificar(ARMADO_AM5);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toMatchObject({
      problemas: [],
      faltan: [],
      completo: true,
      consumo: 88 + 50,
      total: 289999 + 219999 + 189999 + 99999 + 109999 + 79999,
    });
  });

  it('explica las incompatibilidades y marca las opciones que no encajan', async () => {
    const respuesta = await verificar({ ...ARMADO_AM5, memoria: 27, procesador: 3 });
    const mensajes = respuesta.body.problemas.map((problema) => problema.mensaje);

    expect(respuesta.body.completo).toBe(false);
    expect(mensajes).toContain('El Intel Core i5-14400F usa socket LGA1700 y la motherboard es AM5.');
    expect(mensajes).toContain('La memoria es DDR4 y la motherboard usa DDR5.');

    const ids = (opciones) =>
      Object.keys(opciones)
        .map(Number)
        .sort((a, b) => a - b);
    const { incompatibles } = respuesta.body;
    expect(ids(incompatibles.procesador)).toEqual([3, 25, 26]);
    expect(ids(incompatibles.memoria)).toEqual([27]);
    expect(ids(incompatibles.motherboard)).toEqual([7, 8, 9, 28]);
    expect(incompatibles.motherboard[8]).toBe('La memoria es DDR4 y la motherboard usa DDR5.');
  });

  it('avisa cuando la fuente queda justa para el consumo', async () => {
    const respuesta = await verificar({
      ...ARMADO_AM5,
      procesador: 2,
      motherboard: 28,
      gabinete: 32,
      placa_de_video: 6,
    });

    expect(respuesta.body).toMatchObject({ completo: true, consumo: 162 + 220 + 50, potenciaRecomendada: 650 });
    expect(respuesta.body.avisos).toEqual([]);

    const conFuenteChica = await verificar({ ...ARMADO_AM5, procesador: 2, placa_de_video: 6, fuente: 29 });
    expect(conFuenteChica.body.avisos[0]).toContain('recomendamos 650 W');
  });

  it('una selección vacía devuelve lo que falta', async () => {
    const respuesta = await verificar({});
    expect(respuesta.body).toMatchObject({ completo: false, total: 0, consumo: 0 });
    expect(respuesta.body.faltan).toHaveLength(6);
  });

  it.each([
    ['un paso que no existe', { cooler: 1 }],
    ['un id inválido', { procesador: 'abc' }],
    ['un producto de otro paso', { procesador: 7 }],
    ['un producto que no es componente', { procesador: 20 }],
  ])('rechaza %s', async (_caso, seleccion) => {
    expect((await verificar(seleccion)).status).toBe(400);
  });
});
