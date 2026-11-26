import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RutaProtegida from './RutaProtegida';
import { useAuthStore } from '../store/authStore';

function renderizarEn(ruta, { soloAdmin = false } = {}) {
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route path="/login" element={<p>Pantalla de login</p>} />
        <Route path="/dashboard" element={<p>Panel</p>} />
        <Route element={<RutaProtegida soloAdmin={soloAdmin} />}>
          <Route path="/privada" element={<p>Contenido privado</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  useAuthStore.getState().cerrarSesion();
});

describe('RutaProtegida', () => {
  it('manda al login si no hay sesión', () => {
    renderizarEn('/privada');
    expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
  });

  it('muestra la página si hay sesión', () => {
    useAuthStore.getState().iniciarSesion({ id: 2, nombre: 'Cliente', rol: 'cliente' }, 'token');
    renderizarEn('/privada');
    expect(screen.getByText('Contenido privado')).toBeInTheDocument();
  });

  it('manda al panel a un cliente que entra a una ruta de administrador', () => {
    useAuthStore.getState().iniciarSesion({ id: 2, nombre: 'Cliente', rol: 'cliente' }, 'token');
    renderizarEn('/privada', { soloAdmin: true });
    expect(screen.getByText('Panel')).toBeInTheDocument();
  });

  it('deja pasar al administrador', () => {
    useAuthStore.getState().iniciarSesion({ id: 1, nombre: 'Admin', rol: 'admin' }, 'token');
    renderizarEn('/privada', { soloAdmin: true });
    expect(screen.getByText('Contenido privado')).toBeInTheDocument();
  });
});
