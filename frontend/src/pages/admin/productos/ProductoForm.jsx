import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { obtenerMensajeError } from '../../../api/api';
import MensajeError from '../../../components/MensajeError';

export default function ProductoForm({ inicial, onGuardar, guardando }) {
  const [nombre, setNombre] = useState(inicial?.nombre ?? '');
  const [descripcion, setDescripcion] = useState(inicial?.descripcion ?? '');
  const [precio, setPrecio] = useState(inicial?.precio ?? '');
  const [stock, setStock] = useState(inicial?.stock ?? '');
  const [imagenUrl, setImagenUrl] = useState(inicial?.imagen_url ?? '');
  const [categoriaId, setCategoriaId] = useState(inicial?.categoria_id ?? '');
  const [marcaId, setMarcaId] = useState(inicial?.marca_id ?? '');

  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [errorListas, setErrorListas] = useState('');

  useEffect(() => {
    async function cargarListas() {
      try {
        const respuestaCategorias = await api.get('/categorias');
        const respuestaMarcas = await api.get('/marcas');
        setCategorias(respuestaCategorias.data);
        setMarcas(respuestaMarcas.data);
      } catch (e) {
        setErrorListas(obtenerMensajeError(e));
      }
    }

    cargarListas();
  }, []);

  function manejarSubmit(evento) {
    evento.preventDefault();
    onGuardar({
      nombre,
      descripcion,
      precio,
      stock,
      imagen_url: imagenUrl,
      categoria_id: categoriaId,
      marca_id: marcaId,
    });
  }

  return (
    <form onSubmit={manejarSubmit} className="tarjeta flex max-w-2xl flex-col gap-5">
      <MensajeError texto={errorListas} />

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
          maxLength={150}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="descripcion" className="etiqueta">
          Descripción (opcional)
        </label>
        <textarea
          id="descripcion"
          className="campo"
          rows={3}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="precio" className="etiqueta">
            Precio ($)
          </label>
          <input
            id="precio"
            type="number"
            className="campo"
            required
            min="0.01"
            step="0.01"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="stock" className="etiqueta">
            Stock (unidades)
          </label>
          <input
            id="stock"
            type="number"
            className="campo"
            required
            min="0"
            step="1"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="categoria" className="etiqueta">
            Categoría
          </label>
          <select
            id="categoria"
            className="campo"
            required
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
          >
            <option value="">Elegir...</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="marca" className="etiqueta">
            Marca
          </label>
          <select id="marca" className="campo" required value={marcaId} onChange={(e) => setMarcaId(e.target.value)}>
            <option value="">Elegir...</option>
            {marcas.map((marca) => (
              <option key={marca.id} value={marca.id}>
                {marca.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="imagen" className="etiqueta">
          Dirección de la imagen (opcional)
        </label>
        <input
          id="imagen"
          type="text"
          className="campo"
          placeholder="https://... o /productos/1.jpg"
          maxLength={500}
          value={imagenUrl}
          onChange={(e) => setImagenUrl(e.target.value)}
        />
        <p className="ayuda">Si queda vacío, se muestra el ícono de la categoría en lugar de la foto.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn btn-acento" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
        <Link to="/admin/productos" className="btn btn-secundario">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
