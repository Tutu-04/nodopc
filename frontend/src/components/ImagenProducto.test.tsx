import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ImagenProducto from './ImagenProducto';

describe('ImagenProducto', () => {
  it('muestra la foto cuando el producto tiene una', () => {
    render(
      <ImagenProducto producto={{ nombre: 'Ryzen 5', categoria: 'Procesadores', imagen_url: '/productos/1.jpg' }} />
    );
    expect(screen.getByRole('img', { name: 'Ryzen 5' })).toHaveAttribute('src', '/productos/1.jpg');
  });

  it('muestra el ícono de la categoría si no hay foto', () => {
    const { container } = render(
      <ImagenProducto producto={{ nombre: 'Ryzen 5', categoria: 'Procesadores', imagen_url: null }} />
    );
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('cambia al ícono si la foto no carga', () => {
    const { container } = render(
      <ImagenProducto producto={{ nombre: 'Ryzen 5', categoria: 'Procesadores', imagen_url: '/rota.jpg' }} />
    );
    fireEvent.error(screen.getByRole('img'));
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
