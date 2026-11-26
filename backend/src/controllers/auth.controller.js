import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as Usuario from '../models/usuario.model.js';
import { esTextoValido, esEmailValido } from '../utils/validaciones.js';

export async function registrar(req, res) {
  const { nombre, email, password } = req.body;

  if (!esTextoValido(nombre, 2, 100)) {
    return res.status(400).json({ error: 'El nombre es obligatorio (entre 2 y 100 caracteres)' });
  }
  if (!esEmailValido(email)) {
    return res.status(400).json({ error: 'El email no tiene un formato válido' });
  }
  if (!esTextoValido(password, 6, 72)) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  const existente = await Usuario.obtenerPorEmail(email);
  if (existente) {
    return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });
  }

  const hash = await bcrypt.hash(password, 10);

  const id = await Usuario.crear({ nombre: nombre.trim(), email, password: hash, rol: 'cliente' });
  const usuario = await Usuario.obtenerPorId(id);

  res.status(201).json(usuario);
}

export async function iniciarSesion(req, res) {
  const { email, password } = req.body;

  if (!esEmailValido(email) || !esTextoValido(password, 1, 72)) {
    return res.status(400).json({ error: 'Ingresá tu email y tu contraseña' });
  }

  const usuario = await Usuario.obtenerPorEmail(email);

  const passwordCorrecta = usuario && (await bcrypt.compare(password, usuario.password));

  if (!passwordCorrecta) {
    return res.status(401).json({ error: 'Email o contraseña incorrectos' });
  }

  const token = jwt.sign({ id: usuario.id, nombre: usuario.nombre, rol: usuario.rol }, process.env.JWT_SECRET, {
    expiresIn: '8h',
  });

  res.json({
    token,
    usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
  });
}
