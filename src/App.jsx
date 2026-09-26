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

  // Sesión activa de "varias bandas bajo el mismo folio": mientras no sea null,
  // el técnico está en medio de un levantamiento con más de una banda. Guarda
  // el folio compartido, los datos del cliente (para no volver a pedirlos) y
  // las bandas ya guardadas como borrador que faltan por firmar al final.
  const [multiBanda, setMultiBanda] = useState(null);

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
    setMultiBanda(null);
    setVista('selector');
  };

  const handleSelectBanda = (tipo) => {
    setTipoBanda(tipo);
    setEditando(null);
    setMultiBanda(null);
    setVista('formulario');
  };

  const handleEditar = (levantamiento) => {
    setEditando(levantamiento);
    setTipoBanda(levantamiento.tipo_banda);
    setMultiBanda(null);
    setVista('formulario');
  };

  const handleBackDesdeFormulario = () => {
    if (editando) {
      setEditando(null);
      setTipoBanda(null);
      setMultiBanda(null);
      setVista('historial');
    } else {
      setTipoBanda(null);
      setMultiBanda(null);
      setVista('selector');
    }
  };

  const handleBackToSelector = () => {
    setTipoBanda(null);
    setEditando(null);
    setMultiBanda(null);
    setVista('selector');
  };

  // Tocar el logo PROVAC siempre regresa a la pantalla principal (selector de tipo de banda)
  const handleIrInicio = () => {
    setTipoBanda(null);
    setEditando(null);
    setMultiBanda(null);
    setVista('selector');
  };

  // El formulario actual guardó su banda como borrador y el técnico eligió
  // agregar otra banda bajo el mismo folio: se suma a la lista de pendientes
  // por firmar y se abre el siguiente formulario ya con los datos del cliente.
  const handleAgregarBanda = ({ folio, cliente, pendienteId, pendienteTipo, nuevoTipo }) => {
    setMultiBanda((prev) => ({
      folio,
      cliente,
      pendientes: [...(prev?.pendientes || []), { id: pendienteId, tipo_banda: pendienteTipo }]
    }));
    setEditando(null);
    setTipoBanda(nuevoTipo);
    setVista('formulario');
  };

  // La última banda del levantamiento ya se firmó y guardó (junto con todas
  // las bandas pendientes, que se actualizaron con la misma firma). Se cierra
  // la sesión de multi-banda y se vuelve al inicio.
  const handleSesionTerminada = () => {
    setMultiBanda(null);
    setTipoBanda(null);
    setEditando(null);
    setVista('selector');
  };

  const renderFormulario = () => {
    const propsComunes = {
      usuario,
      onBack: handleBackDesdeFormulario,
      onLogout: handleLogout,
      onIrInicio: handleIrInicio,
      existente: editando,
      multiBanda: editando ? null : multiBanda,
      onAgregarBanda: editando ? undefined : handleAgregarBanda,
      onSesionTerminada: handleSesionTerminada
    };

    switch (tipoBanda) {
      case 'transporte':
        return <BandaTransporteForm {...propsComunes} />;
      case 'transmision':
        return <BandaTransmisionForm {...propsComunes} />;
      case 'modular':
        return <BandaModularForm {...propsComunes} />;
      case 'thermodrive':
        return <BandaThermodriveForm {...propsComunes} />;
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
