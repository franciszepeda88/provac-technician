import { TIPO_LABELS, exportDetailToPDF, exportDetailToExcel } from '../utils/exportUtils';
import './TechDetailModal.css';

const humanize = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

export default function TechDetailModal({ levantamiento, onClose, onEditar }) {
  if (!levantamiento) return null;

  const { datos = {}, fotos = [], firma_tecnico, firma_cliente } = levantamiento;

  const entries = Object.entries(datos).filter(([, v]) => {
    if (Array.isArray(v)) return v.length > 0;
    return v !== null && v !== undefined && v !== '';
  });

  return (
    <div className="tdm-overlay" onClick={onClose}>
      <div className="tdm-box" onClick={(e) => e.stopPropagation()}>
        <div className="tdm-header">
          <div>
            <h2>{levantamiento.cliente_nombre}</h2>
            <span className="tdm-tipo">{TIPO_LABELS[levantamiento.tipo_banda] || levantamiento.tipo_banda}</span>
          </div>
          <button className="tdm-close" onClick={onClose}>✕</button>
        </div>

        <div className="tdm-meta">
          <span>Folio: <b>{levantamiento.folio || '—'}</b></span>
          <span>Estado: <b className={`tdm-badge tdm-badge-${levantamiento.estado}`}>{levantamiento.estado}</b></span>
          <span>Fecha: <b>{new Date(levantamiento.created_at).toLocaleDateString('es-HN')}</b></span>
        </div>

        <div className="tdm-actions">
          <button className="tdm-btn-primary" onClick={() => onEditar(levantamiento)}>Editar</button>
          <button className="tdm-btn-secondary" onClick={() => exportDetailToExcel(levantamiento)}>Exportar Excel</button>
          <button className="tdm-btn-secondary" onClick={() => exportDetailToPDF(levantamiento)}>Exportar PDF</button>
        </div>

        <div className="tdm-section">
          <h3>Datos del Levantamiento</h3>
          <div className="tdm-grid">
            {entries.map(([key, value]) => (
              <div key={key} className="tdm-item">
                <span className="tdm-label">{humanize(key)}</span>
                <span className="tdm-value">{Array.isArray(value) ? value.join(', ') : String(value)}</span>
              </div>
            ))}
          </div>
        </div>

        {fotos.length > 0 && (
          <div className="tdm-section">
            <h3>Fotos ({fotos.length})</h3>
            <div className="tdm-photos">
              {fotos.map((foto, idx) => (
                <a key={idx} href={foto} target="_blank" rel="noreferrer">
                  <img src={foto} alt={`Foto ${idx + 1}`} />
                </a>
              ))}
            </div>
          </div>
        )}

        {(firma_tecnico || firma_cliente) && (
          <div className="tdm-section">
            <h3>Firmas</h3>
            <div className="tdm-firmas">
              {firma_tecnico && (
                <div className="tdm-firma-card">
                  <span>Técnico</span>
                  <img src={firma_tecnico} alt="Firma técnico" />
                </div>
              )}
              {firma_cliente && (
                <div className="tdm-firma-card">
                  <span>Cliente</span>
                  <img src={firma_cliente} alt="Firma cliente" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
