import bcrypt from 'bcrypt';
import * as Usuario from '../models/usuario.model.js';
import { esEmailValido, esTextoValido, validarPassword } from '../utils/validaciones.js';
import { guardarSesion } from '../utils/sesion.js';

function datosPublicos(usuario) {
  return { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol };
}

export async function actualizarDatos(req, res) {
  const { nombre, email } = req.body;

  if (!esTextoValido(nombre, 2, 100)) {
    return res.status(400).json({ error: 'El nombre es obligatorio (entre 2 y 100 caracteres)' });
  }
  if (!esEmailValido(email)) {
    return res.status(400).json({ error: 'El email no tiene un formato válido' });
  }

  const otro = await Usuario.obtenerPorEmail(email);
  if (otro && otro.id !== req.usuario.id) {
    return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });
  }

  await Usuario.actualizarDatosPersonales(req.usuario.id, { nombre: nombre.trim(), email });
  const usuario = await Usuario.obtenerPorId(req.usuario.id);

  guardarSesion(res, usuario);
  res.json({ usuario: datosPublicos(usuario) });
}

export async function cambiarPassword(req, res) {
  const { actual, nueva } = req.body;

  if (!esTextoValido(actual, 1, 72)) {
    return res.status(400).json({ error: 'Ingresá tu contraseña actual' });
  }
  const errorPassword = validarPassword(nueva);
  if (errorPassword) {
    return res.status(400).json({ error: errorPassword });
  }

  const hashActual = await Usuario.obtenerHashPassword(req.usuario.id);
  if (!hashActual || !(await bcrypt.compare(actual, hashActual))) {
    return res.status(400).json({ error: 'La contraseña actual no es correcta' });
  }

  await Usuario.actualizarPassword(req.usuario.id, await bcrypt.hash(nueva, 10));
  res.json({ mensaje: 'Contraseña actualizada' });
}
