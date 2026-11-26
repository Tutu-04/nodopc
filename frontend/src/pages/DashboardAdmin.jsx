import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { obtenerMensajeError } from '../api/api';
import {
  formatearFecha,
  formatearMes,
  formatearPorcentaje,
  formatearPrecio,
  formatearPrecioCorto,
} from '../utils/formato';
import { COLORES_CATEGORIAS, COLOR_OTRAS, COLORES_ESTADOS } from '../utils/colores';
import Dato from '../components/Dato';
import GraficoBarras from '../components/GraficoBarras';
import GraficoTorta from '../components/GraficoTorta';
import Seccion from '../components/Seccion';
import EstadoPedido from '../components/EstadoPedido';
import Cargando from '../components/Cargando';
import MensajeError from '../components/MensajeError';

const CATEGORIAS_EN_TORTA = 5;

function Muestra({ color }) {
  return <span className="mr-2 inline-block size-3 shrink-0 rounded-full" style={{ background: color }} aria-hidden="true" />;
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default function DashboardAdmin() {
  const [metricas, setMetricas] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargarDatos() {
      try {
        const respuestaMetricas = await api.get('/dashboard');
        const respuestaPedidos = await api.get('/pedidos');

        setMetricas(respuestaMetricas.data);
        setPedidos(respuestaPedidos.data.slice(0, 5));
      } catch (e) {
        setError(obtenerMensajeError(e));
      } finally {
        setCargando(false);
      }
    }

    cargarDatos();
  }, []);

  if (cargando) return <Cargando />;
  if (error) return <MensajeError texto={error} />;

  const {
    resumen,
    ventasPorMes,
    pedidosPorEstado,
    productosMasVendidos,
    ventasPorCategoria,
    mejoresClientes,
    productosPocoStock,
  } = metricas;

  const datosMeses = ventasPorMes.map((fila) => ({ mes: formatearMes(fila.mes), total: fila.total }));

  const totalCategorias = ventasPorCategoria.reduce((suma, fila) => suma + fila.ingresos, 0);
  const colorCategoria = (indice) => (indice < CATEGORIAS_EN_TORTA ? COLORES_CATEGORIAS[indice] : COLOR_OTRAS);
  const datosCategorias = ventasPorCategoria.slice(0, CATEGORIAS_EN_TORTA).map((fila, indice) => ({
    nombre: fila.categoria,
    valor: fila.ingresos,
    fill: colorCategoria(indice),
  }));
  const restoCategorias = ventasPorCategoria.slice(CATEGORIAS_EN_TORTA);
  if (restoCategorias.length > 0) {
    datosCategorias.push({
      nombre: 'Otras',
      valor: restoCategorias.reduce((suma, fila) => suma + fila.ingresos, 0),
      fill: COLOR_OTRAS,
    });
  }

  const datosEstados = pedidosPorEstado.map((fila) => ({
    nombre: capitalizar(fila.estado),
    valor: fila.cantidad,
    fill: COLORES_ESTADOS[fila.estado],
  }));

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Dato titulo="Total vendido" valor={formatearPrecio(resumen.total_vendido)} />
        <Dato titulo="Pedidos" valor={resumen.pedidos} />
        <Dato titulo="Ticket promedio" valor={formatearPrecio(resumen.ticket_promedio)} />
        <Dato titulo="Unidades vendidas" valor={resumen.unidades_vendidas} />
        <Dato titulo="Clientes" valor={resumen.clientes} />
        <Dato titulo="Pedidos pendientes" valor={resumen.pedidos_pendientes} />
        <Dato titulo="Productos" valor={resumen.productos} />
        <Dato titulo="Sin stock / poco stock" valor={`${resumen.productos_sin_stock} / ${resumen.productos_poco_stock}`} />
      </div>

      <Seccion titulo="Ventas por mes" descripcion="Facturación de los últimos 6 meses con pedidos.">
        {ventasPorMes.length === 0 ? (
          <p className="text-neutral-600">Todavía no hay ventas.</p>
        ) : (
          <div className="flex flex-wrap gap-8">
            <div className="min-w-0 flex-1 basis-96">
              <GraficoBarras
                datos={datosMeses}
                claveEtiqueta="mes"
                claveValor="total"
                nombreValor="Facturación"
                formatoValor={formatearPrecio}
                formatoEje={formatearPrecioCorto}
              />
            </div>
            <div className="min-w-0 flex-1 basis-80 overflow-x-auto">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Mes</th>
                    <th className="text-right">Pedidos</th>
                    <th className="text-right">Facturación</th>
                    <th className="text-right">Ticket prom.</th>
                  </tr>
                </thead>
                <tbody>
                  {ventasPorMes.map((fila) => (
                    <tr key={fila.mes}>
                      <td className="capitalize">{formatearMes(fila.mes)}</td>
                      <td className="text-right tabular-nums">{fila.pedidos}</td>
                      <td className="text-right tabular-nums">{formatearPrecio(fila.total)}</td>
                      <td className="text-right tabular-nums">{formatearPrecio(fila.total / fila.pedidos)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Seccion>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <Seccion titulo="Ventas por categoría" descripcion="Parte de los ingresos que aporta cada categoría.">
          <GraficoTorta datos={datosCategorias} formatoValor={formatearPrecio} dona />
          <div className="overflow-x-auto">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th className="text-right">%</th>
                  <th className="text-right">Unidades</th>
                  <th className="text-right">Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {ventasPorCategoria.map((fila, indice) => (
                  <tr key={fila.categoria}>
                    <td>
                      <span className="flex items-center">
                        <Muestra color={colorCategoria(indice)} />
                        {fila.categoria}
                      </span>
                    </td>
                    <td className="text-right tabular-nums">{formatearPorcentaje(fila.ingresos, totalCategorias)}</td>
                    <td className="text-right tabular-nums">{fila.unidades}</td>
                    <td className="text-right tabular-nums">{formatearPrecio(fila.ingresos)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Seccion>

        <Seccion titulo="Pedidos por estado" descripcion="Cuántos pedidos hay en cada etapa del envío.">
          <GraficoTorta datos={datosEstados} formatoValor={(valor) => `${valor} pedidos`} />
          <div className="overflow-x-auto">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Estado</th>
                  <th className="text-right">Pedidos</th>
                  <th className="text-right">%</th>
                  <th className="text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                {pedidosPorEstado.map((fila) => (
                  <tr key={fila.estado}>
                    <td>
                      <span className="flex items-center">
                        <Muestra color={COLORES_ESTADOS[fila.estado]} />
                        <EstadoPedido estado={fila.estado} />
                      </span>
                    </td>
                    <td className="text-right tabular-nums">{fila.cantidad}</td>
                    <td className="text-right tabular-nums">{formatearPorcentaje(fila.cantidad, resumen.pedidos)}</td>
                    <td className="text-right tabular-nums">{formatearPrecio(fila.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Seccion>

        <Seccion titulo="Productos más vendidos" descripcion="Top 5 por unidades vendidas.">
          <GraficoBarras
            datos={productosMasVendidos}
            claveEtiqueta="producto"
            claveValor="unidades"
            nombreValor="Unidades"
            formatoValor={(valor) => `${valor} u.`}
            horizontal
            alto={240}
          />
          <div className="overflow-x-auto">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th className="text-right">Unidades</th>
                  <th className="text-right">Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {productosMasVendidos.map((fila) => (
                  <tr key={fila.producto}>
                    <td>{fila.producto}</td>
                    <td className="text-right tabular-nums">{fila.unidades}</td>
                    <td className="text-right tabular-nums">{formatearPrecio(fila.ingresos)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Seccion>

        <Seccion titulo="Mejores clientes" descripcion="Top 5 por monto total comprado.">
          <GraficoBarras
            datos={mejoresClientes}
            claveEtiqueta="cliente"
            claveValor="total"
            nombreValor="Total comprado"
            formatoValor={formatearPrecio}
            formatoEje={formatearPrecioCorto}
            horizontal
            alto={240}
          />
          <div className="overflow-x-auto">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th className="text-right">Pedidos</th>
                  <th className="text-right">Total comprado</th>
                </tr>
              </thead>
              <tbody>
                {mejoresClientes.map((fila) => (
                  <tr key={fila.email}>
                    <td>
                      <span className="block font-bold">{fila.cliente}</span>
                      <span className="text-xs text-neutral-600">{fila.email}</span>
                    </td>
                    <td className="text-right tabular-nums">{fila.pedidos}</td>
                    <td className="text-right tabular-nums">{formatearPrecio(fila.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Seccion>
      </div>

      <Seccion titulo="Productos con poco stock" descripcion="Productos con 5 unidades o menos, para reponer.">
        {productosPocoStock.length === 0 ? (
          <p className="text-neutral-600">Todos los productos tienen stock suficiente.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th className="text-right">Stock</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {productosPocoStock.map((producto) => (
                  <tr key={producto.id}>
                    <td className="font-bold">{producto.nombre}</td>
                    <td>{producto.categoria}</td>
                    <td
                      className={
                        producto.stock === 0
                          ? 'text-right tabular-nums font-bold text-red-700'
                          : 'text-right tabular-nums'
                      }
                    >
                      {producto.stock === 0 ? 'Sin stock' : producto.stock}
                    </td>
                    <td className="text-right">
                      <Link to={`/admin/productos/${producto.id}/editar`} className="btn btn-secundario btn-chico">
                        Reponer
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Seccion>

      <section>
        <h2 className="mb-3 text-lg font-bold tracking-tight">Gestión</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/productos" className="btn btn-acento">
            Productos
          </Link>
          <Link to="/admin/categorias" className="btn btn-secundario">
            Categorías
          </Link>
          <Link to="/admin/marcas" className="btn btn-secundario">
            Marcas
          </Link>
          <Link to="/admin/usuarios" className="btn btn-secundario">
            Usuarios
          </Link>
          <Link to="/admin/pedidos" className="btn btn-secundario">
            Pedidos
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold tracking-tight">Últimos pedidos</h2>
        <div className="tabla-caja">
          <table className="tabla">
            <thead>
              <tr>
                <th>N.º</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((pedido) => (
                <tr key={pedido.id}>
                  <td className="tabular-nums">#{pedido.id}</td>
                  <td>{pedido.cliente}</td>
                  <td>{formatearFecha(pedido.fecha)}</td>
                  <td>
                    <EstadoPedido estado={pedido.estado} />
                  </td>
                  <td className="tabular-nums">{formatearPrecio(pedido.total)}</td>
                  <td className="text-right">
                    <Link to={`/pedidos/${pedido.id}`} className="btn btn-secundario btn-chico">
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
