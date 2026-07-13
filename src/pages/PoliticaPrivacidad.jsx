import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import '../styles/paginasInformativas.css';

export default function PoliticaPrivacidad() {
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
            Privacidad y seguridad
          </span>

          <h1>Políticas de Privacidad</h1>

          <p>
            Conoce qué información puede utilizar MiniMarketPlace, para qué se
            utiliza y cuáles son las medidas aplicadas para proteger los datos
            de los usuarios.
          </p>

          <div className="info-update">
            Última actualización: julio de 2026
          </div>
        </section>

        <div className="info-layout">
          <aside className="info-index">
            <h2>Contenido</h2>

            <nav>
              <a href="#introduccion">1. Introducción</a>
              <a href="#datos">2. Datos recopilados</a>
              <a href="#uso">3. Uso de la información</a>
              <a href="#cuenta">4. Datos de la cuenta</a>
              <a href="#compras">5. Información de compras</a>
              <a href="#seguridad">6. Seguridad</a>
              <a href="#terceros">7. Servicios externos</a>
              <a href="#cookies">8. Cookies y almacenamiento</a>
              <a href="#derechos">9. Derechos del usuario</a>
              <a href="#contacto">10. Contacto</a>
            </nav>
          </aside>

          <article className="info-content">
            <section id="introduccion">
              <h2>1. Introducción</h2>

              <p>
                MiniMarketPlace reconoce la importancia de proteger la
                información entregada por sus usuarios durante la navegación,
                el registro y el proceso de compra.
              </p>

              <p>
                Esta política explica de manera general cómo pueden ser
                utilizados los datos dentro de la plataforma.
              </p>
            </section>

            <section id="datos">
              <h2>2. Información que puede recopilarse</h2>

              <p>
                Dependiendo de las funciones utilizadas, la plataforma puede
                solicitar o almacenar información como:
              </p>

              <div className="info-card-grid">
                <article className="info-card">
                  <div className="info-card-icon">👤</div>

                  <h3>Datos personales</h3>

                  <p>
                    Nombre, correo electrónico y antecedentes utilizados para
                    identificar la cuenta del usuario.
                  </p>
                </article>

                <article className="info-card">
                  <div className="info-card-icon">📦</div>

                  <h3>Datos del pedido</h3>

                  <p>
                    Productos seleccionados, cantidades, estado del pedido y
                    antecedentes asociados a la entrega.
                  </p>
                </article>

                <article className="info-card">
                  <div className="info-card-icon">💳</div>

                  <h3>Información de pago</h3>

                  <p>
                    Estado de la transacción y referencias necesarias para
                    confirmar el resultado de una operación.
                  </p>
                </article>

                <article className="info-card">
                  <div className="info-card-icon">🖥️</div>

                  <h3>Datos técnicos</h3>

                  <p>
                    Información básica de navegación necesaria para mantener
                    la sesión y permitir el funcionamiento de la plataforma.
                  </p>
                </article>
              </div>
            </section>

            <section id="uso">
              <h2>3. Uso de la información</h2>

              <p>
                La información podrá utilizarse para permitir el funcionamiento
                de las principales características de MiniMarketPlace.
              </p>

              <ul>
                <li>Crear y administrar cuentas de usuario.</li>
                <li>Permitir el inicio y cierre de sesión.</li>
                <li>Gestionar productos agregados al carrito.</li>
                <li>Registrar y consultar pedidos.</li>
                <li>Procesar el estado de una compra.</li>
                <li>Atender solicitudes de ayuda y postventa.</li>
                <li>Detectar errores o usos indebidos de la plataforma.</li>
              </ul>
            </section>

            <section id="cuenta">
              <h2>4. Información de la cuenta</h2>

              <p>
                Los datos de acceso permiten identificar al usuario y mantener
                disponibles las funciones asociadas a su cuenta.
              </p>

              <p>
                El usuario es responsable de mantener la confidencialidad de
                sus credenciales y de informar cualquier acceso que considere
                irregular.
              </p>
            </section>

            <section id="compras">
              <h2>5. Información relacionada con compras</h2>

              <p>
                Para gestionar un pedido, la plataforma puede relacionar la
                cuenta del usuario con los productos seleccionados, cantidades,
                precios y datos de entrega.
              </p>

              <p>
                Estos antecedentes permiten mostrar el historial y el estado
                correspondiente a cada compra.
              </p>
            </section>

            <section id="seguridad">
              <h2>6. Seguridad de la información</h2>

              <p>
                MiniMarketPlace utiliza mecanismos de autenticación y control
                de acceso para reducir el riesgo de accesos no autorizados.
              </p>

              <p>
                Sin embargo, ningún sistema conectado a Internet puede
                garantizar seguridad absoluta. Por esta razón, los usuarios
                también deben proteger sus credenciales y cerrar sesión en
                equipos compartidos.
              </p>
            </section>

            <section id="terceros">
              <h2>7. Servicios externos</h2>

              <p>
                Algunas funcionalidades pueden depender de servicios externos,
                como autenticación, pagos, inventario, despacho o
                almacenamiento de información.
              </p>

              <p>
                Solamente se utilizarán los datos necesarios para ejecutar la
                operación solicitada por el usuario.
              </p>
            </section>

            <section id="cookies">
              <h2>8. Cookies y almacenamiento local</h2>

              <p>
                La plataforma puede utilizar almacenamiento local del navegador
                para mantener información de sesión, preferencias o elementos
                necesarios para el funcionamiento del carrito.
              </p>

              <p>
                El usuario puede eliminar esta información desde la
                configuración de su navegador, aunque algunas funciones podrían
                dejar de operar correctamente.
              </p>
            </section>

            <section id="derechos">
              <h2>9. Derechos del usuario</h2>

              <p>
                El usuario puede solicitar información relacionada con los
                datos asociados a su cuenta o comunicar que alguno de ellos es
                incorrecto.
              </p>

              <p>
                También puede solicitar orientación sobre la actualización o
                eliminación de información mediante los canales de soporte.
              </p>
            </section>

            <section id="contacto">
              <h2>10. Contacto</h2>

              <p>
                Para realizar consultas relacionadas con esta política, utiliza
                el Centro de ayuda de MiniMarketPlace.
              </p>

              <Link to="/ayuda-postventa" className="info-support-button">
                Contactar a soporte
              </Link>
            </section>

            <div className="info-notice">
              <strong>Importante:</strong> MiniMarketPlace corresponde a un
              proyecto académico. Esta página presenta de manera informativa el
              tratamiento esperado de los datos dentro del prototipo.
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}