import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useCarritoStore, calcularTotal, contarProductos } from '../store/carritoStore';
import { formatearPrecio } from '../utils/formato';
import ImagenProducto from '../components/ImagenProducto';
import Icono from '../components/Icono';

export default function Carrito() {
  const navigate = useNavigate();
  const items = useCarritoStore((estado) => estado.items);
  const cambiarCantidad = useCarritoStore((estado) => estado.cambiarCantidad);
  const quitar = useCarritoStore((estado) => estado.quitar);
  const vaciar = useCarritoStore((estado) => estado.vaciar);
  const sincronizar = useCarritoStore((estado) => estado.sincronizar);
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    async function actualizarCarrito() {
      const ids = useCarritoStore.getState().items.map((item) => item.id);
      if (ids.length === 0) return;

      try {
        const respuesta = await api.get('/productos', { params: { ids: ids.join(','), porPagina: 100 } });
        const quitados = sincronizar(respuesta.data.productos);
        if (quitados.length > 0) {
          setAviso(`Se quitaron del carrito porque ya no están disponibles: ${quitados.join(', ')}.`);
        }
      } catch {
        setAviso('');
      }
    }

    actualizarCarrito();
  }, [sincronizar]);

  const cartelAviso = aviso && (
    <p className="mb-5 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <Icono nombre="alerta" className="mt-0.5 size-4 shrink-0" />
      {aviso}
    </p>
  );

  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="titulo">Carrito</h1>
        {cartelAviso}
        <div className="tarjeta flex flex-col items-center gap-4 py-14 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-orange-50 text-orange-700">
            <Icono nombre="carrito" className="size-7" grosor={1.8} />
          </span>
          <p className="text-lg font-bold">Todavía no agregaste productos.</p>
          <Link to="/catalogo" className="btn btn-acento">
            Ir al catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="titulo">Carrito</h1>
      {cartelAviso}

      <div className="flex flex-wrap items-start gap-6">
        <div className="tabla-caja min-w-0 flex-1 basis-xl">
          <table className="tabla">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-14 shrink-0 overflow-hidden rounded-lg">
                        <ImagenProducto producto={item} className="h-14 p-1" tamanoIcono="size-7" />
                      </div>
                      <Link to={`/producto/${item.id}`} className="font-semibold hover:text-orange-700">
                        {item.nombre}
                      </Link>
                    </div>
                  </td>
                  <td className="whitespace-nowrap tabular-nums">{formatearPrecio(item.precio)}</td>
                  <td>
                    <div className="inline-flex items-center rounded-xl border border-neutral-200">
                      <button
                        type="button"
                        className="flex size-9 cursor-pointer items-center justify-center rounded-l-xl hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Restar una unidad de ${item.nombre}`}
                        disabled={item.cantidad <= 1}
                        onClick={() => cambiarCantidad(item.id, item.cantidad - 1)}
                      >
                        <Icono nombre="menos" className="size-4" />
                      </button>
                      <span className="w-8 text-center font-semibold tabular-nums">{item.cantidad}</span>
                      <button
                        type="button"
                        className="flex size-9 cursor-pointer items-center justify-center rounded-r-xl hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Sumar una unidad de ${item.nombre}`}
                        disabled={item.cantidad >= item.stock}
                        onClick={() => cambiarCantidad(item.id, item.cantidad + 1)}
                      >
                        <Icono nombre="mas" className="size-4" />
                      </button>
                    </div>
                  </td>
                  <td className="font-bold whitespace-nowrap tabular-nums">
                    {formatearPrecio(item.precio * item.cantidad)}
                  </td>
                  <td className="text-right">
                    <button type="button" className="btn btn-peligro btn-chico" onClick={() => quitar(item.id)}>
                      Quitar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="tarjeta flex w-full flex-col gap-4 lg:w-80">
          <h2 className="text-lg font-bold">Resumen</h2>
          <div className="flex justify-between text-sm text-neutral-600">
            <span>Productos</span>
            <span className="tabular-nums">{contarProductos(items)}</span>
          </div>
          <p className="flex items-baseline justify-between border-t border-neutral-100 pt-4 text-lg font-bold">
            Total:{' '}
            <span className="text-2xl font-black tracking-tight tabular-nums">
              {formatearPrecio(calcularTotal(items))}
            </span>
          </p>
          <button type="button" className="btn btn-acento min-h-12 text-base" onClick={() => navigate('/checkout')}>
            Finalizar compra
          </button>
          <button type="button" className="btn btn-secundario" onClick={vaciar}>
            Vaciar carrito
          </button>
        </aside>
      </div>
    </div>
  );
}
