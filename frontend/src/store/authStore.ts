import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UsuarioDeSesion } from '../tipos';

interface EstadoDeSesion {
  usuario: UsuarioDeSesion | null;
  iniciarSesion: (usuario: UsuarioDeSesion) => void;
  cerrarSesion: () => void;
}

export const useAuthStore = create<EstadoDeSesion>()(
  persist(
    (set) => ({
      usuario: null,

      iniciarSesion: (usuario) => set({ usuario }),
      cerrarSesion: () => set({ usuario: null }),
    }),
    {
      name: 'nodopc-sesion',
      version: 1,
      migrate: (guardado) => ({ usuario: (guardado as Partial<EstadoDeSesion> | undefined)?.usuario ?? null }),
    }
  )
);
