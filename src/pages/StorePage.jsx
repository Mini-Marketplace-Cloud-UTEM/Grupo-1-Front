import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Tabs from '../components/Tabs';
import Catalog from '../components/Catalog';
import Cart from '../components/Cart';
import Orders from '../components/Orders';
import Footer from '../components/Footer';
import LandingTab from '../components/LandingTab';
import Favorites from '../components/Favorites';
import { useAuth } from '../adapters/hooks/useAuth.jsx';
import { useCart } from '../adapters/hooks/useCart.jsx';

// Tienda principal (catalogo/carro/pedidos). Es PUBLICA: un invitado puede
// ver el catalogo y armar el carrito. Solo pagar ("Generar pedido") y "Mis
// pedidos" exigen sesion. El carro/pedidos vienen de CartProvider (Context)
// para compartir estado con ProductPage.
export default function StorePage() {
  const navigate = useNavigate();
  const { user, logout, isLoggedIn } = useAuth();

  const [activeTab, setActiveTab] = useState('inicio');
  const [catalogCategory, setCatalogCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const {
    cartState,
    cartCount,
    cartTotal,
    orders,
    ordersError,
    orderSuccessToken,
    addToCart,
    changeQty,
    removeItem,
    clearCart,
    clearOrders
  } = useCart();

  const handleLogout = () => {
    logout();
    clearCart();
    clearOrders();
    setSearch('');
    setPage(1);
    setCatalogCategory('all');
    navigate('/');
  };

  const handleSearchChange = (query) => {
    setSearch(query);
    setPage(1);
  };

  const handleGoToCatalogFromLanding = (category) => {
    setCatalogCategory(category);
    setActiveTab('catalog');
  };

  return (
    <div className="app">
      <Navbar
        user={user?.name}
        cartCount={cartCount}
        onTabChange={(tab) => {
          if (tab !== 'catalog') {
            setCatalogCategory('all');
          }
          setActiveTab(tab);
        }}
        onLogout={handleLogout}
        onLogin={() => navigate('/login')}
        search={search}
        onSearchChange={handleSearchChange}
        isLoggedIn={isLoggedIn}
      />

      <Tabs
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab !== 'catalog') {
            setCatalogCategory('all');
          }
          setActiveTab(tab);
        }}
        isLoggedIn={isLoggedIn}
      />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'inicio' && (
          <LandingTab
            onGoToCatalog={handleGoToCatalogFromLanding}
            onAddToCart={addToCart}
            cart={cartState}
          />
        )}
        {activeTab === 'catalog' && (
          <Catalog
            key={catalogCategory}
            initialCategory={catalogCategory}
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
            total={cartTotal}
            onQtyChange={changeQty}
            onRemoveItem={removeItem}
            onClearCart={clearCart}
            onPlaceOrder={() => navigate(isLoggedIn ? '/checkout' : '/login')}
            orderSuccessToken={orderSuccessToken}
            onGoToCatalog={() => handleGoToCatalogFromLanding('all')}
          />
        )}
        {activeTab === 'favorites' && (
          <Favorites
            onGoToCatalog={() => handleGoToCatalogFromLanding('all')}
          />
        )}
        {activeTab === 'orders' && <Orders orders={orders} error={ordersError} />}
      </main>
      <Footer />
    </div>
  );
}
