import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Tabs from './components/Tabs';
import Login from './components/Login';
import Catalog from './components/Catalog';
import Cart from './components/Cart';
import Orders from './components/Orders';
import Footer from './components/Footer';
import ProductDetail from './components/ProductDetail';

import { useAuth } from './adapters/hooks/useAuth.js';
import { useCart } from './adapters/hooks/useCart.js';

export default function App() {
  const {
    isLoggedIn,
    user,
    login,
    logout,
    setAuthenticatedUser
  } = useAuth();

  const [activeTab, setActiveTab] = useState('catalog');
  const [selectedProduct, setSelectedProduct] = useState(null);
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
    seedOrders,
    clearOrders
  } = useCart();

  // Handle Login success
  const handleLoginSuccess = (userName, jwtToken) => {
    setAuthenticatedUser(userName, jwtToken);
    // Semillar órdenes al iniciar sesión
    seedOrders([
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
    logout();
    clearCart();
    clearOrders();
    setSearch('');
    setPage(1);
  };

  // Ajustes de búsqueda
  const handleSearchChange = (query) => {
    setSearch(query);
    setPage(1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== 'detail') {
      setSelectedProduct(null);
    }
  };

  return (
    <div className="app">
      <Navbar
        user={user}
        cartCount={cartCount}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
        search={search}
        onSearchChange={handleSearchChange}
        isLoggedIn={isLoggedIn}
      />
      
      <Tabs
        activeTab={activeTab === 'detail' ? 'catalog' : activeTab}
        onTabChange={handleTabChange}
        isLoggedIn={isLoggedIn}
      />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!isLoggedIn ? (
          <Login onLogin={login} onLoginSuccess={handleLoginSuccess} />
        ) : (
          <>
            {activeTab === 'catalog' && (
              <Catalog
                search={search}
                cart={cartState}
                onAddToCart={addToCart}
                page={page}
                onPageChange={setPage}
                onSelectProduct={(p) => {
                  setSelectedProduct(p);
                  setActiveTab('detail');
                }}
              />
            )}
            {activeTab === 'detail' && (
              <ProductDetail
                product={selectedProduct}
                onBack={() => {
                  setSelectedProduct(null);
                  setActiveTab('catalog');
                }}
                onAddToCart={addToCart}
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
            {activeTab === 'orders' && (
              <Orders
                orders={orders}
                error={false} // Puede setearse a true para simular error de red
              />
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

