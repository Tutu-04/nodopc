import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Salir from './Salir';
import { useAuthStore } from '../store/authStore';
import { useCarritoStore } from '../store/carritoStore';

describe('Salir', () => {
  it('borra la sesión y el carrito, y vuelve al inicio', async () => {
    useAuthStore.getState().iniciarSesion({ id: 2, nombre: 'Cliente', rol: 'cliente' }, 'token');
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
  });
});
