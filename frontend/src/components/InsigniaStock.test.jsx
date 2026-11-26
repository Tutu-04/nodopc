import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import InsigniaStock from './InsigniaStock';

describe('InsigniaStock', () => {
  it('avisa cuando no hay stock', () => {
    render(<InsigniaStock stock={0} />);
    expect(screen.getByText('Sin stock')).toBeInTheDocument();
  });

  it('usa singular para la última unidad', () => {
    render(<InsigniaStock stock={1} />);
    expect(screen.getByText('Última unidad')).toBeInTheDocument();
  });

  it('avisa cuando quedan pocas unidades', () => {
    render(<InsigniaStock stock={4} />);
    expect(screen.getByText('Últimas 4 unidades')).toBeInTheDocument();
  });

  it('no muestra nada con stock suficiente', () => {
    const { container } = render(<InsigniaStock stock={20} />);
    expect(container).toBeEmptyDOMElement();
  });
});
