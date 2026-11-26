import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCarritoStore = create(
  persist(
    (set, get) => ({
      items: [],

      agregar: (producto) =>
        set((estado) => {
          const yaEsta = estado.items.some((item) => item.id === producto.id);

          if (yaEsta) {
            return {
              items: estado.items.map((item) =>
                item.id === producto.id
                  ? { ...item, cantidad: Math.min(item.cantidad + 1, item.stock) }
                  : item
              ),
            };
          }

          const nuevo = {
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            stock: producto.stock,
            categoria: producto.categoria,
            imagen_url: producto.imagen_url,
            cantidad: 1,
          };
          return { items: [...estado.items, nuevo] };
        }),

      cambiarCantidad: (id, cantidad) =>
        set((estado) => ({
          items: estado.items.map((item) =>
            item.id === id
              ? { ...item, cantidad: Math.max(1, Math.min(cantidad, item.stock)) }
              : item
          ),
        })),

      quitar: (id) =>
        set((estado) => ({ items: estado.items.filter((item) => item.id !== id) })),

      vaciar: () => set({ items: [] }),

      sincronizar: (productos) => {
        const quitados = [];
        const actualizados = [];

        for (const item of get().items) {
          const producto = productos.find((p) => p.id === item.id);

          if (!producto || producto.stock === 0) {
            quitados.push(item.nombre);
            continue;
          }

          actualizados.push({
            ...item,
            nombre: producto.nombre,
            precio: producto.precio,
            stock: producto.stock,
            categoria: producto.categoria,
            imagen_url: producto.imagen_url,
            cantidad: Math.min(item.cantidad, producto.stock),
          });
        }

        set({ items: actualizados });
        return quitados;
      },
    }),
    { name: 'nodopc-carrito' }
  )
);

export function contarProductos(items) {
  return items.reduce((suma, item) => suma + item.cantidad, 0);
}

export function calcularTotal(items) {
  return items.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
}
