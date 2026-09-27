import { useState } from 'react';
import { createPortal } from 'react-dom';
import './CircuitoCerradoHelp.css';

export default function CircuitoCerradoHelp() {
  const [abierto, setAbierto] = useState(false);

  const cerrar = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setAbierto(false);
  };

  return (
    <>
      <button
        type="button"
        className="lcc-trigger"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAbierto(true); }}
        aria-label="Cómo medir el largo total de circuito cerrado"
      >
        ?
      </button>

      {abierto && createPortal(
        <div className="lcc-overlay" onClick={cerrar}>
          <div className="lcc-box" onClick={(e) => e.stopPropagation()}>
            <div className="lcc-header">
              <h3>Cómo medir el largo total (circuito cerrado)</h3>
              <button type="button" className="lcc-close" onClick={cerrar}>✕</button>
            </div>

            <div className="lcc-anim-wrap">
              <svg viewBox="0 0 300 170" className="lcc-svg" xmlns="http://www.w3.org/2000/svg">
                <circle cx="55" cy="95" r="22" className="lcc-roller" />
                <circle cx="245" cy="95" r="22" className="lcc-roller" />

                <path
                  d="M 55 73 L 245 73 A 22 22 0 0 1 245 117 L 55 117 A 22 22 0 0 1 55 73 Z"
                  className="lcc-belt-outline"
                />

                <path
                  d="M 55 73 L 245 73 A 22 22 0 0 1 245 117 L 55 117 A 22 22 0 0 1 55 73 Z"
                  pathLength="500"
                  className="lcc-tape-loop"
                />

                <text x="150" y="150" textAnchor="middle" className="lcc-label">LARGO TOTAL CIRCUITO CERRADO</text>
              </svg>
            </div>

            <p className="lcc-caption">
              Mide todo el contorno de la banda: la parte superior, la vuelta en un
              extremo, la parte inferior y la vuelta en el otro extremo, como un
              circuito cerrado completo.
            </p>

            <button type="button" className="lcc-entendido" onClick={cerrar}>
              Entendido
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
