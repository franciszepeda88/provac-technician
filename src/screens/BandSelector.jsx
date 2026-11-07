import './BandSelector.css';

// Íconos de línea (mismo trazo que los del PROVAC HUB: azul #014EA0, ancho 1.75, viewBox 24)
const ICONOS = {
  transporte: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#014EA0" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="6" cy="14" r="3" /><circle cx="18" cy="14" r="3" /><path d="M6 11h12M6 17h12" /><path d="M9 6l3-2 3 2" />
    </svg>
  ),
  transmision: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#014EA0" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="7" cy="8" r="4" /><circle cx="17" cy="16" r="3" /><path d="M9.8 11l4.6 3.2M10.6 5.2L19 13.2" /><circle cx="7" cy="8" r="1" />
    </svg>
  ),
  modular: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#014EA0" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="8" height="7" rx="1.5" /><rect x="13" y="4" width="8" height="7" rx="1.5" /><rect x="3" y="13" width="8" height="7" rx="1.5" /><rect x="13" y="13" width="8" height="7" rx="1.5" />
    </svg>
  ),
  thermodrive: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#014EA0" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3.2" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" />
    </svg>
  ),
  historial: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#014EA0" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 13h7M9 17h7" />
    </svg>
  )
};

const TIPOS_BANDA = [
  { id: 'transporte', nombre: 'Banda de Transporte', descripcion: 'Bandas transportadoras de materiales' },
  { id: 'transmision', nombre: 'Banda de Transmisión de Fuerza', descripcion: 'Bandas de poder y transmisión mecánica' },
  { id: 'modular', nombre: 'Banda Modular Plástica', descripcion: 'Bandas modulares de eslabones plásticos' },
  { id: 'thermodrive', nombre: 'Banda Thermodrive', descripcion: 'Bandas de dentado y perfil Thermodrive' }
];

const MARCAS = ['HABASIT', 'INTRALOX', 'YONGLI', 'BELTSERVICE'];

export default function BandSelector({ usuario, onSelect, onVerHistorial }) {
  return (
    <div className="selector-container">
      <nav className="selector-navbar">
        <div className="nav-left">
          <img src="./logo-provac.png" alt="PROVAC" className="nav-logo" />
          <span className="nav-word">BANDAS</span>
        </div>
        <div className="nav-right">
          <span className="user-info">{usuario.nombre}</span>
        </div>
      </nav>

      <main className="selector-main">
        <section className="sel-hero">
          <span className="sel-pill"><i />Levantamientos industriales</span>
          <h1>Bienvenido, {(usuario.nombre || '').split(' ')[0]}</h1>
          <p>Selecciona el tipo de levantamiento que vas a realizar.</p>
        </section>

        <button className="hist-link" onClick={onVerHistorial}>
          <span className="hist-link-ico">{ICONOS.historial}</span>
          <span className="hist-link-txt">
            <b>Mis levantamientos</b>
            <small>Consulta, edita o sincroniza los que ya hiciste</small>
          </span>
          <span className="hist-link-arrow">→</span>
        </button>

        <div className="sel-sec"><h2>Nuevo levantamiento</h2><span>{TIPOS_BANDA.length} tipos</span></div>

        <div className="band-list">
          {TIPOS_BANDA.map((tipo) => (
            <button key={tipo.id} className="band-btn" onClick={() => onSelect(tipo.id)}>
              <span className="band-ico">{ICONOS[tipo.id]}</span>
              <span className="band-txt">
                <span className="band-name">{tipo.nombre}</span>
                <span className="band-desc">{tipo.descripcion}</span>
              </span>
              <span className="band-arrow">→</span>
            </button>
          ))}
        </div>

        <div className="marcas-strip">
          <span className="marcas-label">Marcas y tecnologías</span>
          <div className="marcas-list">
            {MARCAS.map((marca) => (
              <span key={marca} className="marca-item">{marca}</span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
