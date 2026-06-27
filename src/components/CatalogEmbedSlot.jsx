import React, { useEffect, useRef } from 'react';

// Slot listo para que Grupo 3 (Catálogo) inyecte su propia UI vía iframe,
// si en algún momento aceptan la propuesta de delegacion (ver
// marketplace-contracts y la conversacion con G3 sobre esto). HOY no se
// usa - Catalog.jsx renderiza el catalogo nosotros mismos, conectado
// directo al BFF. Este componente queda listo pero sin montar en
// ninguna ruta activa.
//
// Para activarlo: reemplazar <Catalog /> por <CatalogEmbedSlot src="URL_QUE_DE_G3" />
// en StorePage.jsx (o en la ruta que corresponda).
//
// Contrato esperado del lado de G3 (a confirmar con ellos si aceptan):
// - URL publica embebible, sin su propio navbar/header, responsive.
// - postMessage({ type: 'ADD_TO_CART', productId, quantity }) al hacer click en "agregar al carro".
// - postMessage({ type: 'RESIZE', height }) cuando cambie el contenido, para ajustar el iframe.
export default function CatalogEmbedSlot({ src, onAddToCart }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    function handleMessage(event) {
      const { type, productId, quantity, height } = event.data || {};

      if (type === 'ADD_TO_CART' && onAddToCart) {
        onAddToCart({ id: productId, quantity: quantity || 1 });
      }

      if (type === 'RESIZE' && iframeRef.current && height) {
        iframeRef.current.style.height = `${height}px`;
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onAddToCart]);

  if (!src) {
    return (
      <div className="page" style={{ padding: '24px' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          CatalogEmbedSlot sin configurar — falta la URL que Grupo 3 debe proveer.
        </p>
      </div>
    );
  }

  return (
    <iframe
      ref={iframeRef}
      src={src}
      title="Catálogo (Grupo 3)"
      sandbox="allow-scripts allow-same-origin"
      style={{ width: '100%', minHeight: '600px', border: 'none' }}
    />
  );
}
