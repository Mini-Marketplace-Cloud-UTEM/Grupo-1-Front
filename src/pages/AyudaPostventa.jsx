import '../styles/ayudaPostventa.css';

export default function AyudaPostventa() {
  return (
    <main className="ayuda-page">
      <div className="ayuda-container">
        <section className="ayuda-hero">
          <span className="ayuda-badge">Ayuda / Postventa</span>
          <h1>Centro de ayuda MiniMarketPlace</h1>
          <p>
            Resuelve dudas sobre pedidos, pagos, cambios, devoluciones y soporte al cliente.
          </p>
        </section>

        <section className="ayuda-grid">
          <article className="ayuda-card">
            <div className="ayuda-icon">📦</div>
            <h3>Seguimiento de pedido</h3>
            <p>Consulta el estado de tu compra y futuras actualizaciones de entrega.</p>
          </article>

          <article className="ayuda-card">
            <div className="ayuda-icon">🔄</div>
            <h3>Cambios y devoluciones</h3>
            <p>Revisa las condiciones para solicitar cambios o devolución de productos.</p>
          </article>

          <article className="ayuda-card">
            <div className="ayuda-icon">💳</div>
            <h3>Problemas con el pago</h3>
            <p>Obtén ayuda si tu pago fue rechazado, quedó pendiente o no se confirmó.</p>
          </article>

          <article className="ayuda-card">
            <div className="ayuda-icon">🎧</div>
            <h3>Soporte al cliente</h3>
            <p>Contacta al equipo de soporte para resolver problemas con tu compra.</p>
          </article>
        </section>

        <section className="ayuda-main">
          <div className="ayuda-box">
            <h2>Preguntas frecuentes</h2>

            <details>
              <summary>¿Cómo puedo revisar el estado de mi pedido?</summary>
              <p>
                Próximamente podrás verlo desde la sección Mis pedidos, cuando el seguimiento esté integrado.
              </p>
            </details>

            <details>
              <summary>¿Puedo cambiar o devolver un producto?</summary>
              <p>
                Sí, siempre que el producto cumpla con las condiciones definidas para cambios o devoluciones.
              </p>
            </details>

            <details>
              <summary>¿Qué hago si mi pedido llegó incompleto?</summary>
              <p>
                Debes contactar a soporte indicando tu número de pedido y el problema detectado.
              </p>
            </details>

            <details>
              <summary>¿Dónde puedo ver mi comprobante?</summary>
              <p>
                El comprobante estará disponible en el detalle del pedido cuando esa sección sea implementada.
              </p>
            </details>
          </div>

          <div className="ayuda-box">
            <h2>Contactar soporte</h2>

            <form className="ayuda-form">
              <input type="text" placeholder="Nombre completo" />
              <input type="email" placeholder="Correo electrónico" />
              <input type="text" placeholder="Número de pedido (opcional)" />

              <select defaultValue="">
                <option value="" disabled>Motivo de consulta</option>
                <option>Seguimiento de pedido</option>
                <option>Cambio o devolución</option>
                <option>Problema con el pago</option>
                <option>Otro</option>
              </select>

              <textarea rows="5" placeholder="Cuéntanos en qué podemos ayudarte..." />

              <button type="button">Enviar solicitud</button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}