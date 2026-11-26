import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AYUDA_PASSWORD, PATRON_PASSWORD } from '../../../utils/password';

export default function UsuarioForm({ inicial, onGuardar, guardando }) {
  const esEdicion = Boolean(inicial);

  const [nombre, setNombre] = useState(inicial?.nombre ?? '');
  const [email, setEmail] = useState(inicial?.email ?? '');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState(inicial?.rol ?? 'cliente');

  function manejarSubmit(evento) {
    evento.preventDefault();
    onGuardar({ nombre, email, password, rol });
  }

  return (
    <form onSubmit={manejarSubmit} className="tarjeta flex max-w-lg flex-col gap-5">
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
          {esEdicion ? 'Nueva contraseña (opcional)' : 'Contraseña'}
        </label>
        <input
          id="password"
          type="password"
          className="campo"
          required={!esEdicion}
          pattern={PATRON_PASSWORD}
          title={AYUDA_PASSWORD}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="ayuda">{esEdicion ? `Dejala vacía para no cambiarla. ${AYUDA_PASSWORD}` : AYUDA_PASSWORD}</p>
      </div>

      <div>
        <label htmlFor="rol" className="etiqueta">
          Rol
        </label>
        <select id="rol" className="campo" value={rol} onChange={(e) => setRol(e.target.value)}>
          <option value="cliente">Cliente</option>
          <option value="admin">Administrador</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn btn-acento" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
        <Link to="/admin/usuarios" className="btn btn-secundario">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
