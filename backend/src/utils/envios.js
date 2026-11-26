export const ENVIO_GRATIS_DESDE = 1500000;

export const METODOS_DE_ENTREGA = ['envio', 'retiro'];

const ZONAS = [
  { costo: 4500, provincias: ['Ciudad Autónoma de Buenos Aires', 'Buenos Aires'] },
  { costo: 7500, provincias: ['Córdoba', 'Santa Fe', 'Entre Ríos', 'La Pampa'] },
  { costo: 8500, provincias: ['Mendoza', 'San Juan', 'San Luis'] },
  {
    costo: 9500,
    provincias: [
      'Tucumán',
      'Salta',
      'Jujuy',
      'Santiago del Estero',
      'Catamarca',
      'La Rioja',
      'Corrientes',
      'Misiones',
      'Chaco',
      'Formosa',
    ],
  },
  { costo: 11500, provincias: ['Neuquén', 'Río Negro', 'Chubut', 'Santa Cruz', 'Tierra del Fuego'] },
];

export const PROVINCIAS = ZONAS.flatMap((zona) =>
  zona.provincias.map((nombre) => ({ nombre, costo: zona.costo }))
).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

export function esProvinciaValida(nombre) {
  return PROVINCIAS.some((provincia) => provincia.nombre === nombre);
}

export function calcularCostoDeEnvio({ metodo, provincia, subtotal }) {
  if (metodo === 'retiro') return 0;
  if (subtotal >= ENVIO_GRATIS_DESDE) return 0;
  return PROVINCIAS.find((opcion) => opcion.nombre === provincia).costo;
}
