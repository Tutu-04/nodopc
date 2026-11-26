export const LOCAL = {
  direccion: 'Av. Mate de Luna 1850, San Miguel de Tucumán',
  horario: 'Lunes a sábado de 9 a 20 h',
};

import type { CondicionesDeEnvio, MetodoEntrega } from '../tipos';

interface DatosDeEnvio {
  metodo: MetodoEntrega;
  provincia: string;
  subtotal: number;
  condiciones: CondicionesDeEnvio | null;
}

export function calcularEnvio({ metodo, provincia, subtotal, condiciones }: DatosDeEnvio): number | null {
  if (metodo === 'retiro') return 0;
  if (!condiciones) return null;
  if (subtotal >= condiciones.envioGratisDesde) return 0;

  const opcion = condiciones.provincias.find((p) => p.nombre === provincia);
  return opcion ? opcion.costo : null;
}

export function faltaParaEnvioGratis(subtotal: number, condiciones: CondicionesDeEnvio | null): number {
  if (!condiciones) return 0;
  return Math.max(condiciones.envioGratisDesde - subtotal, 0);
}
