import heroImg from '../assets/hero.jpg';
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

const MARCAS = ['HABASIT', 'INTRALOX', 'YONGLI', 'BELTSERVICE'];

export default function BandSelector({ usuario, onSelect, onLogout, onVerHistorial }) {
  return (
    <div className="selector-container">
      <div className="selector-hero" style={{ backgroundImage: `url(${heroImg})` }}>
        <nav className="selector-navbar">
          <div className="nav-left">
            <img src="/logo-provac.png" alt="PROVAC" className="nav-logo" />
          </div>
          <div className="nav-right">
            <span className="user-info">{usuario.nombre}</span>
            <button onClick={onLogout} className="logout-btn">Cerrar Sesión</button>
          </div>
        </nav>

        <div className="hero-text">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-bar" />
            <span>LEVANTAMIENTOS INDUSTRIALES</span>
          </div>
          <h1>Bienvenido</h1>
          <p>Selecciona el tipo de levantamiento que vas a realizar</p>
        </div>
      </div>

      <main className="selector-main">
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

        <div className="marcas-strip">
          <div className="marcas-label-row">
            <span className="marcas-label">MARCAS / TECNOLOGÍAS</span>
          </div>
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
