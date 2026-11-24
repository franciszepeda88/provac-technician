import { useState, useEffect, useMemo } from 'react';
import { API_URL } from '../config';
import TechDetailModal from './TechDetailModal';
import { TIPO_LABELS, exportListToExcel } from '../utils/exportUtils';
import { listarPendientes, sincronizarPendientes } from '../utils/offlineQueue';
import Ico from '../components/Ico';
import BarraSesion from '../components/BarraSesion';
import Esqueleto from '../components/Esqueleto';
import './Historial.css';

// Estado de cada levantamiento, siempre con texto (el color solo acompaña)
const ETIQUETA_ESTADO = { completo: 'Enviado', borrador: 'Borrador' };
const etiquetaEstado = (estado) => ETIQUETA_ESTADO[estado || 'completo'] || estado;

export default function Historial({ usuario, onBack, onEditar }) {
  const [levantamientos, setLevantamientos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [seleccionado, setSeleccionado] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(null); // id del levantamiento cuyo detalle se está pidiendo
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [pendientes, setPendientes] = useState([]);
  const [sincronizando, setSincronizando] = useState(false);
  const [mensajeSync, setMensajeSync] = useState('');

  useEffect(() => {
    cargar(1);
    cargarPendientes();
    const onOnline = () => sincronizar();
    window.addEventListener('online', onOnline);
    // Reintento periódico por si el navegador no avisa "online" de forma
    // confiable (común en datos móviles con señal intermitente).
    const intervalo = setInterval(() => sincronizar(), 45000);
    return () => {
      window.removeEventListener('online', onOnline);
      clearInterval(intervalo);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarPendientes = async () => {
    try {
      const lista = await listarPendientes();
      setPendientes(lista);
    } catch (err) { /* IndexedDB no disponible; se ignora */ }
  };

  const sincronizar = async () => {
    setSincronizando(true);
    setMensajeSync('');
    try {
      const token = localStorage.getItem('token');
      const { subidos, fallidos, restantes } = await sincronizarPendientes(token);
      await cargarPendientes();
      if (subidos > 0) {
        setMensajeSync(`${subidos} levantamiento(s) enviado(s)`);
        cargar(1);
      } else if (fallidos > 0) {
        setMensajeSync('Algunos levantamientos no se pudieron enviar todavía. Se reintentará solo.');
      } else if (restantes === 0) {
        setMensajeSync('');
      }
    } catch (err) { /* sin conexión u otro problema; se reintentará después */ }
    finally {
      setSincronizando(false);
    }
  };

  const cargar = async (intento = 1) => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/levantamientos?mios=1`, {
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

  // Varias bandas pueden compartir el mismo folio (un levantamiento con
  // varias bandas). Se agrupan para mostrarlas juntas en vez de como
  // tarjetas sueltas y repetidas del mismo cliente.
  const gruposPorFolio = useMemo(() => {
    const mapa = new Map();
    filtrados.forEach((lev) => {
      const key = lev.folio && lev.folio.trim() ? lev.folio : `sin-folio-${lev.id}`;
      if (!mapa.has(key)) mapa.set(key, []);
      mapa.get(key).push(lev);
    });
    return Array.from(mapa.values());
  }, [filtrados]);

  // Convierte cada solicitud pendiente (guardada como method/url/body crudo)
  // de vuelta a la forma de un levantamiento, para poder mostrarla en la
  // lista y en el detalle exactamente igual que uno ya sincronizado.
  const pendientesConvertidos = useMemo(() => {
    return pendientes.map((p) => {
      let payload = {};
      try { payload = JSON.parse(p.body); } catch (e) { /* ignorar */ }
      return {
        ...payload,
        id: `local-${p.id}`,
        created_at: p.creado_en,
        _esPendienteLocal: true,
        _pendienteLocalId: p.id
      };
    });
  }, [pendientes]);

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
      <BarraSesion usuario={usuario} />

      <main className="hist-main">
        <button className="atras" onClick={onBack}><Ico nombre="atras" />Volver a tipos de banda</button>
        <div className="hist-title-row">
          <h1>Mis levantamientos</h1>
          {filtrados.length > 0 && (
            <button className="hist-export" onClick={() => exportListToExcel(filtrados, 'mis_levantamientos.xlsx')}>
              <Ico nombre="externo" size={16} />Exportar Excel
            </button>
          )}
        </div>

        {pendientes.length > 0 && (
          <div className="hist-pendientes-banner">
            <span>{pendientes.length} levantamiento(s) pendiente(s) de enviar</span>
            <button
              type="button"
              className="hist-btn-sincronizar"
              onClick={sincronizar}
              disabled={sincronizando}
            >
              {sincronizando ? 'Enviando…' : 'Enviar ahora'}
            </button>
          </div>
        )}
        {mensajeSync && <p className="hist-hint">{mensajeSync}</p>}

        {pendientesConvertidos.length > 0 && (
          <div className="hist-list hist-list-pendientes">
            {pendientesConvertidos.map((lev) => (
              <button key={lev.id} className="hist-card hist-card-pendiente" onClick={() => setSeleccionado(lev)}>
                <div className="hist-card-top">
                  <span className="hist-cliente">{lev.cliente_nombre || 'Sin nombre'}</span>
                  <span className="badge b-pendiente">Pendiente de enviar</span>
                </div>
                <div className="hist-card-meta">
                  <span>{TIPO_LABELS[lev.tipo_banda] || lev.tipo_banda}</span>
                  <span>·</span>
                  <span>{formatearFecha(lev.created_at)}</span>
                  {lev.folio && lev.folio !== 'AUTO' && (
                    <>
                      <span>·</span>
                      <span>{lev.folio}</span>
                    </>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="hist-filtros">
          <input
            type="text"
            placeholder="Buscar cliente, folio o palabra clave"
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
            <option value="completo">Enviado</option>
            <option value="borrador">Borrador</option>
          </select>
        </div>

        {loading && <Esqueleto filas={3} />}
        {error && (
          <div className="hist-error-box" role="alert">
            <p className="hist-error">{error}</p>
            <button className="hist-retry" onClick={() => { setLoading(true); cargar(1); }}>Reintentar</button>
          </div>
        )}

        {!loading && !error && filtrados.length === 0 && (
          <div className="vacio">
            <Ico nombre="bandeja" size={48} />
            <strong>{levantamientos.length === 0 ? 'Todavía no hay levantamientos' : 'Ningún levantamiento coincide'}</strong>
            <span>{levantamientos.length === 0 ? 'Los que hagas aparecerán aquí.' : 'Prueba con otra búsqueda o quita los filtros.'}</span>
          </div>
        )}

        <div className="hist-list">
          {gruposPorFolio.map((grupo) => {
            if (grupo.length === 1) {
              const lev = grupo[0];
              return (
                <button key={lev.id} className="hist-card" onClick={() => abrirDetalle(lev)} disabled={cargandoDetalle === lev.id}>
                  <div className="hist-card-top">
                    <span className="hist-cliente">{lev.cliente_nombre}</span>
                    <span className={`badge b-${lev.estado || 'completo'}`}>{etiquetaEstado(lev.estado)}</span>
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
                    {lev.user_id !== usuario.id && (
                      <>
                        <span>·</span>
                        <span>Hecho por {(lev.datos && lev.datos.tecnico_provac) || 'otro técnico'}</span>
                      </>
                    )}
                    {cargandoDetalle === lev.id && <span>· Abriendo…</span>}
                  </div>
                </button>
              );
            }
            const primero = grupo[0];
            return (
              <div key={primero.folio} className="hist-folio-grupo">
                <div className="hist-folio-header">
                  <span className="hist-cliente">{primero.cliente_nombre}</span>
                  <span className="hist-folio-badge">{primero.folio} · {grupo.length} bandas</span>
                  {primero.user_id !== usuario.id && (
                    <span className="hist-folio-badge">Hecho por {(primero.datos && primero.datos.tecnico_provac) || 'otro técnico'}</span>
                  )}
                </div>
                {grupo.map((lev) => (
                  <button key={lev.id} className="hist-card hist-card-sub" onClick={() => abrirDetalle(lev)} disabled={cargandoDetalle === lev.id}>
                    <div className="hist-card-top">
                      <span className="hist-cliente">{TIPO_LABELS[lev.tipo_banda] || lev.tipo_banda}</span>
                      <span className={`badge b-${lev.estado || 'completo'}`}>{etiquetaEstado(lev.estado)}</span>
                    </div>
                    <div className="hist-card-meta">
                      <span>{formatearFecha(lev.created_at)}</span>
                      {cargandoDetalle === lev.id && <span>· Abriendo…</span>}
                    </div>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </main>

      {seleccionado && (
        <TechDetailModal
          levantamiento={seleccionado}
          onClose={() => setSeleccionado(null)}
          onEditar={seleccionado._esPendienteLocal ? undefined : (lev) => { setSeleccionado(null); onEditar(lev); }}
        />
      )}
    </div>
  );
}
