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

  return (
    <div className="centro">
      <h1>{NOMBRE_APP}</h1>
      {motivo === 'sin_conexion' ? (
        <p>Sin conexión. Para entrar abre primero el PROVAC HUB con internet.</p>
      ) : motivo === 'bucle' ? (
        <p>No se pudo iniciar la sesión. Vuelve a entrar desde el PROVAC HUB.</p>
      ) : (
        <p>Entrando desde el PROVAC HUB…</p>
      )}
      {motivo && <a className="btn" href={HUB_URL}>Ir al Hub</a>}
    </div>
  )
}
