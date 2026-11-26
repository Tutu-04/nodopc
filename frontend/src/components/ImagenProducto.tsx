import { useState } from 'react';
import IconoCategoria from './IconoCategoria';
import { urlDeImagen } from '../api/api';

interface Props {
  producto: { nombre: string; imagen_url: string | null; categoria?: string };
  className?: string;
  tamanoIcono?: string;
}

export default function ImagenProducto({ producto, className = '', tamanoIcono = 'size-14' }: Props) {
  const [urlFallida, setUrlFallida] = useState<string | null>(null);
  const mostrarImagen = producto.imagen_url && producto.imagen_url !== urlFallida;

  if (mostrarImagen) {
    return (
      <img
        src={urlDeImagen(producto.imagen_url) ?? undefined}
        alt={producto.nombre}
        className={`w-full bg-white object-contain ${className}`}
        onError={() => setUrlFallida(producto.imagen_url)}
      />
    );
  }

  return (
    <div className={`flex w-full items-center justify-center bg-neutral-100 text-neutral-300 ${className}`}>
      <IconoCategoria categoria={producto.categoria} className={tamanoIcono} grosor={1.2} />
    </div>
  );
}
