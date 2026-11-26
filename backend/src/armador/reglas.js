export const PASOS = [
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

export function nombreCorto(producto) {
  return producto.nombre.replace(/^(Procesador|Motherboard|Memoria RAM|Placa de video|Fuente|Gabinete)\s+/i, '');
}

function esp(producto) {
  return producto?.especificaciones ?? {};
}

export function calcularConsumo({ procesador, placa_de_video: placaDeVideo }) {
  if (!procesador && !placaDeVideo) return 0;
  return (esp(procesador).consumo ?? 0) + (esp(placaDeVideo).consumo ?? 0) + CONSUMO_DEL_RESTO;
}

export function calcularPotenciaRecomendada(consumo) {
  return Math.ceil((consumo * MARGEN_DE_LA_FUENTE) / 50) * 50;
}

const REGLAS = [
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
      !(esp(gabinete).formatos ?? []).includes(esp(motherboard).formato) &&
      `La motherboard es ${esp(motherboard).formato} y el gabinete admite ${(esp(gabinete).formatos ?? []).join(', ')}.`,
  },
  {
    pasos: ['fuente'],
    revisar: (seleccion) => {
      const consumo = calcularConsumo(seleccion);
      return (
        esp(seleccion.fuente).potencia < consumo &&
        `La fuente de ${esp(seleccion.fuente).potencia} W no alcanza: el equipo consume hasta ${consumo} W.`
      );
    },
  },
];

export function buscarProblemas(seleccion) {
  const problemas = [];

  for (const regla of REGLAS) {
    if (!regla.pasos.every((clave) => seleccion[clave])) continue;
    const mensaje = regla.revisar(seleccion);
    if (mensaje) {
      const pasos = regla.pasos[0] === 'fuente' ? ['fuente', 'procesador', 'placa_de_video'] : regla.pasos;
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

export function verificarArmado(seleccion) {
  const problemas = buscarProblemas(seleccion);
  const avisos = [];

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
  const potencia = esp(seleccion.fuente).potencia;
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

export function buscarIncompatibles(seleccion, opcionesPorPaso) {
  const incompatibles = {};

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
