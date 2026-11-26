import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import api from '../api/api';
import Login from './Login';
import OlvidePassword from './OlvidePassword';
import RestablecerPassword from './RestablecerPassword';

vi.mock('../api/api', async (original) => {
  const modulo = await original();
  return { ...modulo, default: { post: vi.fn() } };
});

function mostrar(ruta) {
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/olvide-password" element={<OlvidePassword />} />
        <Route path="/restablecer-password" element={<RestablecerPassword />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Olvidé mi contraseña', () => {
  it('se llega desde el login y muestra la respuesta de la API', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { mensaje: 'Si el email tiene una cuenta, te mandamos un enlace.' },
    });
    const usuario = userEvent.setup();
    mostrar('/login');

    await usuario.click(screen.getByRole('link', { name: '¿Te la olvidaste?' }));
    await usuario.type(screen.getByLabelText('Email de tu cuenta'), 'maria@nodopc.com');
    await usuario.click(screen.getByRole('button', { name: 'Mandarme el enlace' }));

    expect(api.post).toHaveBeenCalledWith('/auth/olvide-password', { email: 'maria@nodopc.com' });
    expect(await screen.findByRole('status')).toHaveTextContent('te mandamos un enlace');
  });
});

describe('Restablecer la contraseña', () => {
  it('avisa si las contraseñas no coinciden sin llamar a la API', async () => {
    const usuario = userEvent.setup();
    mostrar('/restablecer-password?token=abc123');

    await usuario.type(screen.getByLabelText('Contraseña nueva'), 'nueva1234');
    await usuario.type(screen.getByLabelText('Repetila'), 'nueva12345');
    await usuario.click(screen.getByRole('button', { name: 'Guardar contraseña' }));

    expect(screen.getByRole('alert')).toHaveTextContent('no coinciden');
    expect(api.post).not.toHaveBeenCalled();
  });

  it('manda el token y vuelve al login con el aviso', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { mensaje: 'Listo, ya podés ingresar con tu contraseña nueva.' } });
    const usuario = userEvent.setup();
    mostrar('/restablecer-password?token=abc123');

    await usuario.type(screen.getByLabelText('Contraseña nueva'), 'nueva1234');
    await usuario.type(screen.getByLabelText('Repetila'), 'nueva1234');
    await usuario.click(screen.getByRole('button', { name: 'Guardar contraseña' }));

    expect(api.post).toHaveBeenCalledWith('/auth/restablecer-password', { token: 'abc123', password: 'nueva1234' });
    expect(await screen.findByText('Listo, ya podés ingresar con tu contraseña nueva.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ingresar' })).toBeInTheDocument();
  });

  it('ofrece pedir otro enlace si el que se usó venció', async () => {
    vi.mocked(api.post).mockRejectedValue({
      response: { data: { error: 'El enlace venció o ya se usó. Pedí uno nuevo.' } },
    });
    const usuario = userEvent.setup();
    mostrar('/restablecer-password?token=abc123');

    await usuario.type(screen.getByLabelText('Contraseña nueva'), 'nueva1234');
    await usuario.type(screen.getByLabelText('Repetila'), 'nueva1234');
    await usuario.click(screen.getByRole('button', { name: 'Guardar contraseña' }));

    expect(await screen.findByRole('link', { name: 'Pedir un enlace nuevo' })).toHaveAttribute(
      'href',
      '/olvide-password'
    );
  });

  it('sin token no muestra el formulario', () => {
    mostrar('/restablecer-password');
    expect(screen.queryByLabelText('Contraseña nueva')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pedir un enlace nuevo' })).toBeInTheDocument();
  });
});
