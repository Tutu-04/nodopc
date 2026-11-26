import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import api from '../api/api';
import PagoSimulado from './PagoSimulado';
import type * as ModuloApi from '../api/api';

vi.mock('../api/api', async (original) => {
  const modulo = await original<typeof ModuloApi>();
  return { ...modulo, default: { get: vi.fn(), post: vi.fn() } };
});

const PEDIDO = { id: 30, estado: 'pendiente', total: 49499, segundos_para_pagar: 1800 };

function mostrar() {
  render(
    <MemoryRouter initialEntries={['/pedidos/30/pagar']}>
      <Routes>
        <Route path="/pedidos/:id/pagar" element={<PagoSimulado />} />
        <Route path="/pedidos/:id" element={<p>Detalle del pedido</p>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.mocked(api.get).mockResolvedValue({ data: PEDIDO });
});

describe('PagoSimulado', () => {
  it('muestra el total y el tiempo para pagar', async () => {
    mostrar();
    expect(await screen.findByRole('heading', { name: /Pagar \$\s?49\.499,00/ })).toBeInTheDocument();
    expect(screen.getByText('30:00')).toBeInTheDocument();
  });

  it('formatea la tarjeta mientras se escribe y paga', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { ...PEDIDO, estado: 'pagado' } });
    const usuario = userEvent.setup();
    mostrar();

    await usuario.type(await screen.findByLabelText('Número de tarjeta'), '4509953566233704');
    await usuario.type(screen.getByLabelText('Titular'), 'APRO');
    await usuario.type(screen.getByLabelText('Vencimiento'), '1130');
    await usuario.type(screen.getByLabelText('Código de seguridad'), '123');

    expect(screen.getByLabelText('Número de tarjeta')).toHaveValue('4509 9535 6623 3704');
    expect(screen.getByLabelText('Vencimiento')).toHaveValue('11/30');

    await usuario.click(screen.getByRole('button', { name: /^Pagar/ }));

    expect(api.post).toHaveBeenCalledWith('/pagos/30/simulado', {
      numero: '4509 9535 6623 3704',
      titular: 'APRO',
      vencimiento: '11/30',
      cvv: '123',
    });
    expect(await screen.findByText('Detalle del pedido')).toBeInTheDocument();
  });

  it('muestra el motivo cuando el pago se rechaza', async () => {
    vi.mocked(api.post).mockRejectedValue({
      response: { data: { error: 'El pago fue rechazado: fondos insuficientes' } },
    });
    const usuario = userEvent.setup();
    mostrar();

    await usuario.click(await screen.findByRole('button', { name: 'Completar con la tarjeta de prueba' }));
    await usuario.click(screen.getByRole('button', { name: /^Pagar/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent('fondos insuficientes');
  });

  it('no ofrece pagar un pedido que ya no está pendiente', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { ...PEDIDO, estado: 'pagado' } });
    mostrar();

    expect(await screen.findByText('Este pedido ya no está pendiente de pago.')).toBeInTheDocument();
    expect(screen.queryByLabelText('Número de tarjeta')).not.toBeInTheDocument();
  });
});
