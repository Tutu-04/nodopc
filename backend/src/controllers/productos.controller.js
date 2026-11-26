import * as Producto from '../models/producto.model.js';
import { esTextoValido, esNumero, esEnteroValido } from '../utils/validaciones.js';
import { borrarImagen, detectarTipoDeImagen, guardarImagen } from '../utils/imagenes.js';

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

function leerEntero(valor, { porDefecto, minimo, maximo }) {
  if (valor === undefined || valor === '') return porDefecto;
  if (!esEnteroValido(valor, minimo) || Number(valor) > maximo) return null;
  return Number(valor);
}

function leerPrecio(valor) {
  if (valor === undefined || valor === '') return undefined;
  if (!esNumero(valor) || Number(valor) < 0) return null;
  return Number(valor);
}

function leerIds(valor) {
  if (valor === undefined || valor === '') return undefined;
  const ids = String(valor).split(',');
  if (ids.length > 100 || !ids.every((id) => esEnteroValido(id, 1))) return null;
  return ids.map(Number);
}

export async function listar(req, res) {
  const consulta = req.query;

  const pagina = leerEntero(consulta.pagina, { porDefecto: 1, minimo: 1, maximo: 10000 });
  const porPagina = leerEntero(consulta.porPagina, { porDefecto: 12, minimo: 1, maximo: 100 });
  const orden = consulta.orden || 'recientes';
  const precioMin = leerPrecio(consulta.precioMin);
  const precioMax = leerPrecio(consulta.precioMax);
  const ids = leerIds(consulta.ids);

  if (pagina === null || porPagina === null) {
    return res.status(400).json({ error: 'La página tiene que ser un entero desde 1, y porPagina entre 1 y 100' });
  }
  if (!Producto.ORDENES_VALIDOS.includes(orden)) {
    return res.status(400).json({ error: `El orden tiene que ser uno de: ${Producto.ORDENES_VALIDOS.join(', ')}` });
  }
  if (precioMin === null || precioMax === null) {
    return res.status(400).json({ error: 'Los precios mínimo y máximo tienen que ser números, 0 o más' });
  }
  if (ids === null) {
    return res.status(400).json({ error: 'ids tiene que ser una lista de hasta 100 números separados por comas' });
  }

  const { productos, total } = await Producto.buscar({
    categoria: consulta.categoria,
    marca: consulta.marca,
    buscar: typeof consulta.buscar === 'string' ? consulta.buscar.slice(0, 100) : '',
    conStock: consulta.conStock === '1' || consulta.conStock === 'true',
    ids,
    precioMin,
    precioMax,
    orden,
    pagina,
    porPagina,
  });

  res.json({ productos, total, pagina, porPagina, paginas: Math.ceil(total / porPagina) });
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

  const datos = prepararDatos(req.body);
  await Producto.actualizar(id, datos);
  if (existente.imagen_url !== datos.imagen_url) {
    await borrarImagen(existente.imagen_url);
  }

  res.json(await Producto.obtenerPorId(id));
}

export async function eliminar(req, res) {
  const producto = await Producto.obtenerPorId(req.params.id);
  if (!producto) {
    return res.status(404).json({ error: 'El producto no existe' });
  }

  await Producto.eliminar(producto.id);
  await borrarImagen(producto.imagen_url);
  res.json({ mensaje: 'Producto eliminado' });
}

export async function subirImagen(req, res) {
  const producto = await Producto.obtenerPorId(req.params.id);
  if (!producto) {
    return res.status(404).json({ error: 'El producto no existe' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'Elegí una imagen para subir' });
  }

  const extension = detectarTipoDeImagen(req.file.buffer);
  if (!extension) {
    return res.status(400).json({ error: 'La imagen tiene que ser JPG, PNG o WebP' });
  }

  const url = await guardarImagen(producto.id, req.file.buffer, extension);
  await Producto.actualizarImagen(producto.id, url);
  await borrarImagen(producto.imagen_url);

  res.json(await Producto.obtenerPorId(producto.id));
}

export async function quitarImagen(req, res) {
  const producto = await Producto.obtenerPorId(req.params.id);
  if (!producto) {
    return res.status(404).json({ error: 'El producto no existe' });
  }

  await Producto.actualizarImagen(producto.id, null);
  await borrarImagen(producto.imagen_url);

  res.json(await Producto.obtenerPorId(producto.id));
}
