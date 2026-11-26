export function esTextoValido(valor, min, max) {
  if (typeof valor !== 'string') return false;
  const largo = valor.trim().length;
  return largo >= min && largo <= max;
}

export function esEmailValido(valor) {
  return typeof valor === 'string' && /^\S+@\S+\.\S+$/.test(valor) && valor.length <= 150;
}

export function esNumero(valor) {
  if (typeof valor === 'number') return Number.isFinite(valor);
  if (typeof valor === 'string') return valor.trim() !== '' && Number.isFinite(Number(valor));
  return false;
}

export function esEnteroValido(valor, minimo) {
  return esNumero(valor) && Number.isInteger(Number(valor)) && Number(valor) >= minimo;
}
