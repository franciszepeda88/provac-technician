import { useState, useEffect } from 'react';
import TechnicianLogin from './components/TechnicianLogin';
import BandSelector from './screens/BandSelector';
import Historial from './screens/Historial';
import BandaTransporteForm from './forms/BandaTransporteForm';
import BandaTransmisionForm from './forms/BandaTransmisionForm';
import BandaModularForm from './forms/BandaModularForm';
import BandaThermodriveForm from './forms/BandaThermodriveForm';
import './App.css';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [vista, setVista] = useState('selector'); // selector | historial | formulario
  const [tipoBanda, setTipoBanda] = useState(null);
  const [editando, setEditando] = useState(null); // levantamiento existente, si se está editando

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUsuario = localStorage.getItem('usuario');

    if (savedToken && savedUsuario) {
      setUsuario(JSON.parse(savedUsuario));
    }
  }, []);

  const handleLoginSuccess = (usuarioData) => {
    setUsuario(usuarioData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
    setTipoBanda(null);
    setEditando(null);
    setVista('selector');
  };

  const handleSelectBanda = (tipo) => {
    setTipoBanda(tipo);
    setEditando(null);
    setVista('formulario');
  };

  const handleEditar = (levantamiento) => {
    setEditando(levantamiento);
    setTipoBanda(levantamiento.tipo_banda);
    setVista('formulario');
  };

  const handleBackDesdeFormulario = () => {
    if (editando) {
      setEditando(null);
      setTipoBanda(null);
      setVista('historial');
    } else {
      setTipoBanda(null);
      setVista('selector');
    }
  };

  const handleBackToSelector = () => {
    setTipoBanda(null);
    setEditando(null);
    setVista('selector');
  };

  // Tocar el logo PROVAC siempre regresa a la pantalla principal (selector de tipo de banda)
  const handleIrInicio = () => {
    setTipoBanda(null);
    setEditando(null);
    setVista('selector');
  };

  const renderFormulario = () => {
    switch (tipoBanda) {
      case 'transporte':
        return (
          <BandaTransporteForm
            usuario={usuario}
            onBack={handleBackDesdeFormulario}
            onLogout={handleLogout}
            onIrInicio={handleIrInicio}
            existente={editando}
          />
        );
      case 'transmision':
        return (
          <BandaTransmisionForm
            usuario={usuario}
            onBack={handleBackDesdeFormulario}
            onLogout={handleLogout}
            onIrInicio={handleIrInicio}
            existente={editando}
          />
        );
      case 'modular':
        return (
          <BandaModularForm
            usuario={usuario}
            onBack={handleBackDesdeFormulario}
            onLogout={handleLogout}
            onIrInicio={handleIrInicio}
            existente={editando}
          />
        );
      case 'thermodrive':
        return (
          <BandaThermodriveForm
            usuario={usuario}
            onBack={handleBackDesdeFormulario}
            onLogout={handleLogout}
            onIrInicio={handleIrInicio}
            existente={editando}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app">
      {!usuario ? (
        <TechnicianLogin onLoginSuccess={handleLoginSuccess} />
      ) : vista === 'historial' ? (
        <Historial
          usuario={usuario}
          onBack={handleBackToSelector}
          onLogout={handleLogout}
          onEditar={handleEditar}
          onIrInicio={handleIrInicio}
        />
      ) : vista === 'formulario' ? (
        renderFormulario()
      ) : (
        <BandSelector
          usuario={usuario}
          onSelect={handleSelectBanda}
          onLogout={handleLogout}
          onVerHistorial={() => setVista('historial')}
        />
      )}
    </div>
  );
}

export default App;
