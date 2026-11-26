const RECHAZOS_DE_PRUEBA: Record<string, string> = {
  FUND: 'fondos insuficientes',
  SECU: 'el código de seguridad no es correcto',
  EXPI: 'la tarjeta está vencida',
  OTHE: 'la tarjeta fue rechazada por el banco',
};

export interface DatosDeTarjeta {
  numero?: unknown;
  titular?: unknown;
  vencimiento?: unknown;
  cvv?: unknown;
}

export function soloDigitos(valor: unknown): string {
  return typeof valor === 'string' ? valor.replace(/[\s-]/g, '') : '';
}

export function pasaLuhn(numero: string): boolean {
  if (!/^\d{13,19}$/.test(numero)) return false;

  let suma = 0;
  [...numero].reverse().forEach((caracter, posicion) => {
    let digito = Number(caracter);
    if (posicion % 2 === 1) {
      digito *= 2;
      if (digito > 9) digito -= 9;
    }
    suma += digito;
  });
  return suma % 10 === 0;
}

export function venceEnElFuturo(vencimiento: unknown, hoy = new Date()): boolean {
  const partes = /^(\d{2})\/(\d{2})$/.exec(typeof vencimiento === 'string' ? vencimiento : '');
  if (!partes) return false;

  const mes = Number(partes[1]);
  const anio = 2000 + Number(partes[2]);
  if (mes < 1 || mes > 12) return false;

  return anio > hoy.getFullYear() || (anio === hoy.getFullYear() && mes >= hoy.getMonth() + 1);
}

export function validarTarjeta({ numero, titular, vencimiento, cvv }: DatosDeTarjeta): string | null {
  if (!pasaLuhn(soloDigitos(numero))) return 'El número de tarjeta no es válido';
  if (typeof titular !== 'string' || titular.trim().length < 3 || titular.trim().length > 60) {
    return 'Escribí el nombre del titular como figura en la tarjeta';
  }
  if (!venceEnElFuturo(vencimiento)) return 'La fecha de vencimiento no es válida (MM/AA)';
  if (typeof cvv !== 'string' || !/^\d{3,4}$/.test(cvv)) return 'El código de seguridad tiene 3 o 4 números';
  return null;
}

export function motivoDeRechazo(titular: string): string | null {
  return RECHAZOS_DE_PRUEBA[titular.trim().toUpperCase()] ?? null;
}
