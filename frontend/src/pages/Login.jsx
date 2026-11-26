import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api, { obtenerMensajeError } from '../api/api';
import { useAuthStore } from '../store/authStore';
import MensajeError from '../components/MensajeError';

export default function Login() {
  const location = useLocation();
  const iniciarSesion = useAuthStore((estado) => estado.iniciarSesion);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const mensaje = location.state?.mensaje;

  async function manejarSubmit(evento) {
    evento.preventDefault();
    setError('');
    setEnviando(true);

    try {
      const respuesta = await api.post('/auth/login', { email, password });

      iniciarSesion(respuesta.data.usuario, respuesta.data.token);
    } catch (e) {
      setError(obtenerMensajeError(e));
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md py-4">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <span className="flex size-12 items-center justify-center rounded-xl bg-neutral-950 text-xl font-black text-white">
          N
        </span>
        <h1 className="titulo">Ingresar</h1>
        <p className="text-sm text-neutral-500">Entrá a tu cuenta para comprar y seguir tus pedidos.</p>
      </div>

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
          <label htmlFor="password" className="etiqueta">
            Contraseña
          </label>
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
