import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { obtenerMensajeError } from '../api/api';
import MensajeError from '../components/MensajeError';
import { AYUDA_PASSWORD, PATRON_PASSWORD } from '../utils/password';

export default function Registro() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repetir, setRepetir] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function manejarSubmit(evento) {
    evento.preventDefault();
    setError('');

    if (password !== repetir) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setEnviando(true);
    try {
      await api.post('/auth/registro', { nombre, email, password });

      navigate('/login', { state: { mensaje: 'Cuenta creada. Ya podés ingresar.' } });
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
        <h1 className="titulo">Crear cuenta</h1>
        <p className="text-sm text-neutral-500">Registrate para comprar y seguir tus pedidos.</p>
      </div>

      <MensajeError texto={error} />

      <form onSubmit={manejarSubmit} className="tarjeta flex flex-col gap-5 p-8">
        <div>
          <label htmlFor="nombre" className="etiqueta">
            Nombre
          </label>
          <input
            id="nombre"
            type="text"
            className="campo"
            required
            minLength={2}
            maxLength={100}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

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
            pattern={PATRON_PASSWORD}
            title={AYUDA_PASSWORD}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="ayuda">{AYUDA_PASSWORD}</p>
        </div>

        <div>
          <label htmlFor="repetir" className="etiqueta">
            Repetir contraseña
          </label>
          <input
            id="repetir"
            type="password"
            className="campo"
            required
            value={repetir}
            onChange={(e) => setRepetir(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-acento min-h-12 text-base" disabled={enviando}>
          {enviando ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-600">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="font-semibold text-orange-700 hover:underline">
          Ingresar
        </Link>
      </p>
    </div>
  );
}
