import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api, { obtenerMensajeError } from '../api/api';
import { useCarritoStore } from '../store/carritoStore';
import { formatearPrecio } from '../utils/formato';
import { etiquetasDeFicha } from '../utils/fichaTecnica';
import ImagenProducto from '../components/ImagenProducto';
import Icono from '../components/Icono';
import Cargando from '../components/Cargando';
import MensajeError from '../components/MensajeError';
import type { Componente, OpcionDelArmador, PasoDelArmador, ResultadoDelArmado } from '../tipos';

type Seleccion = Partial<Record<Componente, number>>;

function leerSeleccion(parametros: URLSearchParams, pasos: PasoDelArmador[]): Seleccion {
  const seleccion: Seleccion = {};
  for (const paso of pasos) {
    const id = Number(parametros.get(paso.clave));
    if (paso.productos.some((producto) => producto.id === id)) {
      seleccion[paso.clave] = id;
    }
  }
  return seleccion;
}

interface PropsDeOpcion {
  paso: PasoDelArmador;
  producto: OpcionDelArmador;
  elegido: boolean;
  motivo?: string;
  onElegir: (clave: Componente, id: number) => void;
}

function Opcion({ paso, producto, elegido, motivo, onElegir }: PropsDeOpcion) {
  const sinStock = producto.stock === 0;
  const deshabilitada = Boolean(motivo) || sinStock;

  return (
    <li>
      <button
        type="button"
        onClick={() => onElegir(paso.clave, producto.id)}
        disabled={deshabilitada}
        aria-pressed={elegido}
        className={`flex h-full w-full gap-3 rounded-xl border p-3 text-left transition ${
          elegido
            ? 'border-orange-600 bg-orange-50 ring-4 ring-orange-100'
            : 'border-neutral-200 bg-white hover:border-neutral-400'
        } disabled:cursor-not-allowed disabled:hover:border-neutral-200`}
      >
        <span className={`size-16 shrink-0 overflow-hidden rounded-lg ${deshabilitada ? 'opacity-40' : ''}`}>
          <ImagenProducto producto={{ ...producto, categoria: paso.titulo }} className="h-full" tamanoIcono="size-8" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className={`text-sm leading-snug font-semibold ${deshabilitada ? 'text-neutral-400' : ''}`}>
            {producto.nombre}
          </span>
          <span className="flex flex-wrap gap-1">
            {etiquetasDeFicha(paso.clave, producto.especificaciones).map((etiqueta) => (
              <span key={etiqueta} className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-600">
                {etiqueta}
              </span>
            ))}
          </span>
          {motivo ? (
            <span className="flex items-start gap-1 text-xs text-red-700">
              <Icono nombre="alerta" className="mt-px size-3.5 shrink-0" />
              {motivo}
            </span>
          ) : sinStock ? (
            <span className="text-xs font-semibold text-neutral-500">Sin stock</span>
          ) : (
            <span className="text-sm font-bold tabular-nums">{formatearPrecio(producto.precio)}</span>
          )}
        </span>
      </button>
    </li>
  );
}

interface PropsDePaso {
  numero: number;
  paso: PasoDelArmador;
  elegido: OpcionDelArmador | undefined;
  abierto: boolean;
  incompatibles: Record<number, string> | undefined;
  onAbrir: (clave: Componente | null) => void;
  onElegir: (clave: Componente, id: number) => void;
  onQuitar: (clave: Componente) => void;
}

