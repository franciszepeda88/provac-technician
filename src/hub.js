// Acceso único: a esta app se entra solo por el PROVAC HUB. Sin sesión, se manda a la persona al Hub
// y el Hub la devuelve aquí (?next=) ya con sesión. Esta app no tiene login propio.
// Cerrar sesión se hace solo en el Hub; aquí solo se ofrece volver al Hub.
import { API_URL } from './config'

export const HUB_URL = 'https://provac-hub.vercel.app/'
export const RUTA_EN_HUB = '/bandas/'
export const NOMBRE_APP = 'Levantamiento de bandas'
const APP_ID = 'bandas'

// Freno contra bucles: si hace menos de 30 s ya se mandó al Hub y volvió sin sesión, no se repite.
const CLAVE = 'hub_redir_bandas'
export function yaSeRedirigioHaceSegundos() {
  try { return Date.now() - (+sessionStorage.getItem(CLAVE) || 0) < 30000 } catch { return false }
}
export function anotarRedireccion() {
  try { sessionStorage.setItem(CLAVE, String(Date.now())) } catch { /* sin sessionStorage: sin freno */ }
}
export function limpiarRedireccion() {
  try { sessionStorage.removeItem(CLAVE) } catch { /* nada */ }
}

// ¿El token propio de la app ya venció? (JWT de 24 h emitido por el backend al entrar por el Hub)
export function tokenVencido(token) {
  try {
    const exp = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).exp
    return !!exp && exp * 1000 < Date.now()
  } catch { return false }
}

// Segundos que le quedan al token (negativo si ya venció); null si no se puede leer.
export function segundosRestantes(token) {
  try {
    const exp = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).exp
    return exp ? exp - Date.now() / 1000 : null
  } catch { return null }
}

// Renovación silenciosa: pide al servidor una sesión nueva (el servidor vuelve a comprobar que la
// persona sigue con acceso en el Hub). Si algo falla devuelve false y la app usa el camino de siempre
// (pasar por el Hub). Nunca borra la sesión guardada: eso lo decide quien la llama.
let renovacionEnCurso = null
export function renovarSesion() {
  if (renovacionEnCurso) return renovacionEnCurso
  renovacionEnCurso = (async () => {
    const ctl = new AbortController()
    const t = setTimeout(() => ctl.abort(), 20000)
    try {
      const token = localStorage.getItem('token')
      if (!token) return false
      const r = await fetch(`${API_URL}/auth/renovar`, {
        method: 'POST',
        signal: ctl.signal,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ app: APP_ID }),
      })
      if (!r.ok) return false
      const d = await r.json()
      if (!d.token || !d.usuario) return false
      localStorage.setItem('token', d.token)
      localStorage.setItem('usuario', JSON.stringify(d.usuario))
      return true
    } catch { return false } finally { clearTimeout(t); renovacionEnCurso = null }
  })()
  return renovacionEnCurso
}

// Renueva antes de que venza (faltan menos de 2 h) o si ya venció; con la sesión vigente no hace nada.
export async function renovarSiHaceFalta() {
  if (!navigator.onLine) return
  const s = segundosRestantes(localStorage.getItem('token') || '')
  if (s !== null && s < 7200) await renovarSesion()
}
