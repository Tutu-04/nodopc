import type { Componente, Especificaciones } from '../tipos';

type Fila = [string, string];

const FILAS: Partial<Record<Componente, (e: Especificaciones) => Fila[]>> = {
  procesador: (e) => [
    ['Socket', `${e.socket}`],
    ['Consumo máximo', `${e.consumo} W`],
    ['Gráficos integrados', e.graficos_integrados ? 'Sí' : 'No'],
  ],
  motherboard: (e) => [
    ['Socket', `${e.socket}`],
    ['Memoria', `${e.memoria}`],
    ['Formato', `${e.formato}`],
  ],
  memoria: (e) => [['Tipo de memoria', `${e.memoria}`]],
  placa_de_video: (e) => [['Consumo máximo', `${e.consumo} W`]],
  fuente: (e) => [['Potencia', `${e.potencia} W`]],
  gabinete: (e) => [['Motherboards que admite', (e.formatos ?? []).join(', ')]],
};

const ETIQUETAS_CORTAS: Partial<Record<Componente, (e: Especificaciones) => string[]>> = {
  procesador: (e) => [
    `${e.socket}`,
    `${e.consumo} W`,
    e.graficos_integrados ? 'Con video integrado' : 'Sin video integrado',
  ],
  motherboard: (e) => [`${e.socket}`, `${e.memoria}`, `${e.formato}`],
  memoria: (e) => [`${e.memoria}`],
  placa_de_video: (e) => [`${e.consumo} W`],
  fuente: (e) => [`${e.potencia} W`],
  gabinete: (e) => e.formatos ?? [],
};

export function filasDeFicha(
  componente: Componente | null | undefined,
  especificaciones: Especificaciones | null | undefined
): Fila[] {
  const armar = componente ? FILAS[componente] : undefined;
  return especificaciones && armar ? armar(especificaciones) : [];
}

export function etiquetasDeFicha(
  componente: Componente | null | undefined,
  especificaciones: Especificaciones | null | undefined
): string[] {
  const armar = componente ? ETIQUETAS_CORTAS[componente] : undefined;
  return especificaciones && armar ? armar(especificaciones) : [];
}
