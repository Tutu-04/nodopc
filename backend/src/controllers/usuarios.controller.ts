import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import * as Usuario from '../models/usuario.model.js';
import { esTextoValido, esEmailValido, validarPassword } from '../utils/validaciones.js';

function validar({ nombre, email, rol }: Record<string, unknown>) {
  if (!esTextoValido(nombre, 2, 100)) {
    return 'El nombre es obligatorio (entre 2 y 100 caracteres)';
  }
  if (!esEmailValido(email)) {
    return 'El email no tiene un formato válido';
  }
  if (rol !== 'admin' && rol !== 'cliente') {
    return 'El rol tiene que ser "admin" o "cliente"';
  }
  return null;
}

export async function listar(req: Request, res: Response) {
  const usuarios = await Usuario.obtenerTodos();
  res.json(usuarios);
}

export async function obtener(req: Request, res: Response) {
  const usuario = await Usuario.obtenerPorId(Number(req.params.id));
  if (!usuario) {
    return res.status(404).json({ error: 'El usuario no existe' });
  }
  res.json(usuario);
}

export async function crear(req: Request, res: Response) {
  const { nombre, email, password, rol } = req.body;

  const error = validar(req.body);
  if (error) {
    return res.status(400).json({ error });
  }
  const errorPassword = validarPassword(password);
  if (errorPassword) {
    return res.status(400).json({ error: errorPassword });
  }

  const hash = await bcrypt.hash(password, 10);
  const id = await Usuario.crear({ nombre: nombre.trim(), email, password: hash, rol });

  res.status(201).json(await Usuario.obtenerPorId(id));
}

export async function actualizar(req: Request, res: Response) {
  const id = Number(Number(req.params.id));
  const { nombre, email, password, rol } = req.body;

  const existente = await Usuario.obtenerPorId(id);
  if (!existente) {
    return res.status(404).json({ error: 'El usuario no existe' });
  }

  const error = validar(req.body);
  if (error) {
    return res.status(400).json({ error });
  }
  const errorPassword = password ? validarPassword(password) : null;
  if (errorPassword) {
    return res.status(400).json({ error: errorPassword });
  }
  if (id === req.usuario.id && rol !== 'admin') {
    return res.status(400).json({ error: 'No podés quitarte a vos mismo el rol de administrador' });
  }

  await Usuario.actualizar(id, { nombre: nombre.trim(), email, rol });

  if (password) {
    const hash = await bcrypt.hash(password, 10);
    await Usuario.actualizarPassword(id, hash);
  }

  res.json(await Usuario.obtenerPorId(id));
}

export async function eliminar(req: Request, res: Response) {
  const id = Number(Number(req.params.id));

  if (id === req.usuario.id) {
    return res.status(400).json({ error: 'No podés eliminar tu propio usuario' });
  }

  const pedidos = await Usuario.contarPedidos(id);
  if (pedidos > 0) {
    return res.status(409).json({
      error: `No se puede eliminar: el usuario tiene ${pedidos} pedido(s) registrados.`,
    });
  }

  const borrados = await Usuario.eliminar(id);
  if (borrados === 0) {
    return res.status(404).json({ error: 'El usuario no existe' });
  }
  res.json({ mensaje: 'Usuario eliminado' });
}
