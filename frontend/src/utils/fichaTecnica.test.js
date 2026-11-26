import { describe, expect, it } from 'vitest';
import { etiquetasDeFicha, filasDeFicha } from './fichaTecnica';

describe('Ficha técnica', () => {
  it('arma las filas de un procesador', () => {
    expect(filasDeFicha('procesador', { socket: 'AM5', consumo: 88, graficos_integrados: true })).toEqual([
      ['Socket', 'AM5'],
      ['Consumo máximo', '88 W'],
      ['Gráficos integrados', 'Sí'],
    ]);
  });

  it('resume una motherboard y un gabinete en etiquetas cortas', () => {
    expect(etiquetasDeFicha('motherboard', { socket: 'AM5', memoria: 'DDR5', formato: 'ATX' })).toEqual([
      'AM5',
      'DDR5',
      'ATX',
    ]);
    expect(etiquetasDeFicha('gabinete', { formatos: ['Micro ATX', 'Mini ITX'] })).toEqual(['Micro ATX', 'Mini ITX']);
  });

  it('no muestra nada sin ficha o para productos que no son componentes', () => {
    expect(filasDeFicha('procesador', null)).toEqual([]);
    expect(filasDeFicha(null, { socket: 'AM5' })).toEqual([]);
    expect(etiquetasDeFicha('almacenamiento', {})).toEqual([]);
  });
});
