// Íconos de línea del sistema de diseño PROVAC (cuadrícula de 24 px, trazo de 1.75).
// Toman el color del texto que los rodea (currentColor).
const RUTAS = {
  x: <path d="M18 6 6 18M6 6l12 12" />,
  check: <path d="M20 6 9 17l-5-5" />,
  atras: <path d="m15 18-6-6 6-6" />,
  siguiente: <path d="m9 18 6-6-6-6" />,
  externo: (
    <>
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </>
  ),
  mas: <path d="M5 12h14M12 5v14" />,
  historial: (
    <>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8M16 17H8M10 9H8" />
    </>
  ),
  transporte: (
    <>
      <circle cx="6" cy="14" r="3" /><circle cx="18" cy="14" r="3" /><path d="M6 11h12M6 17h12" /><path d="M9 6l3-2 3 2" />
    </>
  ),
  transmision: (
    <>
      <circle cx="7" cy="8" r="4" /><circle cx="17" cy="16" r="3" /><path d="M9.8 11l4.6 3.2M10.6 5.2L19 13.2" /><circle cx="7" cy="8" r="1" />
    </>
  ),
  modular: (
    <>
      <rect x="3" y="4" width="8" height="7" rx="1.5" /><rect x="13" y="4" width="8" height="7" rx="1.5" /><rect x="3" y="13" width="8" height="7" rx="1.5" /><rect x="13" y="13" width="8" height="7" rx="1.5" />
    </>
  ),
  thermodrive: (
    <>
      <circle cx="12" cy="12" r="3.2" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" />
    </>
  ),
  bandeja: (
    <>
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </>
  ),
};

export default function Ico({ nombre, size = 20 }) {
  return (
    <svg className="ico" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {RUTAS[nombre] || RUTAS.x}
    </svg>
  );
}
