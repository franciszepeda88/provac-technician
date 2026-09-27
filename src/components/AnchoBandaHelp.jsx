import { useState } from 'react';
import './AnchoBandaHelp.css';

export default function AnchoBandaHelp() {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button
        type="button"
        className="abh-trigger"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAbierto(true); }}
        aria-label="Cómo medir el ancho de banda"
      >
        ?
      </button>

      {abierto && (
        <div className="abh-overlay" onClick={() => setAbierto(false)}>
          <div className="abh-box" onClick={(e) => e.stopPropagation()}>
            <div className="abh-header">
              <h3>Cómo medir el ancho de banda</h3>
              <button type="button" className="abh-close" onClick={() => setAbierto(false)}>✕</button>
            </div>

            <div className="abh-anim-wrap">
              <svg viewBox="0 0 300 170" className="abh-svg" xmlns="http://www.w3.org/2000/svg">
                <circle cx="30" cy="110" r="16" className="abh-roller" />
                <circle cx="270" cy="110" r="16" className="abh-roller" />
                <rect x="30" y="90" width="240" height="40" rx="6" className="abh-belt" />

                <line x1="30" y1="60" x2="30" y2="90" className="abh-guide" />
                <line x1="270" y1="60" x2="270" y2="90" className="abh-guide" />

                <path d="M30 50 L38 44 L38 56 Z" className="abh-arrowhead" />
                <path d="M270 50 L262 44 L262 56 Z" className="abh-arrowhead" />

                <line x1="30" y1="50" x2="270" y2="50" className="abh-tape-line" />
                <circle cx="30" cy="50" r="5" className="abh-tape-marker" />

                <text x="150" y="30" textAnchor="middle" className="abh-label">ANCHO</text>
              </svg>
            </div>

            <p className="abh-caption">
              Mide de borde a borde de la banda, tomando el extremo más ancho e incluyendo
              cualquier saliente, pestaña o guía lateral si la tiene.
            </p>

            <button type="button" className="abh-entendido" onClick={() => setAbierto(false)}>
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
