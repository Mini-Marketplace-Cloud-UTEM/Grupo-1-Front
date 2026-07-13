import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import '../styles/paginasInformativas.css';

export default function GarantiaServicio() {
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
            Postventa
          </span>

          <h1>Garantía y Servicio Técnico</h1>

          <p>
            Revisa cómo solicitar ayuda cuando un producto presenta una falla,
            llega dañado o requiere una evaluación técnica.
          </p>

          <div className="info-update">
            Última actualización: julio de 2026
          </div>
        </section>

        <div className="info-layout">
          <aside className="info-index">
            <h2>Contenido</h2>

            <nav>
              <a href="#opciones">1. Opciones de atención</a>
              <a href="#cobertura">2. Evaluación de garantía</a>
              <a href="#solicitud">3. Cómo solicitar atención</a>
              <a href="#antecedentes">4. Antecedentes necesarios</a>
              <a href="#evaluacion">5. Evaluación técnica</a>
              <a href="#condiciones">6. Condiciones del producto</a>
              <a href="#seguimiento">7. Seguimiento de solicitud</a>
              <a href="#preguntas">8. Preguntas frecuentes</a>
              <a href="#contacto">9. Contacto</a>
            </nav>
          </aside>

          <article className="info-content">
            <section id="opciones">
              <h2>1. Opciones de atención postventa</h2>

              <p>
                Dependiendo del problema informado y del tipo de producto,
                MiniMarketPlace podrá orientar al usuario mediante diferentes
                alternativas de atención.
              </p>

              <div className="info-card-grid">
                <article className="info-card">
                  <div className="info-card-icon">🔄</div>

                  <h3>Cambio o devolución</h3>

                  <p>
                    Para productos que llegaron dañados, incompletos o que no
                    corresponden a lo solicitado.
                  </p>
                </article>

                <article className="info-card">
                  <div className="info-card-icon">🛠️</div>

                  <h3>Evaluación técnica</h3>

                  <p>
                    Para productos que presentan una posible falla durante su
                    uso y necesitan ser revisados.
                  </p>
                </article>

                <article className="info-card">
                  <div className="info-card-icon">📦</div>

                  <h3>Problemas con la entrega</h3>

                  <p>
                    Para informar productos faltantes, paquetes dañados o
                    diferencias con el pedido recibido.
                  </p>
                </article>

                <article className="info-card">
                  <div className="info-card-icon">🎧</div>

                  <h3>Orientación de soporte</h3>

                  <p>
                    Para resolver dudas sobre el uso, instalación o
                    funcionamiento general del producto.
                  </p>
                </article>
              </div>
            </section>

            <section id="cobertura">
              <h2>2. Evaluación de garantía</h2>

              <p>
                Cuando un producto presenta una posible falla, la solicitud
                deberá ser revisada para identificar el problema y determinar
                la alternativa de solución correspondiente.
              </p>

              <p>
                La evaluación puede considerar el estado del producto, sus
                accesorios, los antecedentes de la compra y la descripción de
                la falla informada por el usuario.
              </p>

              <div className="info-notice">
                Los derechos y condiciones aplicables a cada compra dependerán
                de la normativa vigente, del tipo de producto y de los
                antecedentes asociados al pedido.
              </div>
            </section>

            <section id="solicitud">
              <h2>3. Cómo solicitar atención</h2>

              <p>
                Para iniciar una solicitud de postventa, sigue estos pasos:
              </p>

              <ol>
                <li>
                  Ingresa al Centro de ayuda de MiniMarketPlace.
                </li>

                <li>
                  Selecciona la opción relacionada con cambios, devoluciones o
                  servicio técnico.
                </li>

                <li>
                  Indica el número del pedido y el producto que presenta el
                  problema.
                </li>

                <li>
                  Describe la situación con la mayor cantidad de información
                  posible.
                </li>

                <li>
                  Adjunta fotografías o antecedentes adicionales cuando sean
                  solicitados.
                </li>

                <li>
                  Espera la revisión y las instrucciones entregadas por el
                  equipo de soporte.
                </li>
              </ol>
            </section>

            <section id="antecedentes">
              <h2>4. Antecedentes necesarios</h2>

              <p>
                Para revisar correctamente una solicitud, pueden solicitarse
                los siguientes antecedentes:
              </p>

              <div className="info-table-wrapper">
                <table className="info-table">
                  <thead>
                    <tr>
                      <th>Antecedente</th>
                      <th>¿Para qué se utiliza?</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td>Número de pedido</td>
                      <td>
                        Permite identificar la compra y los productos
                        relacionados.
                      </td>
                    </tr>

                    <tr>
                      <td>Datos del comprador</td>
                      <td>
                        Permiten comprobar que la solicitud corresponde al
                        usuario asociado al pedido.
                      </td>
                    </tr>

                    <tr>
                      <td>Descripción de la falla</td>
                      <td>
                        Ayuda a comprender el problema y orientar la revisión.
                      </td>
                    </tr>

                    <tr>
                      <td>Fotografías o videos</td>
                      <td>
                        Permiten observar daños, piezas faltantes o mensajes de
                        error.
                      </td>
                    </tr>

                    <tr>
                      <td>Accesorios del producto</td>
                      <td>
                        Pueden ser necesarios para realizar una evaluación
                        completa.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section id="evaluacion">
              <h2>5. Evaluación técnica</h2>

              <p>
                Algunos productos pueden requerir una revisión antes de
                determinar si corresponde una reparación, cambio, devolución u
                otra alternativa.
              </p>

              <p>
                Durante este proceso se revisará la falla informada y se
                comprobará el estado general del producto. El resultado será
                comunicado mediante los datos de contacto asociados a la
                solicitud.
              </p>
            </section>

            <section id="condiciones">
              <h2>6. Condiciones para entregar el producto</h2>

              <p>
                Cuando sea necesario entregar un producto para su revisión, se
                recomienda:
              </p>

              <ul>
                <li>
                  Entregar el producto limpio y en condiciones seguras de
                  manipulación.
                </li>

                <li>
                  Incluir los accesorios necesarios para comprobar su
                  funcionamiento.
                </li>

                <li>
                  Retirar contraseñas o bloqueos personales cuando corresponda.
                </li>

                <li>
                  Respaldar archivos personales antes de entregar un equipo
                  electrónico.
                </li>

                <li>
                  No incluir objetos personales que no formen parte del
                  producto.
                </li>
              </ul>

              <div className="info-notice">
                MiniMarketPlace no debe utilizarse como sistema de respaldo de
                fotografías, documentos u otros archivos personales contenidos
                en un dispositivo.
              </div>
            </section>

            <section id="seguimiento">
              <h2>7. Seguimiento de la solicitud</h2>

              <p>
                El usuario deberá conservar el número o referencia entregada al
                crear su solicitud. Este dato permitirá consultar el estado de
                la atención.
              </p>

              <div className="info-card-grid">
                <article className="info-card">
                  <div className="info-card-icon">📝</div>

                  <h3>Solicitud recibida</h3>

                  <p>
                    Los antecedentes fueron registrados y están pendientes de
                    revisión.
                  </p>
                </article>

                <article className="info-card">
                  <div className="info-card-icon">🔍</div>

                  <h3>En evaluación</h3>

                  <p>
                    El equipo de soporte o servicio técnico está revisando el
                    caso.
                  </p>
                </article>

                <article className="info-card">
                  <div className="info-card-icon">📨</div>

                  <h3>Información requerida</h3>

                  <p>
                    Se necesitan fotografías, documentos u otros antecedentes
                    para continuar.
                  </p>
                </article>

                <article className="info-card">
                  <div className="info-card-icon">✅</div>

                  <h3>Solicitud resuelta</h3>

                  <p>
                    La revisión terminó y se informó la solución o los pasos
                    siguientes.
                  </p>
                </article>
              </div>
            </section>

            <section id="preguntas">
              <h2>8. Preguntas frecuentes</h2>

              <h3>¿Debo conservar el comprobante de compra?</h3>

              <p>
                Es recomendable conservar el número de pedido y los
                antecedentes entregados al confirmar la compra.
              </p>

              <h3>¿Puedo solicitar ayuda por un producto dañado?</h3>

              <p>
                Sí. Debes informar el problema mediante el Centro de ayuda,
                indicando el pedido y adjuntando fotografías cuando sea
                posible.
              </p>

              <h3>¿Todos los productos necesitan evaluación técnica?</h3>

              <p>
                No necesariamente. El procedimiento dependerá del producto y
                del problema informado.
              </p>

              <h3>¿Dónde puedo revisar mi solicitud?</h3>

              <p>
                El seguimiento se realizará mediante el canal de contacto
                informado al crear el caso. Esta función puede ampliarse en
                futuras versiones de la plataforma.
              </p>
            </section>

            <section id="contacto">
              <h2>9. Contactar a soporte</h2>

              <p>
                Para informar un problema con un producto, ingresa al Centro de
                ayuda y completa el formulario de contacto.
              </p>

              <Link to="/ayuda-postventa" className="info-support-button">
                Solicitar ayuda
              </Link>
            </section>

            <div className="info-notice">
              <strong>Importante:</strong> MiniMarketPlace corresponde a un
              proyecto académico. Esta página representa el flujo esperado de
              una futura atención de garantía y servicio técnico.
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}