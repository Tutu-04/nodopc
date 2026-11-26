import type { Componente, Especificaciones } from '../tipos.js';

export interface PasoDelArmador {
  clave: Componente;
  titulo: string;
  obligatorio: boolean;
}

export interface Pieza {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  especificaciones: Especificaciones | null;
}

export type Seleccion = Partial<Record<Componente, Pieza>>;

export interface Problema {
  tipo: 'incompatible' | 'falta' | 'sin_stock';
  pasos: Componente[];
  mensaje: string;
}

interface Regla {
  pasos: Componente[];
  revisar: (seleccion: Required<Seleccion>) => string | false;
}

export const PASOS: PasoDelArmador[] = [
  { clave: 'procesador', titulo: 'Procesador', obligatorio: true },
  { clave: 'motherboard', titulo: 'Motherboard', obligatorio: true },
  { clave: 'memoria', titulo: 'Memoria RAM', obligatorio: true },
  { clave: 'placa_de_video', titulo: 'Placa de video', obligatorio: false },
  { clave: 'almacenamiento', titulo: 'Almacenamiento', obligatorio: true },
  { clave: 'fuente', titulo: 'Fuente', obligatorio: true },
  { clave: 'gabinete', titulo: 'Gabinete', obligatorio: true },
];

export const CONSUMO_DEL_RESTO = 50;
const MARGEN_DE_LA_FUENTE = 1.5;

export function nombreCorto(producto: Pieza): string {
  return producto.nombre.replace(/^(Procesador|Motherboard|Memoria RAM|Placa de video|Fuente|Gabinete)\s+/i, '');
}

function esp(producto: Pieza | undefined): Especificaciones {
  return producto?.especificaciones ?? {};
}

export function calcularConsumo({ procesador, placa_de_video: placaDeVideo }: Seleccion): number {
  if (!procesador && !placaDeVideo) return 0;
  return (esp(procesador).consumo ?? 0) + (esp(placaDeVideo).consumo ?? 0) + CONSUMO_DEL_RESTO;
}

export function calcularPotenciaRecomendada(consumo: number): number {
  return Math.ceil((consumo * MARGEN_DE_LA_FUENTE) / 50) * 50;
}

const REGLAS: Regla[] = [
  {
    pasos: ['procesador', 'motherboard'],
    revisar: ({ procesador, motherboard }) =>
      esp(procesador).socket !== esp(motherboard).socket &&
      `El ${nombreCorto(procesador)} usa socket ${esp(procesador).socket} y la motherboard es ${esp(motherboard).socket}.`,
  },
  {
    pasos: ['memoria', 'motherboard'],
    revisar: ({ memoria, motherboard }) =>
      esp(memoria).memoria !== esp(motherboard).memoria &&
      `La memoria es ${esp(memoria).memoria} y la motherboard usa ${esp(motherboard).memoria}.`,
  },
  {
    pasos: ['motherboard', 'gabinete'],
    revisar: ({ motherboard, gabinete }) =>
      !(esp(gabinete).formatos ?? []).includes(esp(motherboard).formato ?? '') &&
      `La motherboard es ${esp(motherboard).formato} y el gabinete admite ${(esp(gabinete).formatos ?? []).join(', ')}.`,
  },
  {
    pasos: ['fuente'],
    revisar: (seleccion) => {
      const consumo = calcularConsumo(seleccion);
      return (
        (esp(seleccion.fuente).potencia ?? 0) < consumo &&
        `La fuente de ${esp(seleccion.fuente).potencia} W no alcanza: el equipo consume hasta ${consumo} W.`
      );
    },
  },
];

export function buscarProblemas(seleccion: Seleccion): Problema[] {
  const problemas: Problema[] = [];

  for (const regla of REGLAS) {
    if (!regla.pasos.every((clave) => seleccion[clave])) continue;
    const mensaje = regla.revisar(seleccion as Required<Seleccion>);
    if (mensaje) {
      const pasos: Componente[] =
        regla.pasos[0] === 'fuente' ? ['fuente', 'procesador', 'placa_de_video'] : regla.pasos;
      problemas.push({ tipo: 'incompatible', pasos: pasos.filter((clave) => seleccion[clave]), mensaje });
    }
  }

  const { procesador, placa_de_video: placaDeVideo } = seleccion;
  if (procesador && !placaDeVideo && esp(procesador).graficos_integrados === false) {
    problemas.push({
      tipo: 'falta',
      pasos: ['procesador', 'placa_de_video'],
      mensaje: `El ${nombreCorto(procesador)} no tiene gráficos integrados: hace falta una placa de video.`,
    });
  }

  return problemas;
}

export interface ResultadoDelArmado {
  problemas: Problema[];
  avisos: string[];
  faltan: Componente[];
  consumo: number;
  potenciaRecomendada: number;
  total: number;
  completo: boolean;
}

export function verificarArmado(seleccion: Seleccion): ResultadoDelArmado {
  const problemas = buscarProblemas(seleccion);
  const avisos: string[] = [];

  for (const { clave } of PASOS) {
    if (seleccion[clave]?.stock === 0) {
      problemas.push({
        tipo: 'sin_stock',
        pasos: [clave],
        mensaje: `${nombreCorto(seleccion[clave])} no tiene stock.`,
      });
    }
  }

  const consumo = calcularConsumo(seleccion);
  const potenciaRecomendada = calcularPotenciaRecomendada(consumo);
  const potencia = esp(seleccion.fuente).potencia ?? 0;
  if (potencia >= consumo && potencia < potenciaRecomendada) {
    avisos.push(
      `La fuente de ${potencia} W alcanza, pero queda justa. Para este equipo recomendamos ${potenciaRecomendada} W o más.`
    );
  }

  const faltan = PASOS.filter(({ clave, obligatorio }) => obligatorio && !seleccion[clave]).map(({ clave }) => clave);
  const total = PASOS.reduce((suma, { clave }) => suma + (seleccion[clave]?.precio ?? 0), 0);

  return {
    problemas,
    avisos,
    faltan,
    consumo,
    potenciaRecomendada,
    total,
    completo: faltan.length === 0 && problemas.length === 0,
  };
}

export function buscarIncompatibles(
  seleccion: Seleccion,
  opcionesPorPaso: Partial<Record<Componente, Pieza[]>>
): Record<Componente, Record<number, string>> {
  const incompatibles = {} as Record<Componente, Record<number, string>>;

  for (const { clave } of PASOS) {
    incompatibles[clave] = {};
    for (const opcion of opcionesPorPaso[clave] ?? []) {
      const problema = buscarProblemas({ ...seleccion, [clave]: opcion }).find(
        (encontrado) => encontrado.tipo === 'incompatible' && encontrado.pasos.includes(clave)
      );
      if (problema) {
        incompatibles[clave][opcion.id] = problema.mensaje;
      }
    }
  }

  return incompatibles;
}
