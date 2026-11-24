import { useEffect } from 'react';

// Quién entró: se muestra en la Barra PROVAC (script del Hub), arriba a la derecha, igual que en las demás apps.
// Este componente no dibuja nada por su cuenta. Si el script de la barra aún no cargó, espera a que cargue.
// Cerrar sesión se hace solo en el Hub.
export default function BarraSesion({ usuario }) {
  const nombre = usuario?.nombre;
  const email = usuario?.email;
  useEffect(() => {
    if (!nombre && !email) return undefined;
    const poner = () => window.provacBarra?.set({ usuario: { nombre, email } });
    if (window.provacBarra) poner();
    else window.addEventListener('load', poner, { once: true });
    return () => window.removeEventListener('load', poner);
  }, [nombre, email]);
  return null;
}
