import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import '../styles/paginasInformativas.css';

export default function TerminosCondiciones() {
  return (
    <div className="info-page">
      <header className="info-header">
        <Link to="/" className="info-brand">
          <span className="info-logo">⚡</span>

          <span>
            Mini<span>MarketPlace</span>
          </span>
        </Link>

        <Link to="/" className="info-back-link">
          ← Volver al inicio
        </Link>
      </header>

      <main className="info-container">
        <section className="info-hero">
          <span className="info-badge">
            Información legal
          </span>

          <h1>Términos y Condiciones</h1>

          <p>
            En esta sección se explican las condiciones generales para navegar,
            registrarse y realizar compras dentro de MiniMarketPlace.
          </p>

          <div className="info-update">
            Última actualización: julio de 2026
          </div>
        </section>

        <div className="info-layout">
          <aside className="info-index">
            <h2>Contenido</h2>

            <nav>
              <a href="#general">1. Información general</a>
              <a href="#registro">2. Registro y cuenta</a>
              <a href="#productos">3. Productos y disponibilidad</a>
              <a href="#compras">4. Proceso de compra</a>
              <a href="#pagos">5. Pagos</a>
              <a href="#entrega">6. Entrega y retiro</a>
              <a href="#cambios">7. Cambios y devoluciones</a>
              <a href="#responsabilidad">8. Responsabilidad del usuario</a>
              <a href="#modificaciones">9. Modificaciones</a>
              <a href="#contacto">10. Contacto</a>
            </nav>
          </aside>

          <article className="info-content">
            <section id="general">
              <h2>1. Información general</h2>

              <p>
                MiniMarketPlace es una plataforma de comercio electrónico que
                permite consultar productos, revisar sus características,
                agregarlos al carrito y gestionar el proceso de compra.
              </p>

              <p>
                La navegación por el catálogo es pública. Para finalizar una
                compra, el usuario deberá iniciar sesión y proporcionar los
                antecedentes solicitados durante el proceso.
              </p>
            </section>

            <section id="registro">
              <h2>2. Registro y cuenta de usuario</h2>

              <p>
                El usuario es responsable de entregar información correcta,
                actualizada y completa al momento de crear su cuenta.
              </p>

              <p>
                Las credenciales de acceso son personales. El usuario deberá
                proteger su contraseña y evitar compartirla con otras personas.
              </p>
            </section>

            <section id="productos">
              <h2>3. Productos y disponibilidad</h2>

              <p>
                La plataforma muestra información sobre el nombre, categoría,
                precio, imagen y disponibilidad de los productos publicados.
              </p>

              <p>
                La disponibilidad puede cambiar durante el proceso de compra.
                Un producto agregado al carrito no se considera reservado hasta
                que el sistema confirme la operación correspondiente.
              </p>
            </section>

            <section id="compras">
              <h2>4. Proceso de compra</h2>

              <p>
                Antes de confirmar una compra, el usuario podrá revisar los
                productos seleccionados, las cantidades, el precio y los datos
                relacionados con la entrega.
              </p>

              <p>
                La compra se considerará registrada cuando el sistema genere
                una confirmación y la muestre al usuario.
              </p>
            </section>

            <section id="pagos">
              <h2>5. Pagos</h2>

              <p>
                Los medios de pago disponibles serán informados durante el
                proceso de compra. La aprobación de la operación dependerá del
                resultado entregado por el servicio de pago correspondiente.
              </p>

              <p>
                Si una operación es rechazada o queda pendiente, el usuario
                deberá revisar el estado del pago antes de intentar nuevamente.
              </p>
            </section>

            <section id="entrega">
              <h2>6. Entrega y retiro</h2>

              <p>
                Las alternativas de despacho o retiro disponibles se mostrarán
                antes de finalizar la compra.
              </p>

              <p>
                El usuario deberá comprobar que sus datos de contacto y entrega
                sean correctos antes de confirmar el pedido.
              </p>
            </section>

            <section id="cambios">
              <h2>7. Cambios y devoluciones</h2>

              <p>
                Las solicitudes de cambio, devolución o revisión de un producto
                deberán gestionarse mediante los canales de ayuda y postventa
                habilitados por MiniMarketPlace.
              </p>

              <p>
                Para revisar una solicitud, podrá requerirse el número de
                pedido, el comprobante de compra y antecedentes del producto.
              </p>
            </section>

            <section id="responsabilidad">
              <h2>8. Responsabilidad del usuario</h2>

              <p>
                El usuario se compromete a utilizar la plataforma de manera
                responsable y a no realizar acciones que puedan afectar su
                funcionamiento, seguridad o disponibilidad.
              </p>

              <p>
                No está permitido utilizar datos falsos, acceder a cuentas
                ajenas o intentar alterar el proceso normal de compra.
              </p>
            </section>

            <section id="modificaciones">
              <h2>9. Modificaciones de estas condiciones</h2>

              <p>
                MiniMarketPlace podrá actualizar estas condiciones cuando se
                incorporen nuevas funcionalidades o se modifique el
                funcionamiento de la plataforma.
              </p>

              <p>
                La fecha de la última actualización será informada al comienzo
                de esta página.
              </p>
            </section>

            <section id="contacto">
              <h2>10. Contacto y consultas</h2>

              <p>
                Para realizar consultas sobre estas condiciones, el usuario
                puede ingresar al centro de ayuda y utilizar los canales de
                soporte disponibles.
              </p>

              <Link to="/ayuda-postventa" className="info-support-button">
                Ir a Ayuda y soporte
              </Link>
            </section>

            <div className="info-notice">
              <strong>Importante:</strong> Esta plataforma corresponde a un
              proyecto académico desarrollado por estudiantes de la Universidad
              Tecnológica Metropolitana.
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}