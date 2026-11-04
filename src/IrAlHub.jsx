import { useEffect, useState } from 'react'
import { HUB_URL, RUTA_EN_HUB, NOMBRE_APP, yaSeRedirigioHaceSegundos, anotarRedireccion } from './hub'

// Sin sesión: manda al PROVAC HUB (que devuelve a la app con sesión). No hay formulario de login aquí.
export default function IrAlHub() {
  const [motivo, setMotivo] = useState('')

  useEffect(() => {
    if (!navigator.onLine) { setMotivo('sin_conexion'); return }
    if (yaSeRedirigioHaceSegundos()) { setMotivo('bucle'); return }
    anotarRedireccion()
    window.location.replace(HUB_URL + '?next=' + encodeURIComponent(RUTA_EN_HUB))
  }, [])

  const caja = { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24, textAlign: 'center', fontFamily: 'Montserrat, system-ui, sans-serif', color: '#014EA0' }
  const boton = { background: '#014EA0', color: '#fff', padding: '12px 22px', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }
  return (
    <div style={caja}>
      <h1 style={{ margin: 0, fontSize: 22 }}>{NOMBRE_APP}</h1>
      {motivo === 'sin_conexion' ? (
        <p>Sin conexión. Para entrar abre primero el PROVAC HUB con internet.</p>
      ) : motivo === 'bucle' ? (
        <p>No se pudo iniciar la sesión. Vuelve a entrar desde el PROVAC HUB.</p>
      ) : (
        <p>Entrando desde el PROVAC HUB…</p>
      )}
      {motivo && <a style={boton} href={HUB_URL}>Ir al PROVAC HUB</a>}
    </div>
  )
}
