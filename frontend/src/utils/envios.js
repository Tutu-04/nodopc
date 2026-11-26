export const LOCAL = {
  direccion: 'Av. Mate de Luna 1850, San Miguel de Tucumán',
  horario: 'Lunes a sábado de 9 a 20 h',
};

export function calcularEnvio({ metodo, provincia, subtotal, condiciones }) {
  if (metodo === 'retiro') return 0;
  if (!condiciones) return null;
  if (subtotal >= condiciones.envioGratisDesde) return 0;

  const opcion = condiciones.provincias.find((p) => p.nombre === provincia);
  return opcion ? opcion.costo : null;
}

export function faltaParaEnvioGratis(subtotal, condiciones) {
  if (!condiciones) return 0;
  return Math.max(condiciones.envioGratisDesde - subtotal, 0);
}
