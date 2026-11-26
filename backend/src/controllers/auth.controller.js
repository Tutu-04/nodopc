import bcrypt from 'bcrypt';
import * as Usuario from '../models/usuario.model.js';
import { esTextoValido, esEmailValido, validarPassword } from '../utils/validaciones.js';
import { borrarSesion, guardarSesion } from '../utils/sesion.js';
import { enviarCorreo } from '../services/correo.js';
import { bienvenida, passwordCambiada, recuperarPassword } from '../correos/mensajes.js';
import * as Recuperacion from '../models/recuperacion.model.js';
import { crearTokenAlAzar, hashearToken } from '../utils/tokens.js';
import { enlace } from '../correos/plantilla.js';

const HASH_DE_RELLENO = '$2b$10$2cpuXqFIhYURbXTkjXf7LucR5/8yel6thdZDhRNYPU39LNhM3G9Ui';
const MINUTOS_PARA_RESTABLECER = 60;
const RESPUESTA_RECUPERACION = 'Si el email tiene una cuenta, te mandamos un enlace para elegir una contraseña nueva.';

export async function registrar(req, res) {
  const { nombre, email, password } = req.body;

  if (!esTextoValido(nombre, 2, 100)) {
    return res.status(400).json({ error: 'El nombre es obligatorio (entre 2 y 100 caracteres)' });
  }
  if (!esEmailValido(email)) {
    return res.status(400).json({ error: 'El email no tiene un formato válido' });
  }
  const errorPassword = validarPassword(password);
  if (errorPassword) {
    return res.status(400).json({ error: errorPassword });
  }

  const existente = await Usuario.obtenerPorEmail(email);
  if (existente) {
    return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });
  }

  const hash = await bcrypt.hash(password, 10);

  const id = await Usuario.crear({ nombre: nombre.trim(), email, password: hash, rol: 'cliente' });
  const usuario = await Usuario.obtenerPorId(id);

  enviarCorreo({ para: usuario.email, ...bienvenida(usuario) });

  res.status(201).json(usuario);
}

export async function iniciarSesion(req, res) {
  const { email, password } = req.body;

  if (!esEmailValido(email) || !esTextoValido(password, 1, 72)) {
    return res.status(400).json({ error: 'Ingresá tu email y tu contraseña' });
  }

  const usuario = await Usuario.obtenerPorEmail(email);

  const passwordCorrecta = await bcrypt.compare(password, usuario?.password ?? HASH_DE_RELLENO);

  if (!usuario || !passwordCorrecta) {
    return res.status(401).json({ error: 'Email o contraseña incorrectos' });
  }

  guardarSesion(res, usuario);

  res.json({
    usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
  });
}

export async function obtenerSesion(req, res) {
  const usuario = await Usuario.obtenerPorId(req.usuario.id);
  if (!usuario) {
    borrarSesion(res);
    return res.status(401).json({ error: 'La cuenta ya no existe' });
  }
  res.json({ usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol } });
}

export function cerrarSesion(req, res) {
  borrarSesion(res);
  res.json({ mensaje: 'Sesión cerrada' });
}

async function prepararRecuperacion(email) {
  const usuario = await Usuario.obtenerPorEmail(email);
  if (!usuario) return;

  const token = crearTokenAlAzar();
  await Recuperacion.crear(usuario.id, hashearToken(token), MINUTOS_PARA_RESTABLECER);

  const url = enlace(`/restablecer-password?token=${token}`);
  await enviarCorreo({
    para: usuario.email,
    ...recuperarPassword(usuario, { url, minutos: MINUTOS_PARA_RESTABLECER }),
  });
}

export async function pedirRecuperacion(req, res) {
  const { email } = req.body;
  if (!esEmailValido(email)) {
    return res.status(400).json({ error: 'El email no tiene un formato válido' });
  }

  res.json({ mensaje: RESPUESTA_RECUPERACION });

  try {
    await prepararRecuperacion(email);
  } catch (error) {
    console.error('No se pudo preparar la recuperación de contraseña:', error.message);
  }
}

export async function restablecerPassword(req, res) {
  const { token, password } = req.body;

  if (!esTextoValido(token, 20, 200)) {
    return res.status(400).json({ error: 'El enlace no es válido. Pedí uno nuevo.' });
  }
  const errorPassword = validarPassword(password);
  if (errorPassword) {
    return res.status(400).json({ error: errorPassword });
  }

  const recuperacion = await Recuperacion.buscarVigente(hashearToken(token));
  if (!recuperacion) {
    return res.status(400).json({ error: 'El enlace venció o ya se usó. Pedí uno nuevo.' });
  }

  await Usuario.actualizarPassword(recuperacion.usuario_id, await bcrypt.hash(password, 10));
  await Recuperacion.anularDelUsuario(recuperacion.usuario_id);
  enviarCorreo({ para: recuperacion.email, ...passwordCambiada(recuperacion) });

  res.json({ mensaje: 'Listo, ya podés ingresar con tu contraseña nueva.' });
}
