import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      usuario: null,

      iniciarSesion: (usuario) => set({ usuario }),
      cerrarSesion: () => set({ usuario: null }),
    }),
    {
      name: 'nodopc-sesion',
      version: 1,
      migrate: (guardado) => ({ usuario: guardado?.usuario ?? null }),
    }
  )
);
