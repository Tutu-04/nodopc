import * as Pedido from '../models/pedido.model.js';
import { esTextoValido, esEnteroValido } from '../utils/validaciones.js';
import { esProvinciaValida, METODOS_DE_ENTREGA } from '../utils/envios.js';
import { config } from '../config.js';

const ESTADOS = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'];

export async function listar(req, res) {
  const pedidos = await Pedido.obtenerTodos();
  res.json(pedidos);
}

export async function listarMios(req, res) {
  const pedidos = await Pedido.obtenerPorUsuario(req.usuario.id);
  res.json(pedidos);
}

function estadosSiguientes(pedido) {
  if (pedido.estado === 'pendiente') return ['pagado'];
  if (pedido.estado === 'pagado') return pedido.metodo_entrega === 'retiro' ? ['entregado'] : ['enviado'];
  if (pedido.estado === 'enviado') return ['entregado'];
  return [];
}

function conAcciones(pedido) {
  return { ...pedido, estados_siguientes: estadosSiguientes(pedido) };
}

export async function obtener(req, res) {
  const pedido = await Pedido.obtenerPorId(req.params.id);
  if (!pedido) {
    return res.status(404).json({ error: 'El pedido no existe' });
  }
  if (req.usuario.rol !== 'admin' && pedido.usuario_id !== req.usuario.id) {
    return res.status(403).json({ error: 'No podés ver un pedido de otro usuario' });
  }
  res.json(conAcciones(pedido));
}

function leerEntrega({ metodo_entrega, provincia, direccion_envio }) {
  if (!METODOS_DE_ENTREGA.includes(metodo_entrega)) {
    return { error: 'Elegí si el pedido se envía o se retira en el local' };
  }
  if (metodo_entrega === 'retiro') {
    return { metodoEntrega: 'retiro', provincia: null, direccionEnvio: null };
  }
  if (!esProvinciaValida(provincia)) {
    return { error: 'Elegí una provincia de la lista' };
  }
  if (!esTextoValido(direccion_envio, 5, 200)) {
    return { error: 'La dirección de envío es obligatoria (entre 5 y 200 caracteres)' };
  }
  return { metodoEntrega: 'envio', provincia, direccionEnvio: direccion_envio.trim() };
}

export async function crear(req, res) {
  const { items } = req.body;

  const entrega = leerEntrega(req.body);
  if (entrega.error) {
    return res.status(400).json({ error: entrega.error });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'El pedido tiene que tener al menos un producto' });
  }
  for (const item of items) {
    if (!item || !esEnteroValido(item.producto_id, 1) || !esEnteroValido(item.cantidad, 1)) {
      return res.status(400).json({ error: 'Cada producto necesita un id y una cantidad de 1 o más' });
    }
  }

  const itemsLimpios = items.map((item) => ({
    producto_id: Number(item.producto_id),
    cantidad: Number(item.cantidad),
  }));

  const id = await Pedido.crear(req.usuario.id, {
    ...entrega,
    items: itemsLimpios,
    minutosParaPagar: config.minutosParaPagar,
  });

  res.status(201).json(await Pedido.obtenerPorId(id));
}

export async function actualizar(req, res) {
  const pedido = await Pedido.obtenerPorId(req.params.id);
  if (!pedido) {
    return res.status(404).json({ error: 'El pedido no existe' });
  }

  const { estado = pedido.estado, direccion_envio } = req.body;

  if (!ESTADOS.includes(estado)) {
    return res.status(400).json({ error: `El estado "${estado}" no existe` });
  }
  if (estado === 'cancelado' && pedido.estado !== 'cancelado') {
    return res.status(409).json({ error: 'Para cancelar un pedido usá la opción Cancelar, que devuelve el stock' });
  }
  if (estado !== pedido.estado && !estadosSiguientes(pedido).includes(estado)) {
    return res.status(409).json({ error: `Un pedido ${pedido.estado} no puede pasar a ${estado}` });
  }

  let direccionEnvio = pedido.direccion_envio;
  if (direccion_envio !== undefined && pedido.metodo_entrega === 'envio') {
    if (!esTextoValido(direccion_envio, 5, 200)) {
      return res.status(400).json({ error: 'La dirección de envío es obligatoria (entre 5 y 200 caracteres)' });
    }
    if (direccion_envio.trim() !== pedido.direccion_envio && !['pendiente', 'pagado'].includes(pedido.estado)) {
      return res.status(409).json({ error: 'La dirección ya no se puede cambiar porque el pedido salió' });
    }
    direccionEnvio = direccion_envio.trim();
  }

  await Pedido.actualizar(pedido.id, { estado, direccionEnvio });
  res.json(conAcciones(await Pedido.obtenerPorId(pedido.id)));
}

export async function cancelar(req, res) {
  const pedido = await Pedido.obtenerPorId(req.params.id);
  if (!pedido) {
    return res.status(404).json({ error: 'El pedido no existe' });
  }

  const esAdmin = req.usuario.rol === 'admin';
  if (!esAdmin && pedido.usuario_id !== req.usuario.id) {
    return res.status(403).json({ error: 'No podés cancelar un pedido de otro usuario' });
  }

  const cancelables = esAdmin ? ['pendiente', 'pagado'] : ['pendiente'];
  const cancelado = cancelables.includes(pedido.estado) && (await Pedido.cancelar(pedido.id, cancelables));
  if (!cancelado) {
    return res.status(409).json({
      error: esAdmin
        ? 'Solo se pueden cancelar pedidos que todavía no salieron'
        : 'Solo podés cancelar un pedido mientras está pendiente de pago',
    });
  }

  res.json(conAcciones(await Pedido.obtenerPorId(pedido.id)));
}

export async function eliminar(req, res) {
  const pedido = await Pedido.obtenerPorId(req.params.id);
  if (!pedido) {
    return res.status(404).json({ error: 'El pedido no existe' });
  }
  if (pedido.estado !== 'cancelado') {
    return res.status(409).json({ error: 'Solo se pueden eliminar pedidos cancelados' });
  }

  await Pedido.eliminar(pedido.id);
  res.json({ mensaje: 'Pedido eliminado' });
}
