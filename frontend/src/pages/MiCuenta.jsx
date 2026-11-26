import { useState } from 'react';
import api, { obtenerMensajeError } from '../api/api';
import { useAuthStore } from '../store/authStore';
import MensajeError from '../components/MensajeError';
import { AYUDA_PASSWORD, PATRON_PASSWORD } from '../utils/password';

function MensajeExito({ texto }) {
  if (!texto) return null;
  return (
    <p role="status" className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
      {texto}
    </p>
  );
}

function DatosPersonales() {
  const usuario = useAuthStore((estado) => estado.usuario);
  const iniciarSesion = useAuthStore((estado) => estado.iniciarSesion);

  const [nombre, setNombre] = useState(usuario.nombre);
  const [email, setEmail] = useState(usuario.email);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function guardar(evento) {
    evento.preventDefault();
    setError('');
    setExito('');
    setGuardando(true);
    try {
      const respuesta = await api.put('/cuenta', { nombre, email });
      iniciarSesion(respuesta.data.usuario);
      setExito('Datos actualizados.');
    } catch (e) {
      setError(obtenerMensajeError(e));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={guardar} className="tarjeta flex flex-col gap-5">
      <h2 className="text-lg font-bold tracking-tight">Datos personales</h2>
      <MensajeError texto={error} />
      <MensajeExito texto={exito} />

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
          autoComplete="name"
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
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <button type="submit" className="btn btn-acento self-start" disabled={guardando}>
        {guardando ? 'Guardando...' : 'Guardar datos'}
      </button>
    </form>
  );
}

function CambiarPassword() {
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [repetir, setRepetir] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function guardar(evento) {
    evento.preventDefault();
    setError('');
    setExito('');

    if (nueva !== repetir) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }

    setGuardando(true);
    try {
      await api.put('/cuenta/password', { actual, nueva });
      setActual('');
      setNueva('');
      setRepetir('');
      setExito('Contraseña actualizada.');
    } catch (e) {
      setError(obtenerMensajeError(e));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={guardar} className="tarjeta flex flex-col gap-5">
      <h2 className="text-lg font-bold tracking-tight">Cambiar contraseña</h2>
      <MensajeError texto={error} />
      <MensajeExito texto={exito} />

      <div>
        <label htmlFor="password-actual" className="etiqueta">
          Contraseña actual
        </label>
        <input
          id="password-actual"
          type="password"
          className="campo"
          required
          autoComplete="current-password"
          value={actual}
          onChange={(e) => setActual(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="password-nueva" className="etiqueta">
          Contraseña nueva
        </label>
        <input
          id="password-nueva"
          type="password"
          className="campo"
          required
          pattern={PATRON_PASSWORD}
          title={AYUDA_PASSWORD}
          autoComplete="new-password"
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
        />
        <p className="ayuda">{AYUDA_PASSWORD}</p>
      </div>

      <div>
        <label htmlFor="password-repetir" className="etiqueta">
          Repetir contraseña nueva
        </label>
        <input
          id="password-repetir"
          type="password"
          className="campo"
          required
          autoComplete="new-password"
          value={repetir}
          onChange={(e) => setRepetir(e.target.value)}
        />
      </div>

      <button type="submit" className="btn btn-acento self-start" disabled={guardando}>
        {guardando ? 'Guardando...' : 'Cambiar contraseña'}
      </button>
    </form>
  );
}

export default function MiCuenta() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <p className="antetitulo mb-1">Cuenta</p>
        <h1 className="titulo">Mi cuenta</h1>
      </div>
      <DatosPersonales />
      <CambiarPassword />
    </div>
  );
}
