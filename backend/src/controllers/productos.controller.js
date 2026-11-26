import * as Producto from '../models/producto.model.js';
import { esTextoValido, esNumero, esEnteroValido } from '../utils/validaciones.js';

function validar({ nombre, descripcion, precio, stock, imagen_url, categoria_id, marca_id }) {
  if (!esTextoValido(nombre, 2, 150)) {
    return 'El nombre es obligatorio (entre 2 y 150 caracteres)';
  }
  if (descripcion && typeof descripcion !== 'string') {
    return 'La descripción tiene que ser un texto';
  }
  if (!esNumero(precio) || Number(precio) <= 0) {
    return 'El precio tiene que ser un número mayor a 0';
  }
  if (!esEnteroValido(stock, 0)) {
    return 'El stock tiene que ser un número entero, 0 o más';
  }
  if (imagen_url && !esTextoValido(imagen_url, 0, 500)) {
    return 'La dirección de la imagen no puede superar los 500 caracteres';
  }
  if (!esEnteroValido(categoria_id, 1)) {
    return 'Tenés que elegir una categoría';
  }
  if (!esEnteroValido(marca_id, 1)) {
    return 'Tenés que elegir una marca';
  }
  return null;
}

function prepararDatos(body) {
  return {
    nombre: body.nombre.trim(),
    descripcion: body.descripcion || null,
    precio: Number(body.precio),
    stock: Number(body.stock),
    imagen_url: body.imagen_url || null,
    categoria_id: Number(body.categoria_id),
    marca_id: Number(body.marca_id),
  };
}

export async function listar(req, res) {
  const { categoria, marca } = req.query;
  const buscar = typeof req.query.buscar === 'string' ? req.query.buscar.slice(0, 100) : '';
  const productos = await Producto.obtenerTodos({ categoria, marca, buscar });
  res.json(productos);
}

export async function masVendidos(req, res) {
  const productos = await Producto.obtenerMasVendidos();
  res.json(productos);
}

export async function obtener(req, res) {
  const producto = await Producto.obtenerPorId(req.params.id);
  if (!producto) {
    return res.status(404).json({ error: 'El producto no existe' });
  }
  res.json(producto);
}

export async function crear(req, res) {
  const error = validar(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const id = await Producto.crear(prepararDatos(req.body));
  res.status(201).json(await Producto.obtenerPorId(id));
}

export async function actualizar(req, res) {
  const { id } = req.params;

  const existente = await Producto.obtenerPorId(id);
  if (!existente) {
    return res.status(404).json({ error: 'El producto no existe' });
  }

  const error = validar(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  await Producto.actualizar(id, prepararDatos(req.body));
  res.json(await Producto.obtenerPorId(id));
}

export async function eliminar(req, res) {
  const borrados = await Producto.eliminar(req.params.id);
  if (borrados === 0) {
    return res.status(404).json({ error: 'El producto no existe' });
  }
  res.json({ mensaje: 'Producto eliminado' });
}
