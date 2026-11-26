const TEXTO = 'texto';
const NUMERO = 'numero';
const SI_O_NO = 'si_o_no';
const LISTA = 'lista';

export const FORMATOS = ['ATX', 'Micro ATX', 'Mini ITX'];
export const TIPOS_DE_MEMORIA = ['DDR4', 'DDR5'];

export const CAMPOS = {
  procesador: {
    socket: { tipo: TEXTO },
    consumo: { tipo: NUMERO },
    graficos_integrados: { tipo: SI_O_NO },
  },
  motherboard: {
    socket: { tipo: TEXTO },
    memoria: { tipo: TEXTO, opciones: TIPOS_DE_MEMORIA },
    formato: { tipo: TEXTO, opciones: FORMATOS },
  },
  memoria: {
    memoria: { tipo: TEXTO, opciones: TIPOS_DE_MEMORIA },
  },
  placa_de_video: {
    consumo: { tipo: NUMERO },
  },
  almacenamiento: {},
  fuente: {
    potencia: { tipo: NUMERO },
  },
  gabinete: {
    formatos: { tipo: LISTA, opciones: FORMATOS },
  },
};

function valorValido(valor, { tipo, opciones }) {
  if (tipo === NUMERO) return Number.isInteger(valor) && valor > 0 && valor <= 5000;
  if (tipo === SI_O_NO) return typeof valor === 'boolean';
  if (tipo === LISTA) {
    return Array.isArray(valor) && valor.length > 0 && valor.every((elemento) => opciones.includes(elemento));
  }
  if (typeof valor !== 'string' || valor.trim().length === 0 || valor.length > 30) return false;
  return !opciones || opciones.includes(valor);
}

export function estanCompletas(componente, especificaciones) {
  const campos = CAMPOS[componente];
  if (!campos) return false;
  return Object.entries(campos).every(([campo, regla]) => valorValido(especificaciones?.[campo], regla));
}
