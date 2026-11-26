function Campo({ nombre, campo, valor, onCambiar }) {
  const id = `ficha-${nombre}`;

  if (campo.tipo === 'lista') {
    const elegidos = Array.isArray(valor) ? valor : [];
    return (
      <fieldset>
        <legend className="etiqueta">{campo.etiqueta}</legend>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {campo.opciones.map((opcion) => (
            <label key={opcion} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 accent-orange-700"
                checked={elegidos.includes(opcion)}
                onChange={(e) =>
                  onCambiar(
                    nombre,
                    e.target.checked ? [...elegidos, opcion] : elegidos.filter((elegido) => elegido !== opcion)
                  )
                }
              />
              {opcion}
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  return (
    <div>
      <label htmlFor={id} className="etiqueta">
        {campo.etiqueta}
      </label>
      {campo.tipo === 'si_o_no' ? (
        <select
          id={id}
          className="campo"
          value={valor === undefined ? '' : String(valor)}
          onChange={(e) => onCambiar(nombre, e.target.value === '' ? undefined : e.target.value === 'true')}
        >
          <option value="">Elegir...</option>
          <option value="true">Sí</option>
          <option value="false">No</option>
        </select>
      ) : campo.opciones ? (
        <select id={id} className="campo" value={valor ?? ''} onChange={(e) => onCambiar(nombre, e.target.value)}>
          <option value="">Elegir...</option>
          {campo.opciones.map((opcion) => (
            <option key={opcion} value={opcion}>
              {opcion}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={campo.tipo === 'numero' ? 'number' : 'text'}
          className="campo"
          min={campo.tipo === 'numero' ? 1 : undefined}
          step={campo.tipo === 'numero' ? 1 : undefined}
          maxLength={campo.tipo === 'numero' ? undefined : 30}
          value={valor ?? ''}
          onChange={(e) => onCambiar(nombre, e.target.value)}
        />
      )}
    </div>
  );
}

export function prepararFicha(campos, ficha) {
  if (!campos || Object.keys(campos).length === 0) return null;

  const valores = Object.entries(campos).map(([nombre, campo]) => {
    const valor = ficha[nombre];
    if (campo.tipo === 'numero') return [nombre, valor === '' || valor === undefined ? undefined : Number(valor)];
    if (campo.tipo === 'lista') return [nombre, valor?.length ? valor : undefined];
    return [nombre, valor === '' ? undefined : valor];
  });

  if (valores.every(([, valor]) => valor === undefined)) return null;
  return Object.fromEntries(valores);
}

export default function CamposFicha({ campos, ficha, onCambiar }) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-xl border border-neutral-200 p-4">
      <legend className="px-1 text-sm font-bold">Ficha técnica</legend>
      <p className="ayuda mt-0">Completala para que el producto aparezca en el armador de PC.</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Object.entries(campos).map(([nombre, campo]) => (
          <Campo key={nombre} nombre={nombre} campo={campo} valor={ficha[nombre]} onCambiar={onCambiar} />
        ))}
      </div>
    </fieldset>
  );
}
