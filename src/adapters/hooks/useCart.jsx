import { createContext, useContext, useRef, useState } from 'react';
import {
  createCart,
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  checkout,
} from '../../api.js';

// Context (misma razon que useAuth): StorePage (/tienda) y ProductPage
// (/productos/:id) son rutas hermanas y necesitan ver el MISMO carro.
// El carro real vive en Grupo 4; aca guardamos su estado normalizado que
// entrega el BFF y lo exponemos con la forma que ya esperan los componentes.
const CartContext = createContext(null);

// Pedidos de demostracion del mockup - el flujo real de pedidos (G5) todavia
// no se cablea aca, se mantienen como estaban.
const DEMO_ORDERS = [
  {
    id: 'ORD-A4F2B1',
    date: '10/06/2026',
    status: 'delivered',
    items: [
      { name: 'Monitor 27"', qty: 1, price: 319990 },
      { name: 'Mouse inalámbrico', qty: 2, price: 24990 }
    ],
    total: 369970
  },
  {
    id: 'ORD-C9D3E8',
    date: '12/06/2026',
    status: 'shipped',
    items: [{ name: 'Notebook Pro 14"', qty: 1, price: 699990 }],
    total: 699990
  },
  {
    id: 'ORD-F1A0B3',
    date: '14/06/2026',
    status: 'processing',
    items: [
      { name: 'Silla ergonómica', qty: 1, price: 189990 },
      { name: 'Lámpara LED', qty: 2, price: 19990 }
    ],
    total: 229970
  }
];

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
  const [cartData, setCartData] = useState(null);
  const [cartError, setCartError] = useState('');
  const [orders, setOrders] = useState(DEMO_ORDERS);
  const [orderSuccessToken, setOrderSuccessToken] = useState('');
  // Id sincrono para no crear dos carritos si el usuario agrega rapido dos
  // productos antes de que el estado de React se actualice.
  const cartIdRef = useRef(null);

  const cartState = toCartState(cartData);

  const ensureCart = async () => {
    if (cartIdRef.current) return cartIdRef.current;
    const created = await createCart();
    cartIdRef.current = created.id;
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
    setCartData(null);
    setCartError('');
  };

  const placeOrder = async (shippingDetails = null, shippingCost = 0) => {
    if (!cartIdRef.current || (cartData?.totalItems || 0) === 0) return null;
    try {
      const result = await checkout(cartIdRef.current);
      const orderId = result?.orderId || result?.checkoutId || result?.id || `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
      
      // Crear pedido para el historial local
      const newOrder = {
        id: orderId,
        date: new Date().toLocaleDateString('es-CL'),
        status: 'pending',
        items: Object.values(toCartState(cartData)).map(x => ({
          name: x.product.name,
          qty: x.qty,
          price: x.product.price
        })),
        total: (cartData?.totalPrice || 0) + shippingCost,
        shippingAddress: shippingDetails ? `${shippingDetails.address}, ${shippingDetails.city}` : 'No especificada',
        shippingCost: shippingCost
      };

      setOrders(prev => [newOrder, ...prev]);
      setOrderSuccessToken(orderId);
      
      setTimeout(() => {
        clearCart();
        setOrderSuccessToken('');
      }, 5000); // Dar suficiente tiempo para la UI de éxito
      
      return { success: true, orderId, order: newOrder };
    } catch (err) {
      throw new Error(err.message || 'Error al procesar el checkout');
    }
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
    orderSuccessToken,
    addToCart,
    changeQty,
    removeItem,
    clearCart,
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
