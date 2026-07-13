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

// ── Carrito (BFF -> Grupo 4). Todas mandan el Bearer si hay sesion. ──
export async function createCart() {
  return bffFetch('/v1/cart', { method: 'POST', auth: true });
}

export async function getCart(cartId) {
  return bffFetch(`/v1/cart/${cartId}`, { auth: true });
}

export async function addCartItem(cartId, productId, quantity = 1) {
  return bffFetch(`/v1/cart/${cartId}/items`, {
    method: 'POST',
    auth: true,
    body: { productId, quantity },
  });
}

export async function updateCartItem(cartId, itemId, quantity) {
  return bffFetch(`/v1/cart/${cartId}/items/${itemId}`, {
    method: 'PUT',
    auth: true,
    body: { quantity },
  });
}

export async function removeCartItem(cartId, itemId) {
  return bffFetch(`/v1/cart/${cartId}/items/${itemId}`, { method: 'DELETE', auth: true });
}

// ── Flujo de compra en dos pasos (contrato G4, aclarado 2026-07-11) ──
// Reserva: al ENTRAR a "Datos de despacho". G4 retiene el stock (ACTIVE -> PENDING).
export async function reserveCart(cartId, idempotencyKey) {
  return bffFetch(`/v1/cart/${cartId}/checkout`, {
    method: 'POST',
    auth: true,
    headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
  });
}

// Salvavidas: al volver de despacho o cancelar el pago. Libera la reserva
// (PENDING -> ACTIVE) para no retener stock de una compra que no se concretó.
export async function activateCart(cartId) {
  return bffFetch(`/v1/cart/${cartId}/activate`, { method: 'PATCH', auth: true });
}

// Cierre: tras el pago exitoso. G4 confirma la venta y genera el pedido; en la
// respuesta viene el orderId. Reemplaza al viejo POST /v1/checkout.
export async function completeCart(cartId, idempotencyKey) {
  return bffFetch(`/v1/cart/${cartId}/complete`, {
    method: 'PATCH',
    auth: true,
    headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
  });
}

// ── Checkout real orquestado por G4 (v2, 2026-07-12) ──
// G4 crea el pedido en G5 (con la dirección) e inicia el pago en G8 y devuelve
// { status: "PENDING", paymentUrl }. El front redirige a paymentUrl (MercadoPago).
export async function checkoutCart(cartId, { shippingAddress, notes } = {}, idempotencyKey) {
  return bffFetch(`/v1/cart/${cartId}/checkout`, {
    method: 'POST',
    auth: true,
    body: { shippingAddress, notes: notes ?? null },
    headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
  });
}

// Cancela el checkout y libera el stock en G4 (botones "Cancelar" de despacho/pago).
export async function cancelCheckout(cartId) {
  return bffFetch(`/v1/cart/${cartId}/cancel_checkout`, { method: 'PATCH', auth: true });
}

// ── Pedidos (BFF -> Grupo 5). Requieren sesion: el BFF saca el userId del JWT. ──
// Historial "Mis pedidos" del usuario logueado (paginado).
export async function fetchOrders({ page = 1, pageSize = 20 } = {}) {
  const params = new URLSearchParams({ page, pageSize });
  return bffFetch(`/v1/orders?${params}`, { auth: true });
}

// Detalle de un pedido propio.
export async function fetchOrderById(orderId) {
  return bffFetch(`/v1/orders/${orderId}`, { auth: true });
}

// Crea el pedido en G5 (bridge MVP mientras G4 arregla su checkout y apunta a G5).
// El userId lo pone el BFF desde el JWT; aca solo van items + direccion.
export async function createOrder(payload, idempotencyKey) {
  return bffFetch('/v1/orders', {
    method: 'POST',
    auth: true,
    body: payload,
    headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
  });
}

// ── Catalogo publico extra ──
export async function fetchCategories() {
  return bffFetch('/v1/categories');
}

// ── Panel admin (BFF exige rol admin: 401 sin sesion, 403 sin el rol). ──
export async function adminCreateProduct(data, idempotencyKey) {
  return bffFetch('/v1/admin/products', {
    method: 'POST',
    auth: true,
    body: data,
    headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
  });
}

export async function adminUpdateProduct(id, data) {
  return bffFetch(`/v1/admin/products/${id}`, { method: 'PUT', auth: true, body: data });
}

export async function adminDeleteProduct(id) {
  return bffFetch(`/v1/admin/products/${id}`, { method: 'DELETE', auth: true });
}

export async function adminFetchInventory(productId) {
  return bffFetch(`/v1/admin/inventory/${productId}`, { auth: true });
}

export async function adminFetchUsers() {
  return bffFetch('/v1/admin/users', { auth: true });
}

export async function adminDeleteUser(id) {
  return bffFetch(`/v1/admin/users/${id}`, { method: 'DELETE', auth: true });
}

// ── Reportes (BFF -> Grupo 7). Cold start de Railway/Render: timeout amplio. ──
const REPORT_TIMEOUT_MS = 20000;

export async function fetchSalesReport({ from, to } = {}) {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const qs = params.toString();
  return bffFetch(`/v1/admin/reports/sales${qs ? `?${qs}` : ''}`, {
    auth: true,
    timeout: REPORT_TIMEOUT_MS,
  });
}

export async function fetchOrdersByStatus() {
  return bffFetch('/v1/admin/reports/orders-by-status', { auth: true, timeout: REPORT_TIMEOUT_MS });
}

export async function fetchTopProducts({ page = 1, pageSize = 10 } = {}) {
  const params = new URLSearchParams({ page, pageSize });
  return bffFetch(`/v1/admin/reports/top-products?${params}`, {
    auth: true,
    timeout: REPORT_TIMEOUT_MS,
  });
}

export async function fetchAverageTicket() {
  return bffFetch('/v1/admin/reports/average-ticket', { auth: true, timeout: REPORT_TIMEOUT_MS });
}

export async function fetchPeakHours() {
  return bffFetch('/v1/admin/reports/peak-hours', { auth: true, timeout: REPORT_TIMEOUT_MS });
}

export async function fetchDeliveryPerformance() {
  return bffFetch('/v1/admin/reports/delivery-performance', {
    auth: true,
    timeout: REPORT_TIMEOUT_MS,
  });
}
