import { guardarPendiente } from './offlineQueue';

// Intenta enviar la solicitud al backend normalmente. Si falla por falta
// de conexión (no por un error de validación que el servidor sí devolvió),
// la guarda en la cola local para reintentarla más tarde y lo reporta como
// "offline" para que el formulario pueda tratarlo como un guardado exitoso
// y no bloquear al técnico en campo.
export async function enviarOEncolar({ url, method, token, payload, descripcion, tipoBanda }) {
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));
    return { offline: false, ok: response.ok, result };
  } catch (err) {
    await guardarPendiente({
      method,
      url,
      body: JSON.stringify(payload),
      descripcion,
      tipoBanda
    });
    return { offline: true, ok: true, result: {} };
  }
}
