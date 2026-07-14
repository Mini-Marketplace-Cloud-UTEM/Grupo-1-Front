import { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  createCart,
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  checkoutCart as apiCheckoutCart,
  cancelCheckout as apiCancelCheckout,
  fetchOrders as apiFetchOrders,
} from '../../api.js';
import { useAuth } from './useAuth.jsx';

// Genera una clave estable para el intento de compra. En contexto seguro
// (https / localhost) usa randomUUID; si no, un fallback suficiente para el uso.
function newIdemKey() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// Context (misma razon que useAuth): StorePage (/tienda) y ProductPage
// (/productos/:id) son rutas hermanas y necesitan ver el MISMO carro.
// El carro real vive en Grupo 4; aca guardamos su estado normalizado que
// entrega el BFF y lo exponemos con la forma que ya esperan los componentes.
const CartContext = createContext(null);

// El carro vive en Grupo 4 y se identifica por su id. Persistimos ESE id en
// localStorage para recuperar el mismo carro tras un refresco de pagina (G4
// no asocia el carro al usuario, asi que la referencia la mantenemos aca).
const CART_ID_KEY = 'cartId';

// Pedidos reales: vienen del BFF (-> Grupo 5). El componente Orders espera el
// status en minuscula (pending/processing/shipped/delivered/cancelled); G5 usa
// UPPER_SNAKE. Este mapa traduce el ciclo de vida de G5 a los 4 pasos de la UI.
const G5_STATUS_UI = {
  CREATED: 'pending',
  PAYMENT_PENDING: 'pending',
  PAID: 'processing',
  STOCK_RESERVED: 'processing',
  READY_TO_SHIP: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  FAILED: 'cancelled',
};

// Del Order de G5 (camelCase) a la forma que consume el componente Orders.
function mapG5Order(o) {
  return {
    id: o.orderId,
    status: G5_STATUS_UI[o.status] || 'pending',
    date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('es-CL') : '',
    items: (o.items || []).map((it) => ({ name: it.name, qty: it.quantity, price: it.unitPrice })),
    total: o.totalAmount ?? 0,
  };
}

// Del carro normalizado del BFF (items: [{itemId, productId, name, unitPrice,
// quantity, subtotal}]) al mapa keyed por productId que consumen Catalog,
// LandingTab (cart[p.id]?.qty) y Cart (item.product.{id,name,price}, item.qty).
function toCartState(cartData) {
  const map = {};
  for (const it of cartData?.items || []) {
    map[it.productId] = {
      product: { id: it.productId, name: it.name, price: it.unitPrice },
      qty: it.quantity,
      itemId: it.itemId,
    };
  }
  return map;
}

