import { beforeEach, describe, expect, it } from 'vitest';
import { calcularTotal, contarProductos, useCarritoStore } from './carritoStore';

const ryzen = { id: 1, nombre: 'Ryzen 5 7600', precio: 289999, stock: 2, categoria: 'Procesadores', imagen_url: null };
const mouse = { id: 20, nombre: 'Logitech G203', precio: 39999, stock: 35, categoria: 'Periféricos', imagen_url: null };

function items() {
  return useCarritoStore.getState().items;
}

beforeEach(() => {
  useCarritoStore.getState().vaciar();
});

describe('agregar', () => {
  it('suma un producto nuevo con cantidad 1', () => {
    useCarritoStore.getState().agregar(ryzen);
    expect(items()).toEqual([expect.objectContaining({ id: 1, cantidad: 1 })]);
  });

  it('aumenta la cantidad si el producto ya estaba, sin pasarse del stock', () => {
    const { agregar } = useCarritoStore.getState();
    agregar(ryzen);
    agregar(ryzen);
    agregar(ryzen);
    expect(items()[0].cantidad).toBe(2);
  });

  it('no modifica el array anterior', () => {
    useCarritoStore.getState().agregar(ryzen);
    const antes = items();
    useCarritoStore.getState().agregar(mouse);
    expect(antes).toHaveLength(1);
    expect(items()).toHaveLength(2);
  });
});

describe('cambiarCantidad', () => {
  it('mantiene la cantidad entre 1 y el stock disponible', () => {
    const { agregar, cambiarCantidad } = useCarritoStore.getState();
    agregar(ryzen);

    cambiarCantidad(1, 10);
    expect(items()[0].cantidad).toBe(2);

    cambiarCantidad(1, 0);
    expect(items()[0].cantidad).toBe(1);
  });
});

describe('sincronizar', () => {
  it('actualiza precio y stock, y quita lo que ya no está disponible', () => {
    const { agregar, cambiarCantidad, sincronizar } = useCarritoStore.getState();
    agregar(ryzen);
    agregar(mouse);
    cambiarCantidad(20, 10);

    const quitados = sincronizar([{ ...mouse, precio: 35000, stock: 4 }]);

    expect(quitados).toEqual(['Ryzen 5 7600']);
    expect(items()).toEqual([expect.objectContaining({ id: 20, precio: 35000, stock: 4, cantidad: 4 })]);
  });
});

describe('totales', () => {
  it('cuenta unidades y suma precio por cantidad', () => {
    const lista = [
      { ...ryzen, cantidad: 2 },
      { ...mouse, cantidad: 3 },
    ];
    expect(contarProductos(lista)).toBe(5);
    expect(calcularTotal(lista)).toBe(289999 * 2 + 39999 * 3);
  });
});
