import { useState } from 'react';
import { createPortal } from 'react-dom';
import './CentroCentroHelp.css';

export default function CentroCentroHelp() {
  const [abierto, setAbierto] = useState(false);

  const cerrar = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setAbierto(false);
  };

  return (
    <>
      <button
        type="button"
        className="cch-trigger"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAbierto(true); }}
        aria-label="Cómo medir la longitud centro a centro"
      >
        ?
      </button>

      {abierto && createPortal(
        <div className="cch-overlay" onClick={cerrar}>
          <div className="cch-box" onClick={(e) => e.stopPropagation()}>
            <div className="cch-header">
              <h3>Cómo medir la longitud centro a centro</h3>
              <button type="button" className="cch-close" onClick={cerrar}>✕</button>
            </div>

            <div className="cch-anim-wrap">
              <svg viewBox="0 0 300 170" className="cch-svg" xmlns="http://www.w3.org/2000/svg">
                <path d="M 55 73 A 22 22 0 0 0 55 117" className="cch-belt-line" />
                <path d="M 245 73 A 22 22 0 0 1 245 117" className="cch-belt-line" />
                <line x1="55" y1="73" x2="245" y2="73" className="cch-belt-line" />
                <line x1="55" y1="117" x2="245" y2="117" className="cch-belt-line" />

                <circle cx="55" cy="95" r="22" className="cch-roller" />
                <circle cx="245" cy="95" r="22" className="cch-roller" />

                <circle cx="55" cy="95" r="3.5" className="cch-center-dot" />
                <circle cx="245" cy="95" r="3.5" className="cch-center-dot" />

                <line x1="55" y1="95" x2="245" y2="95" className="cch-tape-line" />
                <circle cx="55" cy="95" r="5" className="cch-tape-marker" />

                <path d="M55 95 L65 89 L65 101 Z" className="cch-arrowhead" />
                <path d="M245 95 L235 89 L235 101 Z" className="cch-arrowhead" />

                <text x="150" y="145" textAnchor="middle" className="cch-label">LONGITUD CENTRO A CENTRO</text>
              </svg>
            </div>

            <p className="cch-caption">
              Mide desde el centro del eje de un extremo (polea o rodillo motriz) hasta el
              centro del eje del otro extremo, con el transportador visto de lado.
            </p>

            <button type="button" className="cch-entendido" onClick={cerrar}>
              Entendido
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
