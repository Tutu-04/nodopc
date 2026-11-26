import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Categoria } from '../../../tipos';

export interface DatosDeCategoria {
  nombre: string;
  descripcion: string;
}

interface Props {
  inicial?: Categoria | null;
  onGuardar: (datos: DatosDeCategoria) => void;
  guardando: boolean;
}

export default function CategoriaForm({ inicial, onGuardar, guardando }: Props) {
  const [nombre, setNombre] = useState(inicial?.nombre ?? '');
  const [descripcion, setDescripcion] = useState(inicial?.descripcion ?? '');

  function manejarSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    onGuardar({ nombre, descripcion });
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
        <label htmlFor="descripcion" className="etiqueta">
          Descripción (opcional)
        </label>
        <input
          id="descripcion"
          type="text"
          className="campo"
          maxLength={255}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn btn-acento" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
        <Link to="/admin/categorias" className="btn btn-secundario">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
