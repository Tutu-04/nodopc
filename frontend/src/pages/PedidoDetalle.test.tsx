import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import api from '../api/api';
import { useAuthStore } from '../store/authStore';
import PedidoDetalle from './PedidoDetalle';
import type { PedidoConItems } from '../tipos';
import type * as ModuloApi from '../api/api';

vi.mock('../api/api', async (original) => {
  const modulo = await original<typeof ModuloApi>();
  return { ...modulo, default: { get: vi.fn(), post: vi.fn() } };
});

const PEDIDO: PedidoConItems = {
  id: 30,
  usuario_id: 2,
  cliente: 'Cliente Demo',
  cliente_email: 'cliente@nodopc.com',
  fecha: '2026-11-20T10:00:00',
  estado: 'pendiente',
  metodo_entrega: 'envio',
  provincia: 'Tucumán',
  direccion_envio: 'Mitre 789',
  costo_envio: 9500,
  total: 49499,
  medio_pago: null,
  pago_id: null,
  pagado_en: null,
  vence_en: '2026-11-20T10:30:00',
  segundos_para_pagar: 1200,
  items: [{ id: 1, producto_id: 20, producto: 'Mouse Logitech G203', cantidad: 1, precio_unitario: 39999 }],
};

function responderCon(pedido: PedidoConItems) {
  vi.mocked(api.get).mockImplementation((ruta) =>
    Promise.resolve({ data: ruta === '/pagos/medios' ? { mercadopago: false, simulado: true } : pedido })
  );
}

function mostrar(ruta = '/pedidos/30') {
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route path="/pedidos/:id" element={<PedidoDetalle />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.getState().iniciarSesion({ id: 2, nombre: 'Cliente Demo', email: 'prueba@nodopc.com', rol: 'cliente' });
});

describe('PedidoDetalle', () => {
  it('muestra la entrega y separa el envío del subtotal', async () => {
    responderCon(PEDIDO);
    mostrar();

    expect(await screen.findByText('Envío a domicilio')).toBeInTheDocument();
    expect(screen.getByText('Mitre 789')).toBeInTheDocument();

    const totales = within(screen.getByText('Total').closest('dl') as HTMLElement);
    expect(totales.getByText('$ 39.999,00')).toBeInTheDocument();
    expect(totales.getByText('$ 9.500,00')).toBeInTheDocument();
    expect(totales.getByText('$ 49.499,00')).toBeInTheDocument();
  });

  it('al dueño de un pedido pendiente le ofrece pagar o cancelar', async () => {
    responderCon(PEDIDO);
    mostrar();

    expect(await screen.findByText('Falta el pago')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pagar con tarjeta de prueba' })).toHaveAttribute(
      'href',
      '/pedidos/30/pagar'
    );
    expect(screen.queryByRole('button', { name: 'Pagar con Mercado Pago' })).not.toBeInTheDocument();
    expect(screen.getByText('20:00')).toBeInTheDocument();
  });

  it('no le ofrece pagar a otra persona', async () => {
    useAuthStore.getState().iniciarSesion({ id: 1, nombre: 'Administrador', email: 'prueba@nodopc.com', rol: 'admin' });
    responderCon(PEDIDO);
    mostrar();

    expect(await screen.findByText('Mitre 789')).toBeInTheDocument();
    expect(screen.queryByText('Falta el pago')).not.toBeInTheDocument();
  });

  it('cancela el pedido después de confirmar', async () => {
    responderCon(PEDIDO);
    vi.mocked(api.post).mockResolvedValue({ data: { ...PEDIDO, estado: 'cancelado', segundos_para_pagar: null } });
    const usuario = userEvent.setup();
    mostrar();

    await usuario.click(await screen.findByRole('button', { name: 'Cancelar pedido' }));
    await usuario.click(screen.getByRole('button', { name: 'Sí, cancelar' }));

    expect(api.post).toHaveBeenCalledWith('/pedidos/30/cancelar');
    expect(await screen.findByText('Cancelado')).toBeInTheDocument();
    expect(screen.queryByText('Falta el pago')).not.toBeInTheDocument();
  });

  it('al volver del pago confirma el estado con la API', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: {
        ...PEDIDO,
        estado: 'pagado',
        medio_pago: 'simulado',
        pago_id: 'SIM-1A2B3C4D',
        pagado_en: '2026-11-20T10:05:00',
      },
    });
    mostrar('/pedidos/30?pago=aprobado');

    expect(await screen.findByText(/Recibimos tu pago/)).toBeInTheDocument();
    expect(api.post).toHaveBeenCalledWith('/pagos/30/verificar');
    expect(screen.getByText(/Operación SIM-1A2B3C4D/)).toBeInTheDocument();

    const seguimiento = screen.getByRole('list', { name: 'Seguimiento del pedido' });
    expect(within(seguimiento).getByText('Pago acreditado').closest('li')).toHaveAttribute('aria-current', 'step');
  });
});
