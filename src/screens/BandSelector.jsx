import './BandSelector.css';

const TIPOS_BANDA = [
  {
    id: 'transporte',
    nombre: 'Banda de Transporte',
    descripcion: 'Bandas transportadoras de materiales'
  },
  {
    id: 'transmision',
    nombre: 'Banda de Transmisión de Fuerza',
    descripcion: 'Bandas de poder / transmisión mecánica'
  },
  {
    id: 'modular',
    nombre: 'Banda Modular Plástica',
    descripcion: 'Bandas modulares de eslabones plásticos'
  },
  {
    id: 'thermodrive',
    nombre: 'Banda Thermodrive',
    descripcion: 'Bandas de dentado / perfil Thermodrive'
  }
];

export default function BandSelector({ usuario, onSelect, onLogout, onVerHistorial }) {
  return (
    <div className="selector-container">
      <nav className="selector-navbar">
        <div className="nav-left">
          <img src="/logo-provac.png" alt="PROVAC" className="nav-logo" />
        </div>
        <div className="nav-right">
          <span className="user-info">{usuario.nombre}</span>
          <button onClick={onLogout} className="logout-btn">Cerrar Sesión</button>
        </div>
      </nav>

      <main className="selector-main">
        <div className="welcome-box">
          <h1>Bienvenido</h1>
          <p>Selecciona el tipo de levantamiento que vas a realizar</p>
        </div>

        <button className="hist-link" onClick={onVerHistorial}>
          <span>Mis Levantamientos</span>
          <span className="hist-link-arrow">→</span>
        </button>

        <div className="band-list">
          {TIPOS_BANDA.map((tipo) => (
            <button
              key={tipo.id}
              className="band-btn"
              onClick={() => onSelect(tipo.id)}
            >
              <span className="band-name">{tipo.nombre}</span>
              <span className="band-arrow">→</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
