import { useState, useEffect, useMemo } from 'react';
import { API_URL } from '../config';
import TechDetailModal from './TechDetailModal';
import { TIPO_LABELS, exportListToExcel } from '../utils/exportUtils';
import './Historial.css';

export default function Historial({ usuario, onBack, onLogout, onEditar, onIrInicio }) {
  const [levantamientos, setLevantamientos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [seleccionado, setSeleccionado] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(null); // id del levantamiento cuyo detalle se está pidiendo
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargar(1);
  }, []);

  const cargar = async (intento = 1) => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/levantamientos`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Error al cargar');
      const data = await response.json();
      setLevantamientos(Array.isArray(data.levantamientos) ? data.levantamientos : []);
      setLoading(false);
    } catch (err) {
      // En datos móviles a veces la primera petición falla al reanudar la app;
      // reintenta un par de veces antes de mostrar el error.
      if (intento < 3) {
        setTimeout(() => cargar(intento + 1), 800 * intento);
        return;
      }
      setError('No se pudieron cargar tus levantamientos');
      setLoading(false);
    }
  };

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return levantamientos.filter(lev => {
      if (filtroTipo !== 'todos' && lev.tipo_banda !== filtroTipo) return false;
      if (filtroEstado !== 'todos' && lev.estado !== filtroEstado) return false;
      if (!q) return true;
      const enCampos = [lev.cliente_nombre, lev.folio, lev.ubicacion]
        .filter(Boolean)
        .some(v => v.toLowerCase().includes(q));
      const enDatos = lev.datos ? JSON.stringify(lev.datos).toLowerCase().includes(q) : false;
      return enCampos || enDatos;
    });
  }, [busqueda, filtroTipo, filtroEstado, levantamientos]);

  const formatearFecha = (fecha) => new Date(fecha).toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' });

  // La lista no trae fotos ni firmas (para que cargue rápido); se piden completas
  // recién cuando se abre el detalle de un levantamiento en particular.
  const abrirDetalle = async (lev) => {
    setCargandoDetalle(lev.id);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/levantamientos/${lev.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Error al cargar el detalle');
      const data = await response.json();
      setSeleccionado(data.levantamiento);
    } catch (err) {
      setSeleccionado(lev); // como respaldo, muestra al menos lo que ya se tenía en la lista
    } finally {
      setCargandoDetalle(null);
    }
  };

  return (
    <div className="hist-container">
      <nav className="hist-navbar">
        <img
          src="/logo-provac.png"
          alt="PROVAC"
          className="hist-nav-logo"
          onClick={() => (onIrInicio ? onIrInicio() : onBack())}
          role="button"
          tabIndex={0}
        />
        <button className="hist-back" onClick={onBack}>Volver</button>
        <span className="hist-user">{usuario.nombre}</span>
        <button className="hist-logout" onClick={onLogout}>Salir</button>
      </nav>

      <main className="hist-main">
        <div className="hist-title-row">
          <h1>Mis Levantamientos</h1>
          {filtrados.length > 0 && (
            <button className="hist-export" onClick={() => exportListToExcel(filtrados, 'mis_levantamientos.xlsx')}>
              Exportar Excel
            </button>
          )}
        </div>

        <div className="hist-filtros">
          <input
            type="text"
            placeholder="Buscar cliente, folio o palabra clave..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
            <option value="todos">Todos los tipos</option>
            {Object.entries(TIPO_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="todos">Todos los estados</option>
            <option value="completo">Completo</option>
            <option value="borrador">Borrador</option>
          </select>
        </div>

        {loading && <p className="hist-hint">Cargando...</p>}
        {error && (
          <div className="hist-error-box">
            <p className="hist-error">{error}</p>
            <button className="hist-retry" onClick={() => { setLoading(true); cargar(1); }}>Reintentar</button>
          </div>
        )}

        {!loading && !error && filtrados.length === 0 && (
          <p className="hist-hint">No hay levantamientos que coincidan.</p>
        )}

        <div className="hist-list">
          {filtrados.map((lev) => (
            <button key={lev.id} className="hist-card" onClick={() => abrirDetalle(lev)} disabled={cargandoDetalle === lev.id}>
              <div className="hist-card-top">
                <span className="hist-cliente">{lev.cliente_nombre}</span>
                <span className={`hist-badge hist-badge-${lev.estado}`}>{lev.estado || 'completo'}</span>
              </div>
              <div className="hist-card-meta">
                <span>{TIPO_LABELS[lev.tipo_banda] || lev.tipo_banda}</span>
                <span>·</span>
                <span>{formatearFecha(lev.created_at)}</span>
                {lev.folio && (
                  <>
                    <span>·</span>
                    <span>{lev.folio}</span>
                  </>
                )}
                {cargandoDetalle === lev.id && <span>· Cargando...</span>}
              </div>
            </button>
          ))}
        </div>
      </main>

      {seleccionado && (
        <TechDetailModal
          levantamiento={seleccionado}
          onClose={() => setSeleccionado(null)}
          onEditar={(lev) => { setSeleccionado(null); onEditar(lev); }}
        />
      )}
    </div>
  );
}
