import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Paginacion, { paginasVisibles } from './Paginacion';

function renderizar(pagina: number, paginas: number) {
  render(
    <MemoryRouter>
      <Paginacion pagina={pagina} paginas={paginas} enlace={(numero) => `/catalogo?pagina=${numero}`} />
    </MemoryRouter>
  );
}

describe('paginasVisibles', () => {
  it('muestra todas si son pocas', () => {
    expect(paginasVisibles(2, 3)).toEqual([1, 2, 3]);
  });

  it('resume las del medio con puntos suspensivos', () => {
    expect(paginasVisibles(5, 10)).toEqual([1, '…', 4, 5, 6, '…', 10]);
    expect(paginasVisibles(1, 10)).toEqual([1, 2, '…', 10]);
  });
});

describe('Paginacion', () => {
  it('no se muestra si hay una sola página', () => {
    renderizar(1, 1);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('marca la página actual y arma los enlaces', () => {
    renderizar(2, 3);
    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Página anterior' })).toHaveAttribute('href', '/catalogo?pagina=1');
    expect(screen.getByRole('link', { name: 'Página siguiente' })).toHaveAttribute('href', '/catalogo?pagina=3');
  });

  it('no ofrece ir más allá de los extremos', () => {
    renderizar(1, 3);
    expect(screen.queryByRole('link', { name: 'Página anterior' })).not.toBeInTheDocument();
  });
});
