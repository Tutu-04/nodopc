import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import useRevalidarSesion from './useRevalidarSesion';
import api from '../api/api';
import { useAuthStore } from '../store/authStore';

vi.mock('../api/api', () => ({ default: { get: vi.fn() } }));

beforeEach(() => {
  vi.mocked(api.get).mockReset();
  useAuthStore.getState().cerrarSesion();
});

describe('useRevalidarSesion', () => {
  it('no consulta la API si no hay sesión guardada', () => {
    renderHook(() => useRevalidarSesion());
    expect(api.get).not.toHaveBeenCalled();
  });

  it('actualiza los datos guardados con los de la cuenta', async () => {
    useAuthStore.getState().iniciarSesion({ id: 5, nombre: 'Pepe', email: 'pepe@nodopc.com', rol: 'admin' });
    vi.mocked(api.get).mockResolvedValue({ data: { usuario: { id: 5, nombre: 'Pepe', rol: 'cliente' } } });

    renderHook(() => useRevalidarSesion());

    await waitFor(() => expect(useAuthStore.getState().usuario?.rol).toBe('cliente'));
    expect(api.get).toHaveBeenCalledWith('/auth/yo');
  });
});
