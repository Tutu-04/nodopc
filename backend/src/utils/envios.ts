import type { MetodoEntrega } from '../tipos.js';

export interface Provincia {
  nombre: string;
  costo: number;
}

export const ENVIO_GRATIS_DESDE = 1500000;

export const METODOS_DE_ENTREGA: readonly MetodoEntrega[] = ['envio', 'retiro'];

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

export const PROVINCIAS: Provincia[] = ZONAS.flatMap((zona) =>
  zona.provincias.map((nombre) => ({ nombre, costo: zona.costo }))
).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

export function esProvinciaValida(nombre: unknown): nombre is string {
  return PROVINCIAS.some((provincia) => provincia.nombre === nombre);
}

interface DatosDeEnvio {
  metodo: MetodoEntrega;
  provincia: string | null;
  subtotal: number;
}

export function calcularCostoDeEnvio({ metodo, provincia, subtotal }: DatosDeEnvio): number {
  if (metodo === 'retiro') return 0;
  if (subtotal >= ENVIO_GRATIS_DESDE) return 0;
  const opcion = PROVINCIAS.find((encontrada) => encontrada.nombre === provincia);
  if (!opcion) throw new Error(`La provincia ${provincia} no tiene costo de envío`);
  return opcion.costo;
}
