import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import '../styles/paginasInformativas.css';

export default function CentrosRetiro() {
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
            Entrega de pedidos
          </span>

          <h1>Centros de Retiro</h1>

          <p>
            Revisa cómo funciona el retiro presencial de pedidos, qué debes
            presentar y cuáles son los puntos demostrativos disponibles en
            MiniMarketPlace.
          </p>

          <div className="info-update">
            Última actualización: julio de 2026
          </div>
        </section>

        <div className="info-layout">
          <aside className="info-index">
            <h2>Contenido</h2>

            <nav>
              <a href="#funcionamiento">1. Cómo funciona</a>
              <a href="#requisitos">2. Requisitos para retirar</a>
              <a href="#centros">3. Centros disponibles</a>
              <a href="#estados">4. Estado del pedido</a>
              <a href="#terceros">5. Retiro por otra persona</a>
              <a href="#recomendaciones">6. Recomendaciones</a>
              <a href="#preguntas">7. Preguntas frecuentes</a>
              <a href="#contacto">8. Ayuda y soporte</a>
            </nav>
          </aside>

          <article className="info-content">
            <section id="funcionamiento">
              <h2>1. ¿Cómo funciona el retiro?</h2>

              <p>
                Durante el proceso de compra, el usuario podrá seleccionar un
                centro de retiro cuando esta alternativa se encuentre
                disponible para los productos elegidos.
              </p>

              <div className="info-card-grid">
                <article className="info-card">
                  <div className="info-card-icon">🛒</div>

                  <h3>1. Realiza tu compra</h3>

                  <p>
                    Agrega los productos al carrito, inicia sesión y continúa
                    con el proceso de compra.
                  </p>
                </article>

                <article className="info-card">
                  <div className="info-card-icon">📍</div>

                  <h3>2. Selecciona un centro</h3>

                  <p>
                    Elige el punto de retiro disponible que resulte más
                    conveniente para tu pedido.
                  </p>
                </article>

                <article className="info-card">
                  <div className="info-card-icon">📨</div>

                  <h3>3. Espera la confirmación</h3>

                  <p>
                    No debes acudir al centro hasta recibir la confirmación de
                    que el pedido está listo.
                  </p>
                </article>

                <article className="info-card">
                  <div className="info-card-icon">📦</div>

                  <h3>4. Retira tu pedido</h3>

                  <p>
                    Presenta los antecedentes solicitados y revisa el estado de
                    los productos antes de retirarte.
                  </p>
                </article>
              </div>
            </section>

            <section id="requisitos">
              <h2>2. ¿Qué debes presentar?</h2>

              <p>
                Para retirar un pedido, podrán solicitarse los siguientes
                antecedentes:
              </p>

              <ul>
                <li>Número o código del pedido.</li>
                <li>Nombre de la persona asociada a la compra.</li>
                <li>Documento de identificación.</li>
                <li>Correo o mensaje de confirmación del retiro.</li>
                <li>
                  Autorización correspondiente cuando retire otra persona.
                </li>
              </ul>

              <div className="info-notice">
                Debes esperar hasta que el pedido aparezca como
                <strong> listo para retirar</strong>. La confirmación de compra
                no significa necesariamente que el producto ya se encuentre
                disponible en el centro seleccionado.
              </div>
            </section>

            <section id="centros">
              <h2>3. Centros de retiro disponibles</h2>

              <p>
                Los siguientes puntos corresponden a ubicaciones demostrativas
                del proyecto académico. No representan sucursales comerciales
                reales.
              </p>

              <article className="retiro-card">
                <h3>Centro de Retiro Santiago Centro</h3>

                <div className="retiro-detail">
                  <span>📍</span>

                  <span>
                    Ubicación demostrativa: Santiago, Región Metropolitana.
                  </span>
                </div>

                <div className="retiro-detail">
                  <span>🕐</span>

                  <span>
                    Horario referencial: lunes a viernes, de 09:00 a 18:00.
                  </span>
                </div>

                <div className="retiro-detail">
                  <span>📦</span>

                  <span>
                    Retiro de productos confirmado previamente por la
                    plataforma.
                  </span>
                </div>

                <span className="retiro-status">
                  Punto demostrativo
                </span>
              </article>

              <article className="retiro-card">
                <h3>Centro de Retiro Providencia</h3>

                <div className="retiro-detail">
                  <span>📍</span>

                  <span>
                    Ubicación demostrativa: Providencia, Región Metropolitana.
                  </span>
                </div>

                <div className="retiro-detail">
                  <span>🕐</span>

                  <span>
                    Horario referencial: lunes a sábado, de 10:00 a 19:00.
                  </span>
                </div>

                <div className="retiro-detail">
                  <span>📦</span>

                  <span>
                    Disponibilidad sujeta al producto y al estado del pedido.
                  </span>
                </div>

                <span className="retiro-status">
                  Punto demostrativo
                </span>
              </article>

              <article className="retiro-card">
                <h3>Centro de Retiro Maipú</h3>

                <div className="retiro-detail">
                  <span>📍</span>

                  <span>
                    Ubicación demostrativa: Maipú, Región Metropolitana.
                  </span>
                </div>

                <div className="retiro-detail">
                  <span>🕐</span>

                  <span>
                    Horario referencial: lunes a viernes, de 09:30 a 18:30.
                  </span>
                </div>

                <div className="retiro-detail">
                  <span>📦</span>

                  <span>
                    El usuario deberá presentar la confirmación del retiro.
                  </span>
                </div>

                <span className="retiro-status">
                  Punto demostrativo
                </span>
              </article>
            </section>

            <section id="estados">
              <h2>4. Estados relacionados con el retiro</h2>

              <div className="info-table-wrapper">
                <table className="info-table">
                  <thead>
                    <tr>
                      <th>Estado</th>
                      <th>Significado</th>
                      <th>¿Puedes retirar?</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td>Pedido confirmado</td>

                      <td>
                        La compra fue registrada, pero todavía está siendo
                        preparada.
                      </td>

                      <td>No</td>
                    </tr>

                    <tr>
                      <td>En preparación</td>

                      <td>
                        Los productos están siendo reunidos para su entrega.
                      </td>

                      <td>No</td>
                    </tr>

                    <tr>
                      <td>En traslado</td>

                      <td>
                        El pedido se encuentra camino al centro seleccionado.
                      </td>

                      <td>No</td>
                    </tr>

                    <tr>
                      <td>Listo para retirar</td>

                      <td>
                        El pedido ya se encuentra disponible en el centro.
                      </td>

                      <td>Sí</td>
                    </tr>

                    <tr>
                      <td>Entregado</td>

                      <td>
                        El pedido fue retirado y el proceso se encuentra
                        finalizado.
                      </td>

                      <td>Ya fue retirado</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section id="terceros">
              <h2>5. Retiro por otra persona</h2>

              <p>
                Cuando el comprador no pueda asistir, otra persona podrá
                retirar el pedido siempre que presente los antecedentes
                necesarios para comprobar la autorización.
              </p>

              <p>
                Podrá solicitarse el nombre de la persona autorizada, el número
                de pedido, una autorización del comprador y el documento de
                identificación de quien realiza el retiro.
              </p>
            </section>

            <section id="recomendaciones">
              <h2>6. Recomendaciones para el retiro</h2>

              <ul>
                <li>
                  Confirma que el pedido indique claramente que está listo.
                </li>

                <li>
                  Revisa el horario del centro antes de acudir.
                </li>

                <li>
                  Lleva contigo el número del pedido y tu identificación.
                </li>

                <li>
                  Verifica que la cantidad de productos entregados sea
                  correcta.
                </li>

                <li>
                  Revisa visualmente el estado del embalaje.
                </li>

                <li>
                  Informa inmediatamente cualquier diferencia o daño visible.
                </li>
              </ul>
            </section>

            <section id="preguntas">
              <h2>7. Preguntas frecuentes</h2>

              <h3>¿Puedo retirar apenas finalizo la compra?</h3>

              <p>
                No. Debes esperar la confirmación que indique que el pedido está
                listo para retirar.
              </p>

              <h3>¿Puedo cambiar el centro seleccionado?</h3>

              <p>
                La posibilidad de cambiarlo dependerá del estado del pedido. Si
                ya se encuentra en preparación o traslado, puede que no sea
                posible modificarlo.
              </p>

              <h3>¿Qué hago si mi pedido no está en el centro?</h3>

              <p>
                Debes contactar a soporte indicando el número del pedido y el
                centro de retiro seleccionado.
              </p>

              <h3>¿Cuánto tiempo tengo para retirar?</h3>

              <p>
                El plazo deberá informarse junto con la confirmación del pedido.
                Al tratarse de un proyecto académico, esta condición todavía
                no se encuentra implementada como una regla definitiva.
              </p>
            </section>

            <section id="contacto">
              <h2>8. Ayuda y soporte</h2>

              <p>
                Para resolver problemas con el retiro de un pedido, utiliza el
                Centro de ayuda de MiniMarketPlace.
              </p>

              <Link to="/ayuda-postventa" className="info-support-button">
                Contactar a soporte
              </Link>
            </section>

            <div className="info-notice">
              <strong>Importante:</strong> Los centros, direcciones y horarios
              mostrados son referenciales y forman parte de una demostración
              académica. No corresponden a establecimientos reales.
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}