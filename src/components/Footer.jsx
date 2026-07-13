import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Contacto y Soporte</h4>

          <p>
            <i className="ti ti-phone" aria-hidden="true"></i>{' '}
            Soporte: +56 2 2222 3333
          </p>

          <p>
            <i className="ti ti-mail" aria-hidden="true"></i>{' '}
            contacto@minimarketplace.cl
          </p>

          <p>
            <i className="ti ti-map-pin" aria-hidden="true"></i>{' '}
            Casa Matriz: Santiago, Chile
          </p>
        </div>

        <div className="footer-section">
          <h4>Enlaces de Interés</h4>

          <ul>
            <li>
              <Link to="/terminos-condiciones">
                Términos y Condiciones
              </Link>
            </li>

            <li>
              <Link to="/politica-privacidad">
                Políticas de Privacidad
              </Link>
            </li>

            <li>
              <Link to="/garantia-servicio">
                Garantía y Servicio Técnico
              </Link>
            </li>

            <li>
              <Link to="/centros-retiro">
                Centros de Retiro
              </Link>
            </li>

            <li>
              <Link to="/ayuda-postventa">
                Ayuda y soporte
              </Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Mini MarketPlace Cloud</h4>

          <p>
            Plataforma de comercio electrónico desarrollada bajo principios
            de Clean Architecture y Domain-Driven Design por el Grupo 1.
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} Mini MarketPlace Cloud. Todos los
          derechos reservados. Proyecto Académico Cloud UTEM.
        </p>
      </div>
    </footer>
  );
}