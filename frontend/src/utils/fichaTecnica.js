const FILAS = {
  procesador: (e) => [
    ['Socket', e.socket],
    ['Consumo máximo', `${e.consumo} W`],
    ['Gráficos integrados', e.graficos_integrados ? 'Sí' : 'No'],
  ],
  motherboard: (e) => [
    ['Socket', e.socket],
    ['Memoria', e.memoria],
    ['Formato', e.formato],
  ],
  memoria: (e) => [['Tipo de memoria', e.memoria]],
  placa_de_video: (e) => [['Consumo máximo', `${e.consumo} W`]],
  fuente: (e) => [['Potencia', `${e.potencia} W`]],
  gabinete: (e) => [['Motherboards que admite', e.formatos.join(', ')]],
};

const ETIQUETAS_CORTAS = {
  procesador: (e) => [
    e.socket,
    `${e.consumo} W`,
    e.graficos_integrados ? 'Con video integrado' : 'Sin video integrado',
  ],
  motherboard: (e) => [e.socket, e.memoria, e.formato],
  memoria: (e) => [e.memoria],
  placa_de_video: (e) => [`${e.consumo} W`],
  fuente: (e) => [`${e.potencia} W`],
  gabinete: (e) => e.formatos,
};

export function filasDeFicha(componente, especificaciones) {
  if (!especificaciones || !FILAS[componente]) return [];
  return FILAS[componente](especificaciones);
}

export function etiquetasDeFicha(componente, especificaciones) {
  if (!especificaciones || !ETIQUETAS_CORTAS[componente]) return [];
  return ETIQUETAS_CORTAS[componente](especificaciones);
}
