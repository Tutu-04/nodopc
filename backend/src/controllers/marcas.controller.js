import * as Marca from '../models/marca.model.js';
import { esTextoValido } from '../utils/validaciones.js';

function validar({ nombre, pais }) {
  if (!esTextoValido(nombre, 2, 80)) {
    return 'El nombre es obligatorio (entre 2 y 80 caracteres)';
  }
  if (pais && !esTextoValido(pais, 0, 80)) {
    return 'El país no puede superar los 80 caracteres';
  }
  return null;
}

export async function listar(req, res) {
  const marcas = await Marca.obtenerTodas();
  res.json(marcas);
}

export async function obtener(req, res) {
  const marca = await Marca.obtenerPorId(req.params.id);
  if (!marca) {
    return res.status(404).json({ error: 'La marca no existe' });
  }
  res.json(marca);
}

export async function crear(req, res) {
  const error = validar(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const id = await Marca.crear({
    nombre: req.body.nombre.trim(),
    pais: req.body.pais || null,
  });

  res.status(201).json(await Marca.obtenerPorId(id));
}

export async function actualizar(req, res) {
  const { id } = req.params;

  const existente = await Marca.obtenerPorId(id);
  if (!existente) {
    return res.status(404).json({ error: 'La marca no existe' });
  }

  const error = validar(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  await Marca.actualizar(id, {
    nombre: req.body.nombre.trim(),
    pais: req.body.pais || null,
  });

  res.json(await Marca.obtenerPorId(id));
}

export async function eliminar(req, res) {
  const productos = await Marca.contarProductos(req.params.id);
  if (productos > 0) {
    return res.status(409).json({
      error: `No se puede eliminar: la marca tiene ${productos} producto(s). Cambiales la marca o eliminalos primero.`,
    });
  }

  const borradas = await Marca.eliminar(req.params.id);
  if (borradas === 0) {
    return res.status(404).json({ error: 'La marca no existe' });
  }
  res.json({ mensaje: 'Marca eliminada' });
}
