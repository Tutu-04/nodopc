import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import api from '../../../api/api';
import ProductoForm from './ProductoForm';
import { prepararFicha } from './CamposFicha';

vi.mock('../../../api/api', async (original) => {
  const modulo = await original();
  return { ...modulo, default: { get: vi.fn() } };
});

const CAMPOS = {
  procesador: {
    socket: { tipo: 'texto', etiqueta: 'Socket' },
    consumo: { tipo: 'numero', etiqueta: 'Consumo máximo (W)' },
    graficos_integrados: { tipo: 'si_o_no', etiqueta: 'Gráficos integrados' },
  },
  gabinete: { formatos: { tipo: 'lista', etiqueta: 'Formatos que admite', opciones: ['ATX', 'Micro ATX'] } },
  almacenamiento: {},
};

const RESPUESTAS = {
  '/categorias': [
    { id: 1, nombre: 'Procesadores', componente: 'procesador' },
    { id: 8, nombre: 'Periféricos', componente: null },
    { id: 10, nombre: 'Gabinetes', componente: 'gabinete' },
  ],
  '/marcas': [{ id: 1, nombre: 'AMD' }],
  '/armador/campos': CAMPOS,
};

function mostrar(inicial) {
  const onGuardar = vi.fn();
  render(
    <MemoryRouter>
      <ProductoForm inicial={inicial} onGuardar={onGuardar} guardando={false} />
    </MemoryRouter>
  );
  return onGuardar;
}

beforeEach(() => {
  vi.mocked(api.get).mockImplementation((ruta) => Promise.resolve({ data: RESPUESTAS[ruta] }));
});

describe('Ficha técnica en el formulario de productos', () => {
  it('pide los campos del componente y los manda con el tipo correcto', async () => {
    const usuario = userEvent.setup();
    const onGuardar = mostrar({ nombre: 'Ryzen', precio: 10, stock: 1, categoria_id: 1, marca_id: 1 });

    await usuario.type(await screen.findByLabelText('Socket'), 'AM5');
    await usuario.type(screen.getByLabelText('Consumo máximo (W)'), '88');
    await usuario.selectOptions(screen.getByLabelText('Gráficos integrados'), 'Sí');
    await usuario.click(screen.getByRole('button', { name: /Guardar|Crear/ }));

    expect(onGuardar.mock.calls[0][0].especificaciones).toEqual({
      socket: 'AM5',
      consumo: 88,
      graficos_integrados: true,
    });
  });

  it('carga la ficha existente y no la muestra para productos que no son componentes', async () => {
    const usuario = userEvent.setup();
    mostrar({
      nombre: 'Gabinete',
      precio: 10,
      stock: 1,
      categoria_id: 10,
      marca_id: 1,
      especificaciones: { formatos: ['ATX'] },
    });

    expect(await screen.findByLabelText('ATX')).toBeChecked();
    expect(screen.getByLabelText('Micro ATX')).not.toBeChecked();

    await usuario.selectOptions(screen.getByLabelText('Categoría'), 'Periféricos');
    expect(screen.queryByText('Ficha técnica')).not.toBeInTheDocument();
  });
});

describe('prepararFicha', () => {
  it('devuelve null si no se completó nada', () => {
    expect(prepararFicha(CAMPOS.procesador, { socket: '' })).toBeNull();
    expect(prepararFicha(CAMPOS.almacenamiento, {})).toBeNull();
  });
});
