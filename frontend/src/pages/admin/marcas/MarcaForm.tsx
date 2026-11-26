import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Marca } from '../../../tipos';

export interface DatosDeMarca {
  nombre: string;
  pais: string;
}

interface Props {
  inicial?: Marca | null;
  onGuardar: (datos: DatosDeMarca) => void;
  guardando: boolean;
}

export default function MarcaForm({ inicial, onGuardar, guardando }: Props) {
  const [nombre, setNombre] = useState(inicial?.nombre ?? '');
  const [pais, setPais] = useState(inicial?.pais ?? '');

  function manejarSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    onGuardar({ nombre, pais });
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
          maxLength={80}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="pais" className="etiqueta">
          País de origen (opcional)
        </label>
        <input
          id="pais"
          type="text"
          className="campo"
          maxLength={80}
          value={pais}
          onChange={(e) => setPais(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn btn-acento" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
        <Link to="/admin/marcas" className="btn btn-secundario">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
