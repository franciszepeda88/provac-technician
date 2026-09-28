import { useState } from 'react';
import { createPortal } from 'react-dom';
import './RadioInteriorHelp.css';

export default function RadioInteriorHelp() {
  const [abierto, setAbierto] = useState(false);

  const cerrar = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setAbierto(false);
  };

  return (
    <>
      <button
        type="button"
        className="rih-trigger"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAbierto(true); }}
        aria-label="Cómo medir el radio interior de la curva"
      >
        ?
      </button>

      {abierto && createPortal(
        <div className="rih-overlay" onClick={cerrar}>
          <div className="rih-box" onClick={(e) => e.stopPropagation()}>
            <div className="rih-header">
              <h3>Cómo medir el radio interior</h3>
              <button type="button" className="rih-close" onClick={cerrar}>✕</button>
            </div>

            <div className="rih-anim-wrap">
              <svg viewBox="0 0 300 300" className="rih-svg" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M 40 280 A 240 240 0 0 1 280 40 L 280 80 A 200 200 0 0 0 80 280 Z"
                  className="rih-belt-outline"
                />

                <line x1="60" y1="280" x2="280" y2="60" className="rih-guide-line" />
                <circle cx="60" cy="280" r="3.5" className="rih-endpoint-dot" />
                <circle cx="280" cy="60" r="3.5" className="rih-endpoint-dot" />
                <circle cx="170" cy="170" r="5" className="rih-center-dot" />

                <line x1="170" y1="170" x2="139" y2="139" className="rih-tape-line" />
                <path d="M 139 139 L 150 142 L 142 150 Z" className="rih-arrowhead" />

                <text x="150" y="30" textAnchor="middle" className="rih-label">RADIO INTERIOR</text>
              </svg>
            </div>

            <p className="rih-caption">
              Traza una línea imaginaria desde donde comienza la curva hasta donde termina.
              En el punto medio de esa línea, mide en línea recta hasta el borde interno
              de la curva — esa es la medida del Radio Interior.
            </p>

            <button type="button" className="rih-entendido" onClick={cerrar}>
              Entendido
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
