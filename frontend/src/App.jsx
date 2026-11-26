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

import CategoriasLista from './pages/admin/categorias/CategoriasLista';
import CategoriaNueva from './pages/admin/categorias/CategoriaNueva';
import CategoriaEditar from './pages/admin/categorias/CategoriaEditar';
import MarcasLista from './pages/admin/marcas/MarcasLista';
import MarcaNueva from './pages/admin/marcas/MarcaNueva';
import MarcaEditar from './pages/admin/marcas/MarcaEditar';
import ProductosLista from './pages/admin/productos/ProductosLista';
import ProductoNuevo from './pages/admin/productos/ProductoNuevo';
import ProductoEditar from './pages/admin/productos/ProductoEditar';
import UsuariosLista from './pages/admin/usuarios/UsuariosLista';
import UsuarioNuevo from './pages/admin/usuarios/UsuarioNuevo';
import UsuarioEditar from './pages/admin/usuarios/UsuarioEditar';
import PedidosLista from './pages/admin/pedidos/PedidosLista';
import PedidoEditar from './pages/admin/pedidos/PedidoEditar';

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

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
