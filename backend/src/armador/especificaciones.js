const TEXTO = 'texto';
const NUMERO = 'numero';
const SI_O_NO = 'si_o_no';
const LISTA = 'lista';

export const FORMATOS = ['ATX', 'Micro ATX', 'Mini ITX'];
export const TIPOS_DE_MEMORIA = ['DDR4', 'DDR5'];

export const CAMPOS = {
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

export function validarEspecificaciones(componente, especificaciones) {
  const campos = CAMPOS[componente];
  if (!campos || Object.keys(campos).length === 0) {
    return { valor: null };
  }
  if (especificaciones === undefined || especificaciones === null) {
    return { valor: null };
  }
  if (typeof especificaciones !== 'object' || Array.isArray(especificaciones)) {
    return { error: 'Las especificaciones tienen que ser un objeto' };
  }

  const valor = {};
  for (const [campo, regla] of Object.entries(campos)) {
    const dato = typeof especificaciones[campo] === 'string' ? especificaciones[campo].trim() : especificaciones[campo];
    if (!valorValido(dato, regla)) {
      return { error: `Revisá el dato "${regla.etiqueta}" de la ficha técnica` };
    }
    valor[campo] = dato;
  }
  return { valor };
}
