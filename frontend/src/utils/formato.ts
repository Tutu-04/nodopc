export function formatearPrecio(numero: number | string): string {
  return Number(numero).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
}

export function formatearFecha(fecha: string | Date): string {
  return new Date(fecha).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function formatearMes(mes: string): string {
  const [anio, numero] = mes.split('-');
  return new Date(Number(anio), Number(numero) - 1, 1).toLocaleDateString('es-AR', {
    month: 'short',
    year: 'numeric',
  });
}

export function formatearPorcentaje(parte: number, total: number): string {
  if (!total) return '0%';
  return `${Math.round((parte / total) * 100)}%`;
}

export function formatearPrecioCorto(numero: number | string): string {
  return Number(numero).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    notation: 'compact',
    maximumFractionDigits: 1,
  });
}
