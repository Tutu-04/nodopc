import { useState } from 'react';

export default function BotonEliminar({ onConfirmar, texto = 'Eliminar', textoConfirmar = 'Sí, eliminar' }) {
  const [confirmando, setConfirmando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function confirmar() {
    setEnviando(true);
    await onConfirmar();
    setEnviando(false);
    setConfirmando(false);
  }

  if (!confirmando) {
    return (
      <button type="button" className="btn btn-peligro btn-chico" onClick={() => setConfirmando(true)}>
        {texto}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="whitespace-nowrap text-xs font-semibold text-red-700">¿Seguro?</span>
      <button
        type="button"
        className="btn btn-chico border-red-700 bg-red-700 hover:bg-red-800"
        disabled={enviando}
        onClick={confirmar}
      >
        {enviando ? '...' : textoConfirmar}
      </button>
      <button
        type="button"
        className="btn btn-secundario btn-chico"
        disabled={enviando}
        onClick={() => setConfirmando(false)}
      >
        No
      </button>
    </div>
  );
}
