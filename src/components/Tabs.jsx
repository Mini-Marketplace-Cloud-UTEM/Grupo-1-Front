import React from 'react';

export default function Tabs({ activeTab, onTabChange, isLoggedIn }) {
  // Se muestra siempre: la tienda es publica. Solo "Mis pedidos" pide sesion.
  return (
    <div className="tabs" id="main-tabs">
      <div
        className={`tab ${activeTab === 'inicio' ? 'active' : ''}`}
        onClick={() => onTabChange('inicio')}
        id="tab-inicio"
      >
        Inicio
      </div>
      <div
        className={`tab ${activeTab === 'catalog' ? 'active' : ''}`}
        onClick={() => onTabChange('catalog')}
        id="tab-catalog"
      >
        Catálogo
      </div>
      <div
        className={`tab ${activeTab === 'cart' ? 'active' : ''}`}
        onClick={() => onTabChange('cart')}
        id="tab-cart"
      >
        Carrito
      </div>
      <div
        className={`tab ${activeTab === 'favorites' ? 'active' : ''}`}
        onClick={() => onTabChange('favorites')}
        id="tab-favorites"
      >
        Favoritos
      </div>
      {isLoggedIn && (
        <div
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => onTabChange('orders')}
          id="tab-orders"
        >
          Mis pedidos
        </div>
      )}
    </div>
  );
}
