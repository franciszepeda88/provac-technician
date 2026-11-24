import { useState, useRef, useEffect, useCallback } from 'react';
import './FotoVisor.css';
import Ico from './Ico';

const ZOOM_MIN = 1;
const ZOOM_MAX = 5;
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

// Ventana flotante para ver una foto en grande sin salir de la pantalla actual.
// Soporta zoom con botones, rueda del mouse, pellizco (2 dedos) y doble toque;
// al estar ampliada, se arrastra para moverse por la foto.
// `fotos` es la lista completa y `indice` la foto que se abre; con varias fotos
// se puede pasar a la anterior/siguiente con las flechas.
export default function FotoVisor({ fotos, indice, onClose }) {
  const [actual, setActual] = useState(indice);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const punteros = useRef(new Map());
  const gesto = useRef(null);
  const ultimoToque = useRef(0);

  const total = fotos.length;
  const foto = fotos[actual];

  const reiniciar = useCallback(() => {
    setZoom(1);
    setPos({ x: 0, y: 0 });
  }, []);

  const cambiarZoom = useCallback((nuevo) => {
    const z = clamp(nuevo, ZOOM_MIN, ZOOM_MAX);
    setZoom(z);
    if (z === 1) setPos({ x: 0, y: 0 });
  }, []);

  const irA = useCallback((i) => {
    setActual((i + total) % total);
    reiniciar();
  }, [total, reiniciar]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight' && total > 1) irA(actual + 1);
      else if (e.key === 'ArrowLeft' && total > 1) irA(actual - 1);
      else if (e.key === '+' || e.key === '=') cambiarZoom(zoom + 0.5);
      else if (e.key === '-') cambiarZoom(zoom - 0.5);
    };
    window.addEventListener('keydown', onKey);
    // Evita que la pantalla de fondo se desplace mientras la ventana está abierta
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflowPrevio;
    };
  }, [actual, zoom, total, irA, cambiarZoom, onClose]);

  const distancia = () => {
    const [a, b] = Array.from(punteros.current.values());
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (punteros.current.size === 2) {
      gesto.current = { tipo: 'pellizco', dist: distancia(), zoom };
    } else if (punteros.current.size === 1) {
      gesto.current = { tipo: 'arrastre', x: e.clientX, y: e.clientY, pos, movido: false };
    }
  };

  const onPointerMove = (e) => {
    if (!punteros.current.has(e.pointerId)) return;
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesto.current;
    if (!g) return;
    if (g.tipo === 'pellizco' && punteros.current.size === 2) {
      cambiarZoom(g.zoom * (distancia() / g.dist));
    } else if (g.tipo === 'arrastre' && zoom > 1) {
      const dx = e.clientX - g.x;
      const dy = e.clientY - g.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) g.movido = true;
      setPos({ x: g.pos.x + dx, y: g.pos.y + dy });
    }
  };

  const onPointerUp = (e) => {
    const g = gesto.current;
    punteros.current.delete(e.pointerId);
    if (punteros.current.size === 1) {
      // Terminó un pellizco: el dedo que queda sigue como arrastre
      const [p] = Array.from(punteros.current.values());
      gesto.current = { tipo: 'arrastre', x: p.x, y: p.y, pos, movido: true };
      return;
    }
    if (punteros.current.size === 0 && g && g.tipo === 'arrastre' && !g.movido) {
      // Doble toque: alterna entre ajustado y ampliado
      const ahora = Date.now();
      if (ahora - ultimoToque.current < 300) {
        if (zoom > 1) reiniciar(); else setZoom(2.5);
        ultimoToque.current = 0;
      } else {
        ultimoToque.current = ahora;
      }
    }
    if (punteros.current.size === 0) gesto.current = null;
  };

  const onWheel = (e) => {
    cambiarZoom(zoom + (e.deltaY < 0 ? 0.4 : -0.4));
  };

  if (!foto) return null;

  return (
    <div className="fv-overlay" onClick={(e) => { e.stopPropagation(); onClose(); }} role="dialog" aria-modal="true" aria-label="Foto ampliada">
      <div className="fv-box" onClick={(e) => e.stopPropagation()}>
        <div className="fv-barra">
          <span className="fv-contador">Foto {actual + 1} de {total}</span>
          <div className="fv-controles">
            <button type="button" className="fv-btn" onClick={() => cambiarZoom(zoom - 0.5)} disabled={zoom <= ZOOM_MIN} aria-label="Alejar">−</button>
            <span className="fv-zoom-valor">{Math.round(zoom * 100)}%</span>
            <button type="button" className="fv-btn" onClick={() => cambiarZoom(zoom + 0.5)} disabled={zoom >= ZOOM_MAX} aria-label="Acercar">+</button>
            <button type="button" className="fv-btn fv-btn-texto" onClick={reiniciar} disabled={zoom === 1}>Ajustar</button>
            <button type="button" className="fv-btn fv-btn-cerrar" onClick={onClose} aria-label="Cerrar"><Ico nombre="x" size={18} /></button>
          </div>
        </div>

        <div
          className={`fv-lienzo${zoom > 1 ? ' fv-lienzo-zoom' : ''}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={onWheel}
        >
          <img
            src={foto}
            alt={`Foto ${actual + 1}`}
            className="fv-img"
            draggable={false}
            style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})` }}
          />
          {total > 1 && (
            <>
              <button type="button" className="fv-nav fv-nav-prev" onClick={(e) => { e.stopPropagation(); irA(actual - 1); }} onPointerDown={(e) => e.stopPropagation()} aria-label="Foto anterior">‹</button>
              <button type="button" className="fv-nav fv-nav-next" onClick={(e) => { e.stopPropagation(); irA(actual + 1); }} onPointerDown={(e) => e.stopPropagation()} aria-label="Foto siguiente">›</button>
            </>
          )}
        </div>

        <p className="fv-ayuda">Pellizca o usa +/− para acercar · doble toque para ampliar · arrastra para moverte</p>
      </div>
    </div>
  );
}
