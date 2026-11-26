import { armarCorreo, enlace } from './plantilla.js';

function primerNombre(nombre) {
  return String(nombre).trim().split(/\s+/)[0];
}

export function bienvenida(usuario) {
  return {
    asunto: 'Te damos la bienvenida a NodoPC',
    ...armarCorreo({
      titulo: `¡Hola, ${primerNombre(usuario.nombre)}!`,
      parrafos: [
        'Tu cuenta en NodoPC ya está lista.',
        'Desde tu panel vas a poder seguir tus pedidos, pagarlos y cambiar tus datos cuando quieras.',
      ],
      boton: { texto: 'Ir al catálogo', url: enlace('/catalogo') },
      notaFinal: 'Si no creaste esta cuenta, podés ignorar este correo.',
    }),
  };
}
