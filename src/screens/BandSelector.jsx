import './BandSelector.css';
import Ico from '../components/Ico';
import BarraSesion from '../components/BarraSesion';

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
      <BarraSesion usuario={usuario} />

      <main className="selector-main">
        <header className="sel-enc">
          <h1>Bienvenido, {(usuario.nombre || '').split(' ')[0]}</h1>
          <p>Elige el tipo de levantamiento que vas a hacer.</p>
        </header>

        <button className="hist-link" onClick={onVerHistorial}>
          <span className="caja-ico"><Ico nombre="historial" size={24} /></span>
          <span className="hist-link-txt">
            <b>Mis levantamientos</b>
            <small>Consulta, edita o envía los que ya hiciste</small>
          </span>
          <Ico nombre="siguiente" />
        </button>

        <div className="sel-sec"><h2>Nuevo levantamiento</h2><span>{TIPOS_BANDA.length} tipos</span></div>

        <div className="band-list">
          {TIPOS_BANDA.map((tipo) => (
            <button key={tipo.id} className="band-btn" onClick={() => onSelect(tipo.id)}>
              <span className="caja-ico"><Ico nombre={tipo.id} size={24} /></span>
              <span className="band-txt">
                <span className="band-name">{tipo.nombre}</span>
                <span className="band-desc">{tipo.descripcion}</span>
              </span>
              <Ico nombre="siguiente" />
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
