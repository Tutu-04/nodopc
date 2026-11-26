export const TARJETA_DE_PRUEBA = {
  numero: '4509 9535 6623 3704',
  titular: 'APRO',
  vencimiento: '11/30',
  cvv: '123',
};

export function formatearNumeroDeTarjeta(valor) {
  return valor
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function formatearVencimiento(valor) {
  const digitos = valor.replace(/\D/g, '').slice(0, 4);
  return digitos.length > 2 ? `${digitos.slice(0, 2)}/${digitos.slice(2)}` : digitos;
}

export function formatearCuentaRegresiva(segundos) {
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return `${String(minutos).padStart(2, '0')}:${String(resto).padStart(2, '0')}`;
}
