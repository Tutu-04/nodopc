import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import api from '../api/api';
import ProductoDetalle from './ProductoDetalle';

vi.mock('../api/api', async (original) => {
  const modulo = await original();
  return { ...modulo, default: { get: vi.fn() } };
});

const MOTHERBOARD = {
  id: 28,
  nombre: 'Motherboard MSI MAG B650 Tomahawk WiFi',
  descripcion: 'Socket AM5, memoria DDR5, formato ATX y WiFi 6E.',
  precio: 349999,
  stock: 6,
  categoria: 'Motherboards',
  marca: 'MSI',
  imagen_url: null,
  componente: 'motherboard',
  especificaciones: { socket: 'AM5', memoria: 'DDR5', formato: 'ATX' },
};

function mostrar(producto) {
  vi.mocked(api.get).mockResolvedValue({ data: producto });
  render(
    <MemoryRouter initialEntries={[`/producto/${producto.id}`]}>
      <Routes>
        <Route path="/producto/:id" element={<ProductoDetalle />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProductoDetalle', () => {
  it('muestra la ficha técnica de un componente y lleva al armador', async () => {
    mostrar(MOTHERBOARD);

    expect(await screen.findByRole('heading', { name: 'Ficha técnica' })).toBeInTheDocument();
    expect(screen.getByText('Socket').nextSibling).toHaveTextContent('AM5');
    expect(screen.getByText('Formato').nextSibling).toHaveTextContent('ATX');
    expect(screen.getByRole('link', { name: 'Armá una PC con este componente' })).toHaveAttribute(
      'href',
      '/armador?motherboard=28'
    );
  });

  it('no muestra ficha en productos que no son componentes', async () => {
    mostrar({ ...MOTHERBOARD, id: 20, nombre: 'Mouse', componente: null, especificaciones: null });

    expect(await screen.findByRole('heading', { name: 'Mouse' })).toBeInTheDocument();
    expect(screen.queryByText('Ficha técnica')).not.toBeInTheDocument();
  });
});
