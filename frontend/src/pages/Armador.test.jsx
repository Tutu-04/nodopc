import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import api from '../api/api';
import { useCarritoStore } from '../store/carritoStore';
import Armador from './Armador';

vi.mock('../api/api', async (original) => {
  const modulo = await original();
  return { ...modulo, default: { get: vi.fn(), post: vi.fn() } };
});

function paso(clave, titulo, productos, obligatorio = true) {
  return { clave, titulo, obligatorio, productos };
}

const PASOS = [
  paso('procesador', 'Procesador', [
    {
      id: 1,
      nombre: 'Procesador AMD Ryzen 5 7600',
      precio: 100,
      stock: 5,
      especificaciones: { socket: 'AM5', consumo: 88, graficos_integrados: true },
    },
    {
      id: 3,
      nombre: 'Procesador Intel Core i5-14400F',
      precio: 90,
      stock: 5,
      especificaciones: { socket: 'LGA1700', consumo: 148, graficos_integrados: false },
    },
  ]),
  paso('motherboard', 'Motherboard', [
    {
      id: 7,
      nombre: 'Motherboard Gigabyte B650M',
      precio: 50,
      stock: 0,
      especificaciones: { socket: 'AM5', memoria: 'DDR5', formato: 'Micro ATX' },
    },
  ]),
  paso('placa_de_video', 'Placa de video', [], false),
];

const SIN_PROBLEMAS = {
  problemas: [],
  avisos: [],
  faltan: ['motherboard'],
  consumo: 0,
  potenciaRecomendada: 0,
  total: 0,
  completo: false,
  incompatibles: {},
};

let ubicacion;
function Ubicacion() {
  ubicacion = useLocation();
  return null;
}

function mostrar(ruta = '/armador') {
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route
          path="/armador"
          element={
            <>
              <Armador />
              <Ubicacion />
            </>
          }
        />
        <Route path="/carrito" element={<p>Carrito</p>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  useCarritoStore.setState({ items: [] });
  vi.mocked(api.get).mockResolvedValue({ data: { pasos: PASOS } });
  vi.mocked(api.post).mockResolvedValue({ data: SIN_PROBLEMAS });
});

describe('Armador', () => {
  it('abre el primer paso y al elegir guarda la selección en la URL', async () => {
    const usuario = userEvent.setup();
    mostrar();

    const opciones = await screen.findByRole('list', { name: 'Opciones de Procesador' });
    expect(within(opciones).getByText('AM5')).toBeInTheDocument();

    await usuario.click(within(opciones).getByRole('button', { name: /Ryzen 5 7600/ }));

    expect(ubicacion.search).toBe('?procesador=1');
    expect(api.post).toHaveBeenLastCalledWith('/armador/verificar', { seleccion: { procesador: 1 } });
    expect(await screen.findByRole('list', { name: 'Opciones de Motherboard' })).toBeInTheDocument();
  });

  it('lee la selección de un enlace compartido e ignora ids que no son opciones', async () => {
    mostrar('/armador?procesador=3&motherboard=99');

    await screen.findByText('Procesador Intel Core i5-14400F', { selector: 'p' });
    expect(api.post).toHaveBeenCalledWith('/armador/verificar', { seleccion: { procesador: 3 } });
  });

  it('deshabilita las opciones incompatibles y explica por qué', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: {
        ...SIN_PROBLEMAS,
        incompatibles: { procesador: { 3: 'El Intel Core i5-14400F usa socket LGA1700 y la motherboard es AM5.' } },
      },
    });
    mostrar();

    const opcion = await screen.findByRole('button', { name: /Core i5-14400F.*usa socket LGA1700/ });
    expect(opcion).toBeDisabled();
  });

  it('no deja elegir un componente sin stock', async () => {
    mostrar('/armador?procesador=1');

    expect(await screen.findByRole('button', { name: /B650M.*Sin stock/ })).toBeDisabled();
  });

  it('muestra los problemas y solo deja comprar un armado completo', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { ...SIN_PROBLEMAS, faltan: [], problemas: [{ mensaje: 'La memoria es DDR4 y la motherboard usa DDR5.' }] },
    });
    mostrar('/armador?procesador=1');

    expect(await screen.findByText('La memoria es DDR4 y la motherboard usa DDR5.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Agregar todo al carrito' })).toBeDisabled();
  });

  it('agrega todos los componentes elegidos al carrito', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { ...SIN_PROBLEMAS, faltan: [], completo: true, total: 150, consumo: 138, potenciaRecomendada: 250 },
    });
    const usuario = userEvent.setup();
    mostrar('/armador?procesador=1&motherboard=7');

    expect(await screen.findByText('Todo es compatible.')).toBeInTheDocument();
    expect(screen.getByText('250 W')).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: 'Agregar todo al carrito' }));

    expect(useCarritoStore.getState().items.map((item) => [item.id, item.categoria])).toEqual([
      [1, 'Procesador'],
      [7, 'Motherboard'],
    ]);
    expect(await screen.findByText('Carrito')).toBeInTheDocument();
  });
});
