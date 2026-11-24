import { useRef, useEffect, useState } from 'react';
import './SignaturePad.css';
import Ico from './Ico';

// Colores del lienzo: salen de las variables del sistema de diseño (con respaldo si aún no cargan)
const color = (nombre, respaldo) => getComputedStyle(document.documentElement).getPropertyValue(nombre).trim() || respaldo;

export default function SignaturePad({ label, initialValue, onSignatureChange }) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const [locked, setLocked] = useState(Boolean(initialValue));

  const pintarBlanco = (ctx, canvas) => {
    ctx.fillStyle = color('--color-superficie', 'white');
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = color('--color-texto', 'black');
    pintarBlanco(ctx, canvas);

    if (initialValue) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = initialValue;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches[0]) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleStart = (e) => {
    if (locked) return;
    if (e.touches) e.preventDefault();
    isDrawing.current = true;
    const canvas = canvasRef.current;
    const { x, y } = getPos(e, canvas);
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleMove = (e) => {
    if (locked || !isDrawing.current) return;
    if (e.touches) e.preventDefault();
    const canvas = canvasRef.current;
    const { x, y } = getPos(e, canvas);
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleEnd = (e) => {
    if (locked) return;
    if (e && e.touches) e.preventDefault();
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const canvas = canvasRef.current;
    const signature = canvas.toDataURL('image/png');
    onSignatureChange(signature);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    pintarBlanco(ctx, canvas);
    onSignatureChange('');
  };

  const handleFirmarDeNuevo = () => {
    setLocked(false);
    handleClear();
  };

  return (
    <div className="signature-pad-container">
      <label>{label}</label>

      {locked && <div className="sp-locked-badge"><Ico nombre="check" size={16} />Firma existente guardada</div>}

      <canvas
        ref={canvasRef}
        width={300}
        height={150}
        className={`signature-canvas${locked ? ' signature-canvas-locked' : ''}`}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      />

      {locked ? (
        <button type="button" className="clear-signature-btn" onClick={handleFirmarDeNuevo}>
          Firmar de Nuevo
        </button>
      ) : (
        <button type="button" className="clear-signature-btn" onClick={handleClear}>
          Limpiar Firma
        </button>
      )}
    </div>
  );
}
