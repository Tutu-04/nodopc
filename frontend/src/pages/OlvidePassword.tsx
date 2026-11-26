import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { obtenerMensajeError } from '../api/api';
import MensajeError from '../components/MensajeError';
import EncabezadoAcceso from '../components/EncabezadoAcceso';

export default function OlvidePassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [respuesta, setRespuesta] = useState('');

  async function manejarSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError('');
    setEnviando(true);
    try {
      const { data } = await api.post('/auth/olvide-password', { email });
      setRespuesta(data.mensaje);
    } catch (e) {
      setError(obtenerMensajeError(e));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md py-4">
      <EncabezadoAcceso
        titulo="Recuperar la contraseña"
        descripcion="Te mandamos un enlace para que elijas una contraseña nueva."
      />

      <MensajeError texto={error} />

      {respuesta ? (
        <div className="tarjeta flex flex-col gap-4 p-8">
          <p role="status" className="text-sm text-neutral-700">
            {respuesta}
          </p>
          <p className="text-sm text-neutral-500">
            Revisá también la carpeta de spam. El enlace vence en una hora y sirve una sola vez.
          </p>
          <Link to="/login" className="btn btn-secundario">
            Volver a ingresar
          </Link>
        </div>
      ) : (
        <form onSubmit={manejarSubmit} className="tarjeta flex flex-col gap-5 p-8">
          <div>
            <label htmlFor="email" className="etiqueta">
              Email de tu cuenta
            </label>
            <input
              id="email"
              type="email"
              className="campo"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-acento min-h-12 text-base" disabled={enviando}>
            {enviando ? 'Enviando...' : 'Mandarme el enlace'}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-neutral-600">
        ¿Te acordaste?{' '}
        <Link to="/login" className="font-semibold text-orange-700 hover:underline">
          Ingresar
        </Link>
      </p>
    </div>
  );
}
