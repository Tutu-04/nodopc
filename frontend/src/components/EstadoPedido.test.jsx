import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import EstadoPedido from './EstadoPedido';

describe('EstadoPedido', () => {
  it.each([
    ['pendiente', 'Pendiente de pago'],
    ['pagado', 'Pagado'],
    ['enviado', 'Enviado'],
    ['entregado', 'Entregado'],
    ['cancelado', 'Cancelado'],
  ])('muestra el estado %s como "%s"', (estado, texto) => {
    render(<EstadoPedido estado={estado} />);
    expect(screen.getByText(texto)).toBeInTheDocument();
  });

  it('muestra tal cual un estado que no conoce', () => {
    render(<EstadoPedido estado="demorado" />);
    expect(screen.getByText('demorado')).toBeInTheDocument();
  });
});
