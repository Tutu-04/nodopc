import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Salir from './Salir';
import api from '../api/api';

vi.mock('../api/api', () => ({ default: { post: vi.fn(() => Promise.resolve({ data: {} })) } }));
import { useAuthStore } from '../store/authStore';
import { useCarritoStore } from '../store/carritoStore';

describe('Salir', () => {
  it('avisa a la API, borra la sesión y el carrito, y vuelve al inicio', async () => {
    useAuthStore.getState().iniciarSesion({ id: 2, nombre: 'Cliente', rol: 'cliente' });
    useCarritoStore.getState().agregar({ id: 1, nombre: 'Ryzen 5', precio: 1, stock: 3 });

    render(
      <MemoryRouter initialEntries={['/salir']}>
        <Routes>
          <Route path="/" element={<p>Inicio</p>} />
          <Route path="/salir" element={<Salir />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Inicio')).toBeInTheDocument();
    expect(useAuthStore.getState().usuario).toBeNull();
    expect(useCarritoStore.getState().items).toEqual([]);
    expect(api.post).toHaveBeenCalledWith('/auth/salir');
  });
});
