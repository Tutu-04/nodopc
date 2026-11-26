import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api, { obtenerMensajeError } from '../api/api';
import { useAuthStore } from '../store/authStore';
import MensajeError from '../components/MensajeError';
import EncabezadoAcceso from '../components/EncabezadoAcceso';

export default function Login() {
  const location = useLocation();
  const iniciarSesion = useAuthStore((estado) => estado.iniciarSesion);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const mensaje = location.state?.mensaje;

  async function manejarSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError('');
    setEnviando(true);

    try {
      const respuesta = await api.post('/auth/login', { email, password });

      iniciarSesion(respuesta.data.usuario);
    } catch (e) {
      setError(obtenerMensajeError(e));
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md py-4">
      <EncabezadoAcceso titulo="Ingresar" descripcion="Entrá a tu cuenta para comprar y seguir tus pedidos." />

      {mensaje && (
        <p className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
          {mensaje}
        </p>
      )}
      <MensajeError texto={error} />

      <form onSubmit={manejarSubmit} className="tarjeta flex flex-col gap-5 p-8">
        <div>
          <label htmlFor="email" className="etiqueta">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="campo"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <label htmlFor="password" className="etiqueta mb-0">
              Contraseña
            </label>
            <Link to="/olvide-password" className="text-xs font-semibold text-orange-700 hover:underline">
              ¿Te la olvidaste?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            className="campo"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-acento min-h-12 text-base" disabled={enviando}>
          {enviando ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-600">
        ¿No tenés cuenta?{' '}
        <Link to="/registro" className="font-semibold text-orange-700 hover:underline">
          Crear cuenta
        </Link>
      </p>
    </div>
  );
}
