import type { Componente, Especificaciones } from '../tipos.js';

const TEXTO = 'texto';
const NUMERO = 'numero';
const SI_O_NO = 'si_o_no';
const LISTA = 'lista';

export interface CampoDeFicha {
  tipo: typeof TEXTO | typeof NUMERO | typeof SI_O_NO | typeof LISTA;
  etiqueta: string;
  opciones?: readonly string[];
}

type CamposDeFicha = Partial<Record<keyof Especificaciones, CampoDeFicha>>;

export const FORMATOS = ['ATX', 'Micro ATX', 'Mini ITX'];
export const TIPOS_DE_MEMORIA = ['DDR4', 'DDR5'];

export const CAMPOS: Record<Componente, CamposDeFicha> = {
  procesador: {
    socket: { tipo: TEXTO, etiqueta: 'Socket' },
    consumo: { tipo: NUMERO, etiqueta: 'Consumo máximo (W)' },
    graficos_integrados: { tipo: SI_O_NO, etiqueta: 'Gráficos integrados' },
  },
  motherboard: {
    socket: { tipo: TEXTO, etiqueta: 'Socket' },
    memoria: { tipo: TEXTO, etiqueta: 'Tipo de memoria', opciones: TIPOS_DE_MEMORIA },
    formato: { tipo: TEXTO, etiqueta: 'Formato', opciones: FORMATOS },
  },
  memoria: {
    memoria: { tipo: TEXTO, etiqueta: 'Tipo de memoria', opciones: TIPOS_DE_MEMORIA },
  },
  placa_de_video: {
    consumo: { tipo: NUMERO, etiqueta: 'Consumo máximo (W)' },
  },
  almacenamiento: {},
  fuente: {
    potencia: { tipo: NUMERO, etiqueta: 'Potencia (W)' },
  },
  gabinete: {
    formatos: { tipo: LISTA, etiqueta: 'Formatos de motherboard que admite', opciones: FORMATOS },
  },
};

function valorValido(valor: unknown, { tipo, opciones }: CampoDeFicha): boolean {
  if (tipo === NUMERO) return typeof valor === 'number' && Number.isInteger(valor) && valor > 0 && valor <= 5000;
  if (tipo === SI_O_NO) return typeof valor === 'boolean';
  if (tipo === LISTA) {
    return Array.isArray(valor) && valor.length > 0 && valor.every((elemento) => opciones?.includes(elemento));
  }
  if (typeof valor !== 'string' || valor.trim().length === 0 || valor.length > 30) return false;
  return !opciones || opciones.includes(valor);
}

function camposDe(campos: CamposDeFicha): [keyof Especificaciones, CampoDeFicha][] {
  return Object.entries(campos) as [keyof Especificaciones, CampoDeFicha][];
}

export function estanCompletas(componente: Componente, especificaciones: Especificaciones | null): boolean {
  return camposDe(CAMPOS[componente]).every(([campo, regla]) => valorValido(especificaciones?.[campo], regla));
}

type ResultadoDeFicha = { valor: Especificaciones | null; error?: undefined } | { valor?: undefined; error: string };

export function validarEspecificaciones(
  componente: Componente | null | undefined,
  especificaciones: unknown
): ResultadoDeFicha {
  const campos = componente ? CAMPOS[componente] : undefined;
  if (!campos || Object.keys(campos).length === 0) {
    return { valor: null };
  }
  if (especificaciones === undefined || especificaciones === null) {
    return { valor: null };
  }
  if (typeof especificaciones !== 'object' || Array.isArray(especificaciones)) {
    return { error: 'Las especificaciones tienen que ser un objeto' };
  }

  const recibidas = especificaciones as Record<string, unknown>;
  const valor: Record<string, unknown> = {};
  for (const [campo, regla] of camposDe(campos)) {
    const original = recibidas[campo];
    const dato = typeof original === 'string' ? original.trim() : original;
    if (!valorValido(dato, regla)) {
      return { error: `Revisá el dato "${regla.etiqueta}" de la ficha técnica` };
    }
    valor[campo] = dato;
  }
  return { valor: valor as Especificaciones };
}
