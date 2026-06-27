import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductById } from '../api';

// Esqueleto de pagina de producto especifico. Se llega aqui al hacer
// click en un producto desde el catalogo (Catalog.jsx -> /productos/:id).
// Pendiente de desarrollar a detalle: galeria de imagenes, productos
// relacionados, reviews, etc. Por ahora solo nombre/precio/descripcion/
// detalles basicos, ya conectado de verdad al BFF (GET /v1/products/{id}).
export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fmt = (n) => '$' + n.toLocaleString('es-CL');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchProductById(id)
      .then((data) => !cancelled && setProduct(data))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="page" style={{ padding: '24px' }}>
      <Link to="/tienda">&larr; Volver al catálogo</Link>

      {loading && <p>Cargando producto...</p>}
      {error && <p style={{ color: 'crimson' }}>Error al cargar el producto: {error}</p>}

      {product && (
        <div style={{ marginTop: '16px' }}>
          <h1>{product.name}</h1>
          <p className="product-price" style={{ fontSize: '20px' }}>
            {fmt(product.price)}
          </p>
          <p>{product.description || 'Sin descripción disponible.'}</p>

          {/* TODO: detalles/atributos especificos (talla, color, etc.) */}
          <ul>
            <li>Categoría: {product.category}</li>
            <li>Disponibilidad: {product.inStock ? 'Disponible' : 'Sin stock'}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
