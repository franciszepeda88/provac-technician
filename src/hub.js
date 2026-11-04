// Acceso único: a esta app se entra solo por el PROVAC HUB. Sin sesión, se manda a la persona al Hub
// y el Hub la devuelve aquí (?next=) ya con sesión. Esta app no tiene login propio.
// Cerrar sesión se hace solo en el Hub; aquí solo se ofrece volver al Hub.
export const HUB_URL = 'https://provac-hub.vercel.app/'
export const RUTA_EN_HUB = '/bandas/'
export const NOMBRE_APP = 'Levantamiento de bandas'

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
