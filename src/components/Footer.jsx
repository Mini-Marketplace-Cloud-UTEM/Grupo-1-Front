import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Contacto y Soporte</h4>
          <p><i className="ti ti-phone" aria-hidden="true"></i> Soporte: +56 2 2222 3333</p>
          <p><i className="ti ti-mail" aria-hidden="true"></i> contacto@minimarketplace.cl</p>
          <p><i className="ti ti-map-pin" aria-hidden="true"></i> Casa Matriz: Santiago, Chile</p>
        </div>
        <div className="footer-section">
          <h4>Enlaces de Interés</h4>
          <ul>
            <li><a href="#terminos">Términos y Condiciones</a></li>
            <li><a href="#privacidad">Políticas de Privacidad</a></li>
            <li><a href="#garantias">Garantía y Servicio Técnico</a></li>
            <li><a href="#tiendas">Centros de Retiro</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Mini MarketPlace Cloud</h4>
          <p>Mockup modular del mini-marketplace desarrollado bajo principios de Clean Architecture & Domain-Driven Design (Grupo 1).</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Mini MarketPlace Cloud. Todos los derechos reservados. Proyecto Académico Cloud UTEM.</p>
      </div>
    </footer>
  );
}
