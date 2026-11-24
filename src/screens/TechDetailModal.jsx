import { useState } from 'react';
import { TIPO_LABELS, exportDetailToPDF, exportDetailToExcel, armarSeccionesDetalle } from '../utils/exportUtils';
import FotoVisor from '../components/FotoVisor';
import './TechDetailModal.css';
import Ico from '../components/Ico';

// Detalle de un levantamiento. Se organiza igual que el PDF exportable:
// encabezado con los datos generales, una tabla en recuadro por cada sección
// (Campo / Valor), y al final firmas y fotos.
export default function TechDetailModal({ levantamiento, onClose, onEditar }) {
  const [visorFoto, setVisorFoto] = useState(null); // indice de la foto abierta en el visor

  if (!levantamiento) return null;

  const { fotos = [], firma_tecnico, firma_cliente } = levantamiento;
  const secciones = armarSeccionesDetalle(levantamiento);
  const folio = levantamiento.folio && levantamiento.folio !== 'AUTO' ? levantamiento.folio : '—';

  return (
    <div className="tdm-overlay" onClick={onClose}>
      <div className="tdm-box" role="dialog" aria-modal="true" aria-label="Detalle del levantamiento" onClick={(e) => e.stopPropagation()}>
        <div className="tdm-header">
          <div>
            <h2>PROVAC · Levantamiento Técnico</h2>
            <span className="tdm-tipo">{TIPO_LABELS[levantamiento.tipo_banda] || levantamiento.tipo_banda}</span>
          </div>
          <button className="tdm-close" onClick={onClose} aria-label="Cerrar"><Ico nombre="x" size={18} /></button>
        </div>

        <div className="tdm-actions">
          {onEditar && (
            <button className="tdm-btn-primary" onClick={() => onEditar(levantamiento)}>Editar</button>
          )}
          <button className="tdm-btn-secondary" onClick={() => exportDetailToExcel(levantamiento)}>Exportar Excel</button>
          <button className="tdm-btn-secondary" onClick={() => exportDetailToPDF(levantamiento)}>Exportar PDF</button>
        </div>

        {levantamiento._esPendienteLocal && (
          <p className="tdm-hint-pendiente">
            Este levantamiento está guardado en este teléfono y todavía no se ha enviado. Se enviará solo cuando haya conexión, o puedes usar "Enviar ahora" en la lista.
          </p>
        )}

        <section className="tdm-card">
          <h3 className="tdm-card-titulo">Datos Generales</h3>
          <table className="tdm-tabla">
            <tbody>
              <tr><th>Folio</th><td>{folio}</td></tr>
              <tr><th>Cliente</th><td>{levantamiento.cliente_nombre || '—'}</td></tr>
              <tr><th>Ubicación</th><td>{levantamiento.ubicacion || '—'}</td></tr>
              <tr>
                <th>Estado</th>
                <td>
                  {levantamiento._esPendienteLocal ? (
                    <b className="badge b-pendiente">Pendiente de enviar</b>
                  ) : (
                    <b className={`badge b-${levantamiento.estado || 'completo'}`}>{levantamiento.estado === 'borrador' ? 'Borrador' : 'Enviado'}</b>
                  )}
                </td>
              </tr>
              <tr><th>Fecha</th><td>{levantamiento.created_at ? new Date(levantamiento.created_at).toLocaleDateString('es-HN') : '—'}</td></tr>
            </tbody>
          </table>
        </section>

        {secciones.map(({ title, rows }) => (
          <section key={title} className="tdm-card">
            <h3 className="tdm-card-titulo">{title}</h3>
            <table className="tdm-tabla">
              <tbody>
                {rows.map(([etiqueta, valor]) => (
                  <tr key={etiqueta}>
                    <th>{etiqueta}</th>
                    <td>{valor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}

        {(firma_tecnico || firma_cliente) && (
          <section className="tdm-card">
            <h3 className="tdm-card-titulo">Firmas</h3>
            <div className="tdm-firmas">
              {firma_tecnico && (
                <div className="tdm-firma-card">
                  <span>Firma Técnico</span>
                  <img src={firma_tecnico} alt="Firma técnico" />
                </div>
              )}
              {firma_cliente && (
                <div className="tdm-firma-card">
                  <span>Firma Cliente</span>
                  <img src={firma_cliente} alt="Firma cliente" />
                </div>
              )}
            </div>
          </section>
        )}

        {fotos.length > 0 && (
          <section className="tdm-card">
            <h3 className="tdm-card-titulo">Fotos ({fotos.length})</h3>
            <div className="tdm-photos">
              {fotos.map((foto, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="tdm-photo-btn"
                  onClick={() => setVisorFoto(idx)}
                  aria-label={`Ver foto ${idx + 1} en grande`}
                >
                  <img src={foto} alt={`Foto ${idx + 1}`} />
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      {visorFoto !== null && (
        <FotoVisor fotos={fotos} indice={visorFoto} onClose={() => setVisorFoto(null)} />
      )}
    </div>
  );
}
