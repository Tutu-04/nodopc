import * as Armador from '../models/armador.model.js';
import { PASOS, CONSUMO_DEL_RESTO, buscarIncompatibles, verificarArmado } from '../armador/reglas.js';
import { CAMPOS, estanCompletas } from '../armador/especificaciones.js';
import { esEnteroValido } from '../utils/validaciones.js';

async function opcionesPorPaso() {
  const productos = await Armador.obtenerOpciones();
  const porPaso = Object.fromEntries(PASOS.map(({ clave }) => [clave, []]));

  for (const { componente, ...producto } of productos) {
    if (Object.keys(CAMPOS[componente]).length === 0 || estanCompletas(componente, producto.especificaciones)) {
      porPaso[componente].push(producto);
    }
  }
  return porPaso;
}

export async function obtenerOpciones(req, res) {
  const opciones = await opcionesPorPaso();
  res.json({
    pasos: PASOS.map((paso) => ({ ...paso, productos: opciones[paso.clave] })),
    consumoDelResto: CONSUMO_DEL_RESTO,
  });
}

export function obtenerCampos(req, res) {
  res.json(CAMPOS);
}

export async function verificar(req, res) {
  const pedida = req.body?.seleccion ?? {};
  if (typeof pedida !== 'object' || Array.isArray(pedida)) {
    return res.status(400).json({ error: 'La selección tiene que ser un objeto' });
  }

  const opciones = await opcionesPorPaso();
  const seleccion = {};

  for (const [clave, id] of Object.entries(pedida)) {
    const paso = PASOS.find((p) => p.clave === clave);
    if (!paso) {
      return res.status(400).json({ error: `"${clave}" no es un paso del armador` });
    }
    if (id === null || id === undefined || id === '') continue;
    if (!esEnteroValido(id, 1)) {
      return res.status(400).json({ error: `El id elegido para ${paso.titulo} no es válido` });
    }

    const producto = opciones[clave].find((opcion) => opcion.id === Number(id));
    if (!producto) {
      return res.status(400).json({ error: `El producto ${id} no es una opción de ${paso.titulo}` });
    }
    seleccion[clave] = producto;
  }

  res.json({
    ...verificarArmado(seleccion),
    incompatibles: buscarIncompatibles(seleccion, opciones),
  });
}
