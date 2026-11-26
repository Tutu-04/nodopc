import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useCuentaRegresiva } from './useCuentaRegresiva';

describe('useCuentaRegresiva', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('descuenta un segundo por vez y se detiene en cero', () => {
    const { result } = renderHook(() => useCuentaRegresiva(3));
    expect(result.current).toBe(3);

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBe(2);

    act(() => vi.advanceTimersByTime(5000));
    expect(result.current).toBe(0);
  });

  it('no cuenta nada si el pedido no tiene plazo', () => {
    const { result } = renderHook(() => useCuentaRegresiva(null));

    act(() => vi.advanceTimersByTime(5000));
    expect(result.current).toBeNull();
  });
});
