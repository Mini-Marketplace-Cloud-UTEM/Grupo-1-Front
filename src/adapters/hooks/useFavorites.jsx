import React, { createContext, useContext, useState, useEffect } from 'react';

// Contexto global para favoritos persistido en localStorage
const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (product) => {
    if (!favorites.some((p) => p.id === product.id)) {
      // Guardar el modelo mínimo normalizado
      setFavorites([...favorites, {
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        category: product.category,
        inStock: product.inStock ?? true
      }]);
    }
  };

  const removeFavorite = (productId) => {
    setFavorites(favorites.filter((p) => p.id !== productId));
  };

  const isFavorite = (productId) => {
    return favorites.some((p) => p.id === productId);
  };

  const toggleFavorite = (product) => {
    if (isFavorite(product.id)) {
      removeFavorite(product.id);
    } else {
      addFavorite(product);
    }
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  const value = {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    clearFavorites
  };

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites debe usarse dentro de <FavoritesProvider>');
  }
  return ctx;
}
