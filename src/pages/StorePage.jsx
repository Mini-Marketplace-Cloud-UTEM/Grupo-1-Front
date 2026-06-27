import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Tabs from '../components/Tabs';
import Catalog from '../components/Catalog';
import Cart from '../components/Cart';
import Orders from '../components/Orders';
import Footer from '../components/Footer';
import { useAuth } from '../adapters/hooks/useAuth.jsx';
import { useCart } from '../adapters/hooks/useCart.js';

// Pedidos de demostracion del mockup (antes se cargaban via seedOrders()
// al iniciar sesion en App.jsx; con el routing nuevo se inicializan aqui
// directo, ya que useCart() solo vive dentro de StorePage).
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

// Tienda principal (catalogo/carro/pedidos). Requiere sesion iniciada -
// el guard de ruta vive en App.jsx (RequireAuth).
export default function StorePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('catalog');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const {
    cartState,
    cartCount,
    orders,
    orderSuccessToken,
    addToCart,
    changeQty,
    removeItem,
    clearCart,
    placeOrder,
    clearOrders
  } = useCart(DEMO_ORDERS);

  const handleLogout = () => {
    logout();
    clearCart();
    clearOrders();
    setSearch('');
    setPage(1);
    navigate('/');
  };

  const handleSearchChange = (query) => {
    setSearch(query);
    setPage(1);
  };

  return (
    <div className="app">
      <Navbar
        user={user}
        cartCount={cartCount}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        search={search}
        onSearchChange={handleSearchChange}
        isLoggedIn={true}
      />

      <Tabs activeTab={activeTab} onTabChange={setActiveTab} isLoggedIn={true} />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'catalog' && (
          <Catalog
            search={search}
            cart={cartState}
            onAddToCart={addToCart}
            page={page}
            onPageChange={setPage}
          />
        )}
        {activeTab === 'cart' && (
          <Cart
            cart={cartState}
            onQtyChange={changeQty}
            onRemoveItem={removeItem}
            onClearCart={clearCart}
            onPlaceOrder={placeOrder}
            orderSuccessToken={orderSuccessToken}
            onGoToCatalog={() => setActiveTab('catalog')}
          />
        )}
        {activeTab === 'orders' && <Orders orders={orders} error={false} />}
      </main>
      <Footer />
    </div>
  );
}
