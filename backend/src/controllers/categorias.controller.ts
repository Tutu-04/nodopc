import type { Request, Response } from 'express';
import * as Categoria from '../models/categoria.model.js';
import { esTextoValido } from '../utils/validaciones.js';

function validar({ nombre, descripcion }: Record<string, unknown>) {
  if (!esTextoValido(nombre, 2, 80)) {
    return 'El nombre es obligatorio (entre 2 y 80 caracteres)';
  }
  if (descripcion && !esTextoValido(descripcion, 0, 255)) {
    return 'La descripción no puede superar los 255 caracteres';
  }
  return null;
}

export async function listar(req: Request, res: Response) {
  const categorias = await Categoria.obtenerTodas();
  res.json(categorias);
}

export async function obtener(req: Request, res: Response) {
  const categoria = await Categoria.obtenerPorId(Number(req.params.id));
  if (!categoria) {
    return res.status(404).json({ error: 'La categoría no existe' });
  }
  res.json(categoria);
}

export async function crear(req: Request, res: Response) {
  const error = validar(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const id = await Categoria.crear({
    nombre: req.body.nombre.trim(),
    descripcion: req.body.descripcion || null,
  });

  res.status(201).json(await Categoria.obtenerPorId(id));
}

export async function actualizar(req: Request, res: Response) {
  const id = Number(req.params.id);

  const existente = await Categoria.obtenerPorId(id);
  if (!existente) {
    return res.status(404).json({ error: 'La categoría no existe' });
  }

  const error = validar(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  await Categoria.actualizar(id, {
    nombre: req.body.nombre.trim(),
    descripcion: req.body.descripcion || null,
  });

  res.json(await Categoria.obtenerPorId(id));
}

export async function eliminar(req: Request, res: Response) {
  const productos = await Categoria.contarProductos(Number(req.params.id));
  if (productos > 0) {
    return res.status(409).json({
      error: `No se puede eliminar: la categoría tiene ${productos} producto(s). Movelos a otra categoría o eliminalos primero.`,
    });
  }

  const borradas = await Categoria.eliminar(Number(req.params.id));
  if (borradas === 0) {
    return res.status(404).json({ error: 'La categoría no existe' });
  }
  res.json({ mensaje: 'Categoría eliminada' });
}