export function CartProvider({ children }) {
  // El token lo expone AuthProvider, que envuelve a este provider. Lo usamos
  // para re-asociar el carro de invitado al usuario cuando inicia sesion.
  const { token } = useAuth();
  const [cartData, setCartData] = useState(null);
  const [cartError, setCartError] = useState('');
  const [orders, setOrders] = useState([]);
  const [ordersError, setOrdersError] = useState(false);
  const [orderSuccessToken, setOrderSuccessToken] = useState('');
  // Id sincrono para no crear dos carritos si el usuario agrega rapido dos
  // productos antes de que el estado de React se actualice. Arranca con el id
  // persistido (si lo hay) para recuperar el carro tras un refresco.
  const cartIdRef = useRef(localStorage.getItem(CART_ID_KEY) || null);
  // Idempotency-Key del intento de compra en curso: se fija al reservar y se
  // reutiliza al completar, para que un reintento no genere un pedido duplicado.
  const checkoutKeyRef = useRef(null);

  const cartState = toCartState(cartData);

  // Al montar, si hay un carro guardado, lo recupera desde G4 (via BFF) para
  // que sobreviva al refresco. Si ya no existe (expiro / se limpio), soltamos
  // la referencia en silencio en vez de romper la vista.
  useEffect(() => {
    const savedId = cartIdRef.current;
    if (!savedId) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getCart(savedId);
        if (!cancelled) setCartData(data);
      } catch {
        if (!cancelled) {
          cartIdRef.current = null;
          localStorage.removeItem(CART_ID_KEY);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Re-asociacion del carro de invitado (contrato G4, aclarado 2026-07-11):
  // G4 vincula el carro al usuario "al vuelo" apenas recibe UNA llamada
  // autenticada con ese mismo cartId (saca el userId del JWT, nunca del body).
  // El fetch de arriba ya lleva el token si la sesion venia persistida; este
  // efecto cubre el caso "el usuario inicia sesion DURANTE la visita con un
  // carro de invitado ya armado": al aparecer el token, re-tocamos el carro
  // para gatillar el bind. Saltamos el primer render para no duplicar el fetch.
  const authBindReady = useRef(false);
  useEffect(() => {
    if (!authBindReady.current) { authBindReady.current = true; return; }
    if (!token || !cartIdRef.current) return;
    let cancelled = false;
    getCart(cartIdRef.current)
      .then((data) => { if (!cancelled) setCartData(data); })
      .catch(() => { /* si el carro ya no existe, el flujo normal lo maneja */ });
    return () => { cancelled = true; };
  }, [token]);

  // "Mis pedidos" reales (BFF -> G5). Se cargan cuando hay sesion y se vacian al
  // cerrar sesion. G5 devuelve {data, pagination}; mapeamos a la forma de la UI.
  const loadOrders = async () => {
    try {
      const res = await apiFetchOrders();
      setOrders((res?.data || []).map(mapG5Order));
      setOrdersError(false);
    } catch {
      setOrdersError(true);
    }
  };

  useEffect(() => {
    if (!token) {
      setOrders([]);
      setOrdersError(false);
      return;
    }
    loadOrders();
  }, [token]);

  const ensureCart = async () => {
    if (cartIdRef.current) return cartIdRef.current;
    const created = await createCart();
    cartIdRef.current = created.id;
    localStorage.setItem(CART_ID_KEY, created.id);
    setCartData(created);
    return created.id;
  };

  const addToCart = async (product, qty = 1) => {
    setCartError('');
    try {
      const cartId = await ensureCart();
      setCartData(await addCartItem(cartId, product.id, qty));
    } catch (err) {
      setCartError(err.message);
      alert(err.message);
    }
  };

  const changeQty = async (productId, delta) => {
    const entry = cartState[productId];
    if (!entry || !cartIdRef.current) return;
    const newQty = entry.qty + delta;
    setCartError('');
    try {
      if (newQty <= 0) {
        await removeCartItem(cartIdRef.current, entry.itemId);
        setCartData(await getCart(cartIdRef.current));
      } else {
        setCartData(await updateCartItem(cartIdRef.current, entry.itemId, newQty));
      }
    } catch (err) {
      setCartError(err.message);
      alert(err.message);
    }
  };

  const removeItem = async (productId) => {
    const entry = cartState[productId];
    if (!entry || !cartIdRef.current) return;
    setCartError('');
    try {
      await removeCartItem(cartIdRef.current, entry.itemId);
      setCartData(await getCart(cartIdRef.current));
    } catch (err) {
      setCartError(err.message);
      alert(err.message);
    }
  };

  // G4 no expone "vaciar carrito"; soltamos la referencia local (se usa al
  // cerrar sesion y tras generar el pedido). El carro en G4 queda huerfano.
  const clearCart = () => {
    cartIdRef.current = null;
    checkoutKeyRef.current = null;
    localStorage.removeItem(CART_ID_KEY);
    setCartData(null);
    setCartError('');
  };

  // Cancela el checkout en G4 para liberar el stock reservado (botón "Cancelar"
  // de las pantallas de despacho/pago). Best-effort: G4 igual libera por TTL.
  const cancelCheckoutFlow = async () => {
    if (!cartIdRef.current) return;
    try {
      await apiCancelCheckout(cartIdRef.current);
    } catch {
      /* best-effort */
    }
  };

  // Inicia el checkout real contra el super-endpoint de G4: G4 reserva el stock,
  // cotiza el despacho, crea el pedido (G5) e inicia el pago (G8). Devuelve
  // { message, status, orderId, paymentUrl, shippingCost, totalAmount }. El caller
  // redirige a paymentUrl (MercadoPago). Si no hay stock, G4 responde 409.
  const placeOrder = async (shippingDetails = null) => {
    if (!cartIdRef.current || (cartData?.totalItems || 0) === 0) return null;
    const idemKey = checkoutKeyRef.current || newIdemKey();
    checkoutKeyRef.current = idemKey;
    const shippingAddress = shippingDetails
      ? {
          street: shippingDetails.address || '',
          city: shippingDetails.city || '',
          region: shippingDetails.region || 'Región Metropolitana',
          country: 'Chile',
          postalCode: shippingDetails.postalCode || null,
        }
      : null;

    const result = await apiCheckoutCart(
      cartIdRef.current,
      { shippingAddress, notes: shippingDetails?.notes || '' },
      idemKey,
    );

    // Pedido creado (queda PAYMENT_PENDING). Limpiamos el carro local solo si de
    // verdad vamos a redirigir al pago; el historial se refresca al volver.
    if (result?.paymentUrl) {
      // Guardar un resumen para las pantallas de retorno de MercadoPago
      // (/success, /pending), que se cargan como recarga completa tras el pago.
      try {
        const items = Object.values(toCartState(cartData)).map((x) => ({
          name: x.product.name,
          qty: x.qty,
          price: x.product.price,
        }));
        localStorage.setItem(
          'lastCheckout',
          JSON.stringify({
            orderId: result.orderId || null,
            totalAmount: result.totalAmount ?? null,
            shippingCost: result.shippingCost ?? null,
            currency: 'CLP',
            items,
            at: Date.now(),
          }),
        );
      } catch {
        /* almacenamiento no disponible: la pantalla de retorno mostrará lo genérico */
      }
      setOrderSuccessToken(result.orderId || '');
      clearCart();
    }
    return { success: true, ...result };
  };

  const clearOrders = () => {
    setOrders([]);
  };

  const value = {
    cartState,
    cartCount: cartData?.totalItems || 0,
    cartTotal: cartData?.totalPrice || 0,
    cartError,
    orders,
    ordersError,
    orderSuccessToken,
    addToCart,
    changeQty,
    removeItem,
    clearCart,
    cancelCheckoutFlow,
    placeOrder,
    clearOrders
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart debe usarse dentro de <CartProvider>');
  }
  return ctx;
}
