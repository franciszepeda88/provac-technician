import { useState, useRef } from 'react';
import { API_URL } from '../config';
import SignaturePad from './SignaturePad';
import './TechnicianForm.css';

export default function TechnicianForm({ usuario, onLogout }) {
  const [formData, setFormData] = useState({
    cliente_nombre: '',
    banda_tipo: '',
    banda_ancho: '',
    banda_largo: '',
    banda_condicion: 'no_evaluada',
    ubicacion: '',
    temperatura: '',
    humedad: '',
    accesorios: '',
    observaciones: '',
    notas: '',
    fotos: [],
    firma_tecnico: '',
    firma_cliente: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('basico'); // basico, fotos, firmas
  const photoInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoCapture = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          fotos: [...prev.fotos, event.target.result]
        }));
      };
      reader.readAsDataURL(file);
    });
    // Limpiar input
    e.target.value = '';
  };

  const handleRemovePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== index)
    }));
  };

  const handleSignatureTecnico = (signature) => {
    setFormData(prev => ({
      ...prev,
      firma_tecnico: signature
    }));
  };

  const handleSignatureCliente = (signature) => {
    setFormData(prev => ({
      ...prev,
      firma_cliente: signature
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validar campos requeridos
    if (!formData.cliente_nombre || !formData.banda_tipo || !formData.banda_ancho || !formData.banda_largo) {
      setError('⚠️ Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/levantamientos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al guardar');
        setLoading(false);
        return;
      }

      setSuccess('✅ Levantamiento guardado exitosamente');
      
      // Resetear formulario
      setFormData({
        cliente_nombre: '',
        banda_tipo: '',
        banda_ancho: '',
        banda_largo: '',
        banda_condicion: 'no_evaluada',
        ubicacion: '',
        temperatura: '',
        humedad: '',
        accesorios: '',
        observaciones: '',
        notas: '',
        fotos: [],
        firma_tecnico: '',
        firma_cliente: ''
      });
      
      setActiveTab('basico');
      setLoading(false);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('❌ Error de conexión: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="technician-container">
      <nav className="navbar">
        <div className="nav-left">
          <h2>📋 Levantamiento de Bandas - PROVAC</h2>
        </div>
        <div className="nav-right">
          <span className="user-info">👤 {usuario.nombre}</span>
          <button onClick={onLogout} className="logout-btn">Cerrar Sesión</button>
        </div>
      </nav>

      <main className="form-container">
        <div className="form-box">
          <h1>Nuevo Levantamiento Completo</h1>
          
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="tabs">
            <button
              className={`tab-btn ${activeTab === 'basico' ? 'active' : ''}`}
              onClick={() => setActiveTab('basico')}
            >
              📝 Datos Básicos
            </button>
            <button
              className={`tab-btn ${activeTab === 'fotos' ? 'active' : ''}`}
              onClick={() => setActiveTab('fotos')}
            >
              📷 Fotos ({formData.fotos.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'firmas' ? 'active' : ''}`}
              onClick={() => setActiveTab('firmas')}
            >
              ✍️ Firmas
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* TAB 1: DATOS BASICOS */}
            {activeTab === 'basico' && (
              <div className="tab-content">
                <h2>Información del Cliente y Banda</h2>
                
                <div className="form-group">
                  <label>Cliente * <span className="required">(requerido)</span></label>
                  <input
                    type="text"
                    name="cliente_nombre"
                    value={formData.cliente_nombre}
                    onChange={handleChange}
                    placeholder="Nombre completo del cliente"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Ubicación / Departamento</label>
                  <input
                    type="text"
                    name="ubicacion"
                    value={formData.ubicacion}
                    onChange={handleChange}
                    placeholder="Ej: Bodega principal, Taller, etc"
                  />
                </div>

                <div className="form-group">
                  <label>Tipo de Banda * <span className="required">(requerido)</span></label>
                  <select
                    name="banda_tipo"
                    value={formData.banda_tipo}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecciona un tipo...</option>
                    <option value="Transmisión">Transmisión</option>
                    <option value="Transportadora">Transportadora</option>
                    <option value="Conveyour">Conveyour</option>
                    <option value="Otra">Otra</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Ancho (cm) * <span className="required">(requerido)</span></label>
                    <input
                      type="number"
                      name="banda_ancho"
                      value={formData.banda_ancho}
                      onChange={handleChange}
                      placeholder="Ancho"
                      required
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div className="form-group">
                    <label>Largo (cm) * <span className="required">(requerido)</span></label>
                    <input
                      type="number"
                      name="banda_largo"
                      value={formData.banda_largo}
                      onChange={handleChange}
                      placeholder="Largo"
                      required
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Estado/Condición de la Banda</label>
                  <select
                    name="banda_condicion"
                    value={formData.banda_condicion}
                    onChange={handleChange}
                  >
                    <option value="no_evaluada">No evaluada</option>
                    <option value="excelente">Excelente</option>
                    <option value="buena">Buena</option>
                    <option value="regular">Regular</option>
                    <option value="deficiente">Deficiente</option>
                    <option value="fuera_servicio">Fuera de servicio</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Temperatura (°C)</label>
                    <input
                      type="number"
                      name="temperatura"
                      value={formData.temperatura}
                      onChange={handleChange}
                      placeholder="Temperatura ambiente"
                      step="0.1"
                    />
                  </div>

                  <div className="form-group">
                    <label>Humedad (%)</label>
                    <input
                      type="number"
                      name="humedad"
                      value={formData.humedad}
                      onChange={handleChange}
                      placeholder="Humedad relativa"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Accesorios</label>
                  <textarea
                    name="accesorios"
                    value={formData.accesorios}
                    onChange={handleChange}
                    placeholder="Describe los accesorios (poleas, tensores, rodillos, etc)"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Observaciones Técnicas</label>
                  <textarea
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                    placeholder="Detalles técnicos observados durante el levantamiento"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Notas Generales</label>
                  <textarea
                    name="notas"
                    value={formData.notas}
                    onChange={handleChange}
                    placeholder="Observaciones generales o recomendaciones"
                    rows="3"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: FOTOS */}
            {activeTab === 'fotos' && (
              <div className="tab-content">
                <h2>Fotos del Levantamiento</h2>
                
                <div className="photo-upload-section">
                  <button
                    type="button"
                    className="photo-upload-btn"
                    onClick={() => photoInputRef.current?.click()}
                  >
                    📷 Agregar Fotos
                  </button>
                  <input
                    ref={photoInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoCapture}
                    style={{ display: 'none' }}
                    capture="environment"
                  />
                  <p className="photo-hint">Puedes capturar o seleccionar múltiples fotos</p>
                </div>

                <div className="photos-grid">
                  {formData.fotos.map((photo, index) => (
                    <div key={index} className="photo-card">
                      <img src={photo} alt={`Foto ${index + 1}`} />
                      <button
                        type="button"
                        className="remove-photo-btn"
                        onClick={() => handleRemovePhoto(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {formData.fotos.length === 0 && (
                  <div className="no-photos">
                    <p>📷 No hay fotos añadidas. Haz clic en "Agregar Fotos" para empezar.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: FIRMAS */}
            {activeTab === 'firmas' && (
              <div className="tab-content">
                <h2>Firmas Digitales</h2>

                <div className="signature-section">
                  <SignaturePad
                    label="Firma del Técnico"
                    onSignatureChange={handleSignatureTecnico}
                  />
                  {formData.firma_tecnico && (
                    <p className="signature-status">✅ Firma del técnico capturada</p>
                  )}
                </div>

                <hr className="divider" />

                <div className="signature-section">
                  <SignaturePad
                    label="Firma del Cliente (Autorización)"
                    onSignatureChange={handleSignatureCliente}
                  />
                  {formData.firma_cliente && (
                    <p className="signature-status">✅ Firma del cliente capturada</p>
                  )}
                </div>
              </div>
            )}

            {/* BOTONES DE NAVEGACION Y ENVIO */}
            <div className="form-actions">
              <div className="nav-buttons">
                {activeTab !== 'basico' && (
                  <button
                    type="button"
                    className="prev-btn"
                    onClick={() => {
                      if (activeTab === 'fotos') setActiveTab('basico');
                      else if (activeTab === 'firmas') setActiveTab('fotos');
                    }}
                  >
                    ← Anterior
                  </button>
                )}
                
                {activeTab !== 'firmas' && (
                  <button
                    type="button"
                    className="next-btn"
                    onClick={() => {
                      if (activeTab === 'basico') setActiveTab('fotos');
                      else if (activeTab === 'fotos') setActiveTab('firmas');
                    }}
                  >
                    Siguiente →
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? '⏳ Guardando...' : '💾 Guardar Levantamiento Completo'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
