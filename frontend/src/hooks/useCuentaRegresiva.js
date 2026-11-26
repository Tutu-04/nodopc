import { useEffect, useState } from 'react';

export function useCuentaRegresiva(segundosIniciales) {
  const [fin] = useState(() => (typeof segundosIniciales === 'number' ? Date.now() + segundosIniciales * 1000 : null));
  const [restantes, setRestantes] = useState(segundosIniciales ?? null);

  useEffect(() => {
    if (fin === null) return undefined;

    const intervalo = setInterval(() => {
      const quedan = Math.max(Math.ceil((fin - Date.now()) / 1000), 0);
      setRestantes(quedan);
      if (quedan === 0) clearInterval(intervalo);
    }, 1000);

    return () => clearInterval(intervalo);
  }, [fin]);

  return restantes;
}
