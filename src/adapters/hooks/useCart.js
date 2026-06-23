import { useState } from 'react';
import { Cart } from '../../domain/entities/Cart.js';
import { placeOrderUseCase } from '../../config/di.js';

export function useCart(initialOrders = []) {
  const [cartState, setCartState] = useState({});
  const [orders, setOrders] = useState(initialOrders);
  const [orderSuccessToken, setOrderSuccessToken] = useState('');

  const cart = Cart.fromState(cartState);

  const addToCart = (product) => {
    try {
      cart.addItem(product, 1);
      setCartState(cart.toState());
    } catch (err) {
      alert(err.message);
    }
  };

  const changeQty = (productId, delta) => {
    cart.changeQty(productId, delta);
    setCartState(cart.toState());
  };

  const removeItem = (productId) => {
    cart.removeItem(productId);
    setCartState(cart.toState());
  };

  const clearCart = () => {
    cart.clear();
    setCartState(cart.toState());
  };

  const placeOrder = async () => {
    if (cart.count === 0) return;
    try {
      const order = await placeOrderUseCase.execute(cart);
      setOrders((prev) => [order, ...prev]);
      setOrderSuccessToken(order.id);

      setTimeout(() => {
        cart.clear();
        setCartState(cart.toState());
        setOrderSuccessToken('');
      }, 1600);
    } catch (err) {
      alert('Error al generar pedido: ' + err.message);
    }
  };

  const seedOrders = (initialList) => {
    setOrders(initialList);
  };

  const clearOrders = () => {
    setOrders([]);
  };

  return {
    cartState,
    cartCount: cart.count,
    orders,
    orderSuccessToken,
    addToCart,
    changeQty,
    removeItem,
    clearCart,
    placeOrder,
    seedOrders,
    clearOrders
  };
}
