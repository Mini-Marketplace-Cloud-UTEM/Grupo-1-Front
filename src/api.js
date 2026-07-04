const BFF_URL = import.meta.env.VITE_BFF_URL || 'https://grupo-1-bff.onrender.com';

// Timeout por defecto. El BFF en plan free de Render puede tener cold start,
// pero sin un limite el fetch se cuelga indefinidamente si un microservicio
// no responde. Cortamos a los 10s con un mensaje claro.
const DEFAULT_TIMEOUT_MS = 10000;

// Token JWT en memoria. Lo setea el AuthProvider al iniciar/cerrar sesion,
// asi bffFetch puede adjuntarlo sin que cada componente tenga que pasarlo.
let authToken = null;
export function setAuthToken(token) {
  authToken = token || null;
}

// Error tipado: el frontend decide sobre `code` (convencion del proyecto),
// nunca sobre el `message`, que es solo para mostrar.
export class BffError extends Error {
  constructor(message, { code = 'ERROR', status } = {}) {
    super(message);
    this.name = 'BffError';
    this.code = code;
    this.status = status;
  }
}

// Cliente unico contra el BFF: timeout, Authorization Bearer opcional y
// parseo del error estandar { code, message } que devuelve el BFF.
export async function bffFetch(
  path,
  { method = 'GET', body, auth = false, timeout = DEFAULT_TIMEOUT_MS, headers = {} } = {}
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  const finalHeaders = { ...headers };
  if (body !== undefined) finalHeaders['Content-Type'] = 'application/json';
  if (auth && authToken) finalHeaders['Authorization'] = `Bearer ${authToken}`;

  let res;
  try {
    res = await fetch(`${BFF_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new BffError('El servicio tardó demasiado en responder. Intenta de nuevo.', {
        code: 'TIMEOUT',
      });
    }
    throw new BffError('No se pudo conectar con el servidor. Revisa tu conexión.', {
      code: 'NETWORK_ERROR',
    });
  }
  clearTimeout(timer);

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new BffError(errBody.message || `Error ${res.status} en la solicitud.`, {
      code: errBody.code || 'ERROR',
      status: res.status,
    });
  }

  if (res.status === 204) return null;
  return res.json();
}

export async function fetchProducts({ q = '', page = 1, pageSize = 6 } = {}) {
  const params = new URLSearchParams({ page, pageSize });
  if (q) params.set('q', q);
  return bffFetch(`/v1/products?${params}`);
}

export async function fetchProductById(id) {
  return bffFetch(`/v1/products/${id}`);
}
