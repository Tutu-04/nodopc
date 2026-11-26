import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProductoParaCarrito {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
  imagen_url: string | null;
}

export interface ItemCarrito extends ProductoParaCarrito {
  cantidad: number;
}

interface EstadoDelCarrito {
  items: ItemCarrito[];
  agregar: (producto: ProductoParaCarrito) => void;
  cambiarCantidad: (id: number, cantidad: number) => void;
  quitar: (id: number) => void;
  vaciar: () => void;
  sincronizar: (productos: ProductoParaCarrito[]) => string[];
}

export const useCarritoStore = create<EstadoDelCarrito>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (producto) =>
        set((estado) => {
          const yaEsta = estado.items.some((item) => item.id === producto.id);

          if (yaEsta) {
            return {
              items: estado.items.map((item) =>
                item.id === producto.id ? { ...item, cantidad: Math.min(item.cantidad + 1, item.stock) } : item
              ),
            };
          }

          const nuevo: ItemCarrito = {
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
            item.id === id ? { ...item, cantidad: Math.max(1, Math.min(cantidad, item.stock)) } : item
          ),
        })),

      quitar: (id) => set((estado) => ({ items: estado.items.filter((item) => item.id !== id) })),

      vaciar: () => set({ items: [] }),

      sincronizar: (productos) => {
        const quitados: string[] = [];
        const actualizados: ItemCarrito[] = [];

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

export function contarProductos(items: ItemCarrito[]): number {
  return items.reduce((suma, item) => suma + item.cantidad, 0);
}

export function calcularTotal(items: ItemCarrito[]): number {
  return items.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
}
