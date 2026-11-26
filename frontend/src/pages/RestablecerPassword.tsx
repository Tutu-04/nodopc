import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api, { obtenerMensajeError } from '../api/api';
import { AYUDA_PASSWORD, PATRON_PASSWORD } from '../utils/password';
import MensajeError from '../components/MensajeError';
import EncabezadoAcceso from '../components/EncabezadoAcceso';

export default function RestablecerPassword() {
  const navigate = useNavigate();
  const [parametros] = useSearchParams();
  const token = parametros.get('token');

  const [password, setPassword] = useState('');
  const [repetida, setRepetida] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function manejarSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError('');

    if (password !== repetida) {
      setError('Las dos contraseñas no coinciden');
      return;
    }

    setEnviando(true);
    try {
      const { data } = await api.post('/auth/restablecer-password', { token, password });
      navigate('/login', { replace: true, state: { mensaje: data.mensaje } });
    } catch (e) {
      setError(obtenerMensajeError(e));
      setEnviando(false);
    }
  }

  if (!token) {
    return (
      <div className="mx-auto w-full max-w-md py-4">
        <EncabezadoAcceso titulo="Enlace incompleto" descripcion="Abrí el enlace completo que te llegó por correo." />
        <Link to="/olvide-password" className="btn btn-acento w-full">
          Pedir un enlace nuevo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md py-4">
      <EncabezadoAcceso titulo="Contraseña nueva" descripcion="Elegí la contraseña que vas a usar para ingresar." />

      <MensajeError texto={error} />
      {error && /venció|no es válido/.test(error) && (
        <Link to="/olvide-password" className="btn btn-secundario mb-5 w-full">
          Pedir un enlace nuevo
        </Link>
      )}

      <form onSubmit={manejarSubmit} className="tarjeta flex flex-col gap-5 p-8">
        <div>
          <label htmlFor="password" className="etiqueta">
            Contraseña nueva
          </label>
          <input
            id="password"
            type="password"
            className="campo"
            autoComplete="new-password"
            required
            pattern={PATRON_PASSWORD}
            title={AYUDA_PASSWORD}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="ayuda">{AYUDA_PASSWORD}</p>
        </div>

        <div>
          <label htmlFor="repetida" className="etiqueta">
            Repetila
          </label>
          <input
            id="repetida"
            type="password"
            className="campo"
            autoComplete="new-password"
            required
            value={repetida}
            onChange={(e) => setRepetida(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-acento min-h-12 text-base" disabled={enviando}>
          {enviando ? 'Guardando...' : 'Guardar contraseña'}
        </button>
      </form>
    </div>
  );
}
