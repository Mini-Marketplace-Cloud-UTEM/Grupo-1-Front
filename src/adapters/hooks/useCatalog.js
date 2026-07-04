import { useState, useEffect } from 'react';
import { getProductCatalogUseCase } from '../../config/di.js';

export function useCatalog(search, page) {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Bumpea este contador para volver a pedir los datos (boton "Reintentar").
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getProductCatalogUseCase
      .execute({ q: search, page, pageSize: 6 })
      .then((result) => {
        if (cancelled) return;
        setProducts(result.products);
        setPagination(result.pagination);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [search, page, reloadKey]);

  const retry = () => setReloadKey((k) => k + 1);

  return {
    products,
    pagination,
    loading,
    error,
    retry
  };
}
