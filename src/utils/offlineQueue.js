// Cola de envíos pendientes cuando no hay conexión, guardada en IndexedDB
// (soporta mucho más espacio que localStorage, importante porque los
// levantamientos pueden incluir varias fotos en base64).
//
// Cada registro guarda la solicitud HTTP completa (method, url, body) tal
// como se hubiera mandado al backend, para poder "reproducirla" más tarde
// exactamente igual cuando vuelva la conexión.

const DB_NAME = 'provac_offline_db';
const DB_VERSION = 1;
const STORE = 'pendientes';

function abrirDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Guarda una solicitud que no se pudo enviar por falta de conexión.
export async function guardarPendiente({ method, url, body, descripcion, tipoBanda }) {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const registro = {
      method,
      url,
      body,
      descripcion: descripcion || 'Levantamiento',
      tipo_banda: tipoBanda || '',
      creado_en: new Date().toISOString(),
      intentos: 0,
      ultimo_error: ''
    };
    const req = store.add(registro);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function listarPendientes() {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve((req.result || []).sort((a, b) => a.creado_en.localeCompare(b.creado_en)));
    req.onerror = () => reject(req.error);
  });
}

export async function contarPendientes() {
  const lista = await listarPendientes();
  return lista.length;
}

export async function eliminarPendiente(id) {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function marcarIntento(id, errorMsg) {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const reg = getReq.result;
      if (!reg) return;
      reg.intentos = (reg.intentos || 0) + 1;
      reg.ultimo_error = errorMsg || '';
      store.put(reg);
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Evita que dos llamadas a sincronizarPendientes() corran al mismo tiempo
// (por ejemplo: el listener de "online" de App.jsx, el de Historial.jsx y
// el botón "Sincronizar ahora" pueden dispararse casi simultáneamente al
// recuperar señal). Sin este candado, dos corridas en paralelo pueden leer
// el mismo pendiente antes de que ninguna lo borre y subirlo duplicado.
let sincronizandoEnCurso = false;

// Intenta subir cada pendiente en el orden en que se guardaron. Si un
// intento falla porque no hay conexión en absoluto (fetch ni siquiera
// logra contactar al servidor), se detiene de una vez para no acumular
// intentos inútiles; si el servidor sí responde pero con error, se deja
// el registro para el siguiente intento y se sigue con los demás.
export async function sincronizarPendientes(token) {
  if (sincronizandoEnCurso) {
    return { subidos: 0, fallidos: 0, restantes: await contarPendientes(), enCurso: true };
  }
  sincronizandoEnCurso = true;
  try {
    const pendientes = await listarPendientes();
    let subidos = 0;
    let fallidos = 0;

    for (const p of pendientes) {
      try {
        const response = await fetch(p.url, {
          method: p.method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: p.body
        });
        if (response.ok) {
          await eliminarPendiente(p.id);
          subidos++;
        } else {
          const errData = await response.json().catch(() => ({}));
          await marcarIntento(p.id, errData.error || `Error ${response.status}`);
          fallidos++;
        }
      } catch (err) {
        // Sin conexión real: no tiene caso seguir intentando el resto ahora.
        await marcarIntento(p.id, 'Sin conexión');
        break;
      }
    }

    const restantes = await contarPendientes();
    return { subidos, fallidos, restantes };
  } finally {
    sincronizandoEnCurso = false;
  }
}

export function estaEnLinea() {
  return typeof navigator === 'undefined' ? true : navigator.onLine;
}
