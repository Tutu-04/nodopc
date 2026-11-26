import { lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import RutaProtegida from './components/RutaProtegida';
import RutaSoloInvitados from './components/RutaSoloInvitados';

import Home from './pages/Home';
import Catalogo from './pages/Catalogo';
import ProductoDetalle from './pages/ProductoDetalle';
import Carrito from './pages/Carrito';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Dashboard from './pages/Dashboard';
import Checkout from './pages/Checkout';
import MisPedidos from './pages/MisPedidos';
import PedidoDetalle from './pages/PedidoDetalle';
import Salir from './pages/Salir';
import MiCuenta from './pages/MiCuenta';
import NoEncontrada from './pages/NoEncontrada';

const CategoriasLista = lazy(() => import('./pages/admin/categorias/CategoriasLista'));
const CategoriaNueva = lazy(() => import('./pages/admin/categorias/CategoriaNueva'));
const CategoriaEditar = lazy(() => import('./pages/admin/categorias/CategoriaEditar'));
const MarcasLista = lazy(() => import('./pages/admin/marcas/MarcasLista'));
const MarcaNueva = lazy(() => import('./pages/admin/marcas/MarcaNueva'));
const MarcaEditar = lazy(() => import('./pages/admin/marcas/MarcaEditar'));
const ProductosLista = lazy(() => import('./pages/admin/productos/ProductosLista'));
const ProductoNuevo = lazy(() => import('./pages/admin/productos/ProductoNuevo'));
const ProductoEditar = lazy(() => import('./pages/admin/productos/ProductoEditar'));
const UsuariosLista = lazy(() => import('./pages/admin/usuarios/UsuariosLista'));
const UsuarioNuevo = lazy(() => import('./pages/admin/usuarios/UsuarioNuevo'));
const UsuarioEditar = lazy(() => import('./pages/admin/usuarios/UsuarioEditar'));
const PedidosLista = lazy(() => import('./pages/admin/pedidos/PedidosLista'));
const PedidoEditar = lazy(() => import('./pages/admin/pedidos/PedidoEditar'));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/catalogo/categoria/:categoriaId" element={<Catalogo />} />
          <Route path="/producto/:id" element={<ProductoDetalle />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/salir" element={<Salir />} />

          <Route element={<RutaSoloInvitados />}>
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
          </Route>

          <Route element={<RutaProtegida />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cuenta" element={<MiCuenta />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/mis-pedidos" element={<MisPedidos />} />
            <Route path="/pedidos/:id" element={<PedidoDetalle />} />
          </Route>

          <Route element={<RutaProtegida soloAdmin />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/productos" replace />} />

              <Route path="productos" element={<ProductosLista />} />
              <Route path="productos/nuevo" element={<ProductoNuevo />} />
              <Route path="productos/:id/editar" element={<ProductoEditar />} />

              <Route path="categorias" element={<CategoriasLista />} />
              <Route path="categorias/nueva" element={<CategoriaNueva />} />
              <Route path="categorias/:id/editar" element={<CategoriaEditar />} />

              <Route path="marcas" element={<MarcasLista />} />
              <Route path="marcas/nueva" element={<MarcaNueva />} />
              <Route path="marcas/:id/editar" element={<MarcaEditar />} />

              <Route path="usuarios" element={<UsuariosLista />} />
              <Route path="usuarios/nuevo" element={<UsuarioNuevo />} />
              <Route path="usuarios/:id/editar" element={<UsuarioEditar />} />

              <Route path="pedidos" element={<PedidosLista />} />
              <Route path="pedidos/:id/editar" element={<PedidoEditar />} />
            </Route>
          </Route>

          <Route path="*" element={<NoEncontrada />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
