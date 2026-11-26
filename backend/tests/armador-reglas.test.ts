import { describe, expect, it } from 'vitest';
import {
  buscarIncompatibles,
  calcularConsumo,
  calcularPotenciaRecomendada,
  verificarArmado,
} from '../src/armador/reglas.js';
import type { Pieza } from '../src/armador/reglas.js';
import type { Especificaciones } from '../src/tipos.js';

function producto(
  id: number,
  nombre: string,
  especificaciones: Especificaciones | null,
  { precio = 100, stock = 5 } = {}
): Pieza {
  return { id, nombre, precio, stock, especificaciones };
}

const ryzen = producto(1, 'Procesador AMD Ryzen 5 7600', { socket: 'AM5', consumo: 88, graficos_integrados: true });
const corei5 = producto(3, 'Procesador Intel Core i5-14400F', {
  socket: 'LGA1700',
  consumo: 148,
  graficos_integrados: false,
});
const corei7 = producto(26, 'Procesador Intel Core i7-14700K', {
  socket: 'LGA1700',
  consumo: 253,
  graficos_integrados: true,
});
const b650m = producto(7, 'Motherboard Gigabyte B650M DS3H', { socket: 'AM5', memoria: 'DDR5', formato: 'Micro ATX' });
const b760m = producto(8, 'Motherboard ASUS Prime B760M-A', {
  socket: 'LGA1700',
  memoria: 'DDR5',
  formato: 'Micro ATX',
});
const tomahawk = producto(28, 'Motherboard MSI MAG B650 Tomahawk WiFi', {
  socket: 'AM5',
  memoria: 'DDR5',
  formato: 'ATX',
});
const ddr5 = producto(10, 'Memoria RAM Kingston Fury Beast 16GB DDR5', { memoria: 'DDR5' });
const ddr4 = producto(27, 'Memoria RAM Kingston Fury Beast 16GB DDR4', { memoria: 'DDR4' });
const rtx4070 = producto(6, 'Placa de video MSI GeForce RTX 4070 Super', { consumo: 220 });
const ssd = producto(12, 'SSD Kingston NV2 1TB', null);
const fuente450 = producto(29, 'Fuente Gigabyte P450B 450W', { potencia: 450 });
const fuente650 = producto(30, 'Fuente Corsair CX650 650W', { potencia: 650 });
const fuente850 = producto(31, 'Fuente MSI MAG A850GL 850W', { potencia: 850 });
const atx = producto(32, 'Gabinete Corsair 4000D Airflow', { formatos: ['ATX', 'Micro ATX', 'Mini ITX'] });
const compacto = producto(33, 'Gabinete NodoPC Compact M1', { formatos: ['Micro ATX', 'Mini ITX'] });

const armadoValido = {
  procesador: ryzen,
  motherboard: b650m,
  memoria: ddr5,
  almacenamiento: ssd,
  fuente: fuente450,
  gabinete: compacto,
};

describe('Consumo y fuente', () => {
  it('suma procesador, placa de video y el resto del equipo', () => {
    expect(calcularConsumo({})).toBe(0);
    expect(calcularConsumo({ procesador: ryzen })).toBe(88 + 50);
    expect(calcularConsumo({ procesador: corei7, placa_de_video: rtx4070 })).toBe(253 + 220 + 50);
  });

  it('recomienda una fuente con margen, redondeada a 50 W', () => {
    expect(calcularPotenciaRecomendada(138)).toBe(250);
    expect(calcularPotenciaRecomendada(523)).toBe(800);
  });
});

describe('verificarArmado', () => {
  it('da por completo un armado compatible y suma el total', () => {
    const resultado = verificarArmado(armadoValido);

    expect(resultado).toMatchObject({ problemas: [], avisos: [], faltan: [], completo: true, total: 600 });
  });

  it('la placa de video es opcional, el resto no', () => {
    const { faltan, completo } = verificarArmado({ procesador: ryzen });
    expect(faltan).toEqual(['motherboard', 'memoria', 'almacenamiento', 'fuente', 'gabinete']);
    expect(completo).toBe(false);
  });

  it.each([
    ['el socket', { procesador: corei5, motherboard: b650m }, 'usa socket LGA1700 y la motherboard es AM5'],
    ['el tipo de memoria', { memoria: ddr4, motherboard: b650m }, 'La memoria es DDR4 y la motherboard usa DDR5'],
    ['el tamaño del gabinete', { motherboard: tomahawk, gabinete: compacto }, 'La motherboard es ATX'],
  ])('detecta que no coincide %s', (_caso, cambios, mensaje) => {
    const { problemas, completo } = verificarArmado({ ...armadoValido, ...cambios });

    expect(completo).toBe(false);
    expect(problemas.map((problema) => problema.mensaje).join(' ')).toContain(mensaje);
  });

  it('pide placa de video si el procesador no tiene gráficos integrados', () => {
    const sinVideo = verificarArmado({ ...armadoValido, procesador: corei5, motherboard: b760m });
    expect(sinVideo.problemas).toEqual([expect.objectContaining({ tipo: 'falta' })]);

    const conVideo = verificarArmado({
      ...armadoValido,
      procesador: corei5,
      motherboard: b760m,
      placa_de_video: rtx4070,
      fuente: fuente650,
    });
    expect(conVideo.completo).toBe(true);
  });

  it('rechaza una fuente que no alcanza y avisa si queda justa', () => {
    const pesado = { ...armadoValido, procesador: corei7, motherboard: b760m, placa_de_video: rtx4070 };

    expect(verificarArmado({ ...pesado, fuente: fuente450 }).problemas[0].mensaje).toContain('no alcanza');

    const justa = verificarArmado({ ...pesado, fuente: fuente650 });
    expect(justa.completo).toBe(true);
    expect(justa.avisos[0]).toContain('recomendamos 800 W');

    expect(verificarArmado({ ...pesado, fuente: fuente850 }).avisos).toEqual([]);
  });

  it('no deja comprar un componente sin stock', () => {
    const sinStock = { ...b650m, stock: 0 };
    const { problemas, completo } = verificarArmado({ ...armadoValido, motherboard: sinStock });

    expect(completo).toBe(false);
    expect(problemas).toEqual([expect.objectContaining({ tipo: 'sin_stock', pasos: ['motherboard'] })]);
  });
});

describe('buscarIncompatibles', () => {
  it('marca las opciones que chocan con lo ya elegido y dice por qué', () => {
    const opciones = {
      procesador: [ryzen, corei5, corei7],
      memoria: [ddr5, ddr4],
      gabinete: [atx, compacto],
      fuente: [fuente450, fuente650],
    };
    const incompatibles = buscarIncompatibles(
      { motherboard: tomahawk, placa_de_video: rtx4070, fuente: fuente450 },
      opciones
    );

    expect(Object.keys(incompatibles.procesador).map(Number)).toEqual([3, 26]);
    expect(incompatibles.memoria).toEqual({ 27: 'La memoria es DDR4 y la motherboard usa DDR5.' });
    expect(Object.keys(incompatibles.gabinete).map(Number)).toEqual([33]);
    expect(incompatibles.fuente).toEqual({});
  });

  it('no marca un procesador sin gráficos integrados: solo falta elegir la placa', () => {
    const incompatibles = buscarIncompatibles({ motherboard: b760m }, { procesador: [corei5] });
    expect(incompatibles.procesador).toEqual({});
  });
});