function Paso({ numero, paso, elegido, abierto, incompatibles, onAbrir, onElegir, onQuitar }: PropsDePaso) {
  return (
    <section className="tarjeta flex flex-col gap-4 p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
            elegido ? 'bg-orange-700 text-white' : 'border border-neutral-300 text-neutral-500'
          }`}
        >
          {elegido ? <Icono nombre="check" className="size-4" grosor={3} /> : numero}
        </span>
        <div className="min-w-0 flex-1 basis-40">
          <h2 className="font-bold">
            {paso.titulo}
            {!paso.obligatorio && <span className="ml-2 text-xs font-normal text-neutral-500">(opcional)</span>}
          </h2>
          <p className="truncate text-sm text-neutral-600">{elegido ? elegido.nombre : 'Sin elegir'}</p>
          {elegido && <p className="text-sm font-bold tabular-nums sm:hidden">{formatearPrecio(elegido.precio)}</p>}
        </div>
        {elegido && (
          <span className="hidden text-sm font-bold whitespace-nowrap tabular-nums sm:inline">
            {formatearPrecio(elegido.precio)}
          </span>
        )}
        <div className="ml-auto flex gap-2">
          {elegido && (
            <button type="button" className="btn btn-secundario btn-chico" onClick={() => onQuitar(paso.clave)}>
              Quitar
            </button>
          )}
          <button
            type="button"
            className="btn btn-secundario btn-chico"
            aria-expanded={abierto}
            onClick={() => onAbrir(abierto ? null : paso.clave)}
          >
            {abierto ? 'Cerrar' : elegido ? 'Cambiar' : 'Elegir'}
          </button>
        </div>
      </div>

      {abierto && (
        <ul className="grid gap-3 sm:grid-cols-2" aria-label={`Opciones de ${paso.titulo}`}>
          {paso.productos.map((producto) => (
            <Opcion
              key={producto.id}
              paso={paso}
              producto={producto}
              elegido={elegido?.id === producto.id}
              motivo={incompatibles?.[producto.id]}
              onElegir={onElegir}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

export default function Armador() {
  const navigate = useNavigate();
  const [parametros, setParametros] = useSearchParams();
  const agregar = useCarritoStore((estado) => estado.agregar);

  const [pasos, setPasos] = useState<PasoDelArmador[] | null>(null);
  const [resultado, setResultado] = useState<ResultadoDelArmado | null>(null);
  const [abierto, setAbierto] = useState<Componente | null | undefined>(undefined);
  const [error, setError] = useState('');
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    async function cargarOpciones() {
      try {
        const respuesta = await api.get('/armador');
        setPasos(respuesta.data.pasos);
      } catch (e) {
        setError(obtenerMensajeError(e));
      }
    }

    cargarOpciones();
  }, []);

  const seleccion = useMemo(() => (pasos ? leerSeleccion(parametros, pasos) : {}), [parametros, pasos]);
  const claveDeSeleccion = JSON.stringify(seleccion);

  useEffect(() => {
    if (!pasos) return;

    async function verificar() {
      try {
        const respuesta = await api.post('/armador/verificar', { seleccion: JSON.parse(claveDeSeleccion) });
        setResultado(respuesta.data);
      } catch (e) {
        setError(obtenerMensajeError(e));
      }
    }

    verificar();
  }, [pasos, claveDeSeleccion]);

  if (!pasos) {
    return error ? <MensajeError texto={error} /> : <Cargando />;
  }

  const elegidos = Object.fromEntries(
    pasos.map((paso) => [paso.clave, paso.productos.find((producto) => producto.id === seleccion[paso.clave])])
  ) as Partial<Record<Componente, OpcionDelArmador>>;
  const primerPendiente = pasos.find((paso) => !elegidos[paso.clave])?.clave ?? null;
  const pasoAbierto = abierto === undefined ? primerPendiente : abierto;

  const guardarSeleccion = (nueva: Seleccion) => {
    setCopiado(false);
    const conValor = Object.entries(nueva).filter(([, id]) => id);
    setParametros(Object.fromEntries(conValor.map(([clave, id]) => [clave, String(id)])), { replace: true });
  };

  const elegir = (clave: Componente, id: number) => {
    const nueva: Seleccion = { ...seleccion, [clave]: id };
    guardarSeleccion(nueva);
    setAbierto(pasos.find((paso) => !nueva[paso.clave])?.clave ?? null);
  };

  const quitar = (clave: Componente) => {
    guardarSeleccion({ ...seleccion, [clave]: undefined });
  };

  const agregarAlCarrito = () => {
    for (const paso of pasos) {
      const producto = elegidos[paso.clave];
      if (producto) agregar({ ...producto, categoria: paso.titulo });
    }
    navigate('/carrito');
  };

  async function copiarEnlace() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  }

  const titulosDe = (claves: Componente[]) =>
    claves.map((clave) => pasos.find((paso) => paso.clave === clave)?.titulo.toLowerCase()).join(', ');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="antetitulo">Armador de PC</p>
        <h1 className="titulo mt-1">Armá tu PC</h1>
        <p className="mt-2 max-w-2xl text-neutral-600">
          Elegí cada componente y te avisamos al instante si algo no es compatible: socket, memoria, tamaño del gabinete
          y potencia de la fuente.
        </p>
      </div>

      <MensajeError texto={error} />

      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-1 basis-[32rem] flex-col gap-3">
          {pasos.map((paso, indice) => (
            <Paso
              key={paso.clave}
              numero={indice + 1}
              paso={paso}
              elegido={elegidos[paso.clave]}
              abierto={pasoAbierto === paso.clave}
              incompatibles={resultado?.incompatibles?.[paso.clave]}
              onAbrir={setAbierto}
              onElegir={elegir}
              onQuitar={quitar}
            />
          ))}
        </div>

        <aside className="tarjeta flex w-full flex-col gap-4 lg:sticky lg:top-24 lg:w-96">
          <h2 className="text-lg font-bold">Tu PC</h2>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-neutral-50 p-3">
              <dt className="text-neutral-500">Consumo estimado</dt>
              <dd className="mt-1 text-lg font-bold tabular-nums">{resultado?.consumo ?? 0} W</dd>
            </div>
            <div className="rounded-xl bg-neutral-50 p-3">
              <dt className="text-neutral-500">Fuente recomendada</dt>
              <dd className="mt-1 text-lg font-bold tabular-nums">
                {resultado?.consumo ? `${resultado.potenciaRecomendada} W` : '—'}
              </dd>
            </div>
          </dl>

          {resultado && resultado.problemas.length > 0 && (
            <ul className="flex flex-col gap-2" aria-label="Problemas">
              {resultado.problemas.map((problema) => (
                <li
                  key={problema.mensaje}
                  className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900"
                >
                  <Icono nombre="alerta" className="mt-0.5 size-4 shrink-0" />
                  {problema.mensaje}
                </li>
              ))}
            </ul>
          )}

          {resultado?.avisos.map((aviso) => (
            <p
              key={aviso}
              className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950"
            >
              <Icono nombre="alerta" className="mt-0.5 size-4 shrink-0" />
              {aviso}
            </p>
          ))}

          {resultado && resultado.faltan.length > 0 && (
            <p className="text-sm text-neutral-600">Falta elegir: {titulosDe(resultado.faltan)}.</p>
          )}

          {resultado?.completo && (
            <p className="flex items-center gap-2 text-sm font-semibold text-green-800">
              <Icono nombre="check" className="size-4" grosor={3} />
              Todo es compatible.
            </p>
          )}

          <p className="flex items-baseline justify-between border-t border-neutral-100 pt-4 font-bold">
            Total
            <span className="text-2xl font-black tracking-tight tabular-nums">
              {formatearPrecio(resultado?.total ?? 0)}
            </span>
          </p>

          <button
            type="button"
            className="btn btn-acento min-h-12 text-base"
            disabled={!resultado?.completo}
            onClick={agregarAlCarrito}
          >
            Agregar todo al carrito
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-secundario flex-1"
              disabled={Object.keys(seleccion).length === 0}
              onClick={copiarEnlace}
            >
              {copiado ? '¡Enlace copiado!' : 'Copiar enlace'}
            </button>
            <button
              type="button"
              className="btn btn-secundario flex-1"
              disabled={Object.keys(seleccion).length === 0}
              onClick={() => {
                guardarSeleccion({});
                setAbierto(undefined);
              }}
            >
              Empezar de nuevo
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
