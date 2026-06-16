import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Tabs from './components/Tabs';
import Login from './components/Login';
import Catalog from './components/Catalog';
import Cart from './components/Cart';
import Orders from './components/Orders';
import { PRODUCTS } from './data/products';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  
  const [activeTab, setActiveTab] = useState('catalog');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  
  const [cart, setCart] = useState({});
  const [orders, setOrders] = useState([]);
  const [orderSuccessToken, setOrderSuccessToken] = useState('');

  // Handle Login success
  const handleLoginSuccess = (userName, jwtToken) => {
    setUser(userName);
    setToken(jwtToken);
    setIsLoggedIn(true);
    // Seed orders
    setOrders([
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
    ]);
    setActiveTab('catalog');
  };

  // Handle Logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setToken(null);
    setUser(null);
    setCart({});
    setOrders([]);
    setCategory('all');
    setSearch('');
    setPage(1);
    setOrderSuccessToken('');
  };

  // Add to cart with stock validations
  const handleAddToCart = (id) => {
    const p = PRODUCTS.find((x) => x.id === id);
    if (!p || p.stock === 0) return;
    setCart((prevCart) => {
      const existing = prevCart[id];
      const currentQty = existing ? existing.qty : 0;
      if (currentQty >= p.stock) return prevCart;
      return {
        ...prevCart,
        [id]: { product: p, qty: currentQty + 1 }
      };
    });
  };

  // Modify cart item qty
  const handleChangeQty = (id, delta) => {
    const p = PRODUCTS.find((x) => x.id === id);
    if (!p) return;
    setCart((prevCart) => {
      const existing = prevCart[id];
      if (!existing) return prevCart;
      const newQty = Math.max(0, Math.min(p.stock, existing.qty + delta));
      if (newQty === 0) {
        const nextCart = { ...prevCart };
        delete nextCart[id];
        return nextCart;
      }
      return {
        ...prevCart,
        [id]: { ...existing, qty: newQty }
      };
    });
  };

  // Remove cart item
  const handleRemoveItem = (id) => {
    setCart((prevCart) => {
      const nextCart = { ...prevCart };
      delete nextCart[id];
      return nextCart;
    });
  };

  // Clear cart
  const handleClearCart = () => {
    setCart({});
  };

  // Place order
  const handlePlaceOrder = () => {
    const items = Object.values(cart).filter((x) => x.qty > 0);
    if (items.length === 0) return;
    const total = items.reduce((acc, { product: p, qty }) => acc + p.price * qty, 0);
    const orderId = 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const statuses = ['pending', 'processing', 'shipped', 'delivered'];
    const status = statuses[Math.floor(Math.random() * 2)];

    const newOrder = {
      id: orderId,
      date: new Date().toLocaleDateString('es-CL'),
      status,
      items: items.map(({ product: p, qty }) => ({ name: p.name, qty, price: p.price })),
      total
    };

    setOrders((prevOrders) => [newOrder, ...prevOrders]);
    setOrderSuccessToken(orderId);

    setTimeout(() => {
      setCart({});
      setOrderSuccessToken('');
    }, 1600);
  };

  // Filter state adjustments
  const handleCategoryChange = (catName) => {
    setCategory(catName);
    setPage(1);
  };

  const handleSearchChange = (query) => {
    setSearch(query);
    setPage(1);
  };

  const cartCount = Object.values(cart).reduce((acc, item) => acc + item.qty, 0);

  return (
    <div className="app">
      <Navbar
        user={user}
        cartCount={cartCount}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        search={search}
        onSearchChange={handleSearchChange}
        isLoggedIn={isLoggedIn}
      />
      
      <Tabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isLoggedIn={isLoggedIn}
      />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!isLoggedIn ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : (
          <>
            {activeTab === 'catalog' && (
              <Catalog
                search={search}
                category={category}
                onCategoryChange={handleCategoryChange}
                cart={cart}
                onAddToCart={handleAddToCart}
                page={page}
                onPageChange={setPage}
              />
            )}
            {activeTab === 'cart' && (
              <Cart
                cart={cart}
                onQtyChange={handleChangeQty}
                onRemoveItem={handleRemoveItem}
                onClearCart={handleClearCart}
                onPlaceOrder={handlePlaceOrder}
                orderSuccessToken={orderSuccessToken}
                onGoToCatalog={() => setActiveTab('catalog')}
              />
            )}
            {activeTab === 'orders' && (
              <Orders
                orders={orders}
                error={false} // can be set to true if simulating server failure
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
