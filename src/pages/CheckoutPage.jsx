import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../adapters/hooks/useCart.jsx';
import { useAuth } from '../adapters/hooks/useAuth.jsx';
import Footer from '../components/Footer';

// Regiones y comunas de Chile para la dirección de despacho.
const CHILE_REGIONS = [
  { name: 'Región Metropolitana', cities: ['Santiago', 'Providencia', 'Las Condes', 'Maipú', 'Puente Alto', 'La Florida', 'Ñuñoa', 'San Bernardo'] },
  { name: 'Región de Valparaíso', cities: ['Valparaíso', 'Viña del Mar', 'Quilpué', 'Villa Alemana', 'San Antonio', 'San Felipe'] },
  { name: 'Región de Antofagasta', cities: ['Antofagasta', 'Calama', 'Tocopilla', 'Mejillones'] },
  { name: 'Región del Bío Bío', cities: ['Concepción', 'Talcahuano', 'San Pedro de la Paz', 'Coronel', 'Chillán', 'Los Ángeles'] },
  { name: 'Región de Magallanes', cities: ['Punta Arenas', 'Puerto Natales', 'Porvenir'] },
];

// Validación de RUT chileno (módulo 11).
function validarRut(rutCompleto) {
  if (!rutCompleto) return false;
  const cleanRut = rutCompleto.replace(/\./g, '').replace(/-/g, '').trim();
  if (cleanRut.length < 8) return false;
  const cuerpo = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1).toLowerCase();
  let suma = 0;
  let multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i), 10) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }
  const dvEsperadoNum = 11 - (suma % 11);
  let dvEsperado = '';
  if (dvEsperadoNum === 11) dvEsperado = '0';
  else if (dvEsperadoNum === 10) dvEsperado = 'k';
  else dvEsperado = dvEsperadoNum.toString();
  return dvEsperado === dv;
}

function formatearRut(value) {
  const clean = value.replace(/[^0-9kK]/g, '');
  if (clean.length <= 1) return clean;
  const cuerpo = clean.slice(0, -1);
  const dv = clean.slice(-1).toUpperCase();
  return `${cuerpo}-${dv}`;
}

// Checkout con el super-endpoint de G4 (2026-07-13): una sola llamada crea el
// pedido (G5), reserva stock, cotiza despacho e inicia el pago (G8), y devuelve
// una paymentUrl de MercadoPago a la que redirigimos. Pasos: dirección → pago.
export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartState, cartCount, cartTotal, placeOrder, cancelCheckoutFlow } = useCart();

  const [step, setStep] = useState('address'); // 'address' | 'confirm'
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    rut: '',
    phone: '',
    address: '',
    regionIndex: 0,
    city: 'Santiago',
    postalCode: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  // Si el carro queda vacío, volver a la tienda.
  useEffect(() => {
    if (cartCount === 0) navigate('/tienda');
  }, [cartCount, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'rut') {
      setFormData((prev) => ({ ...prev, rut: formatearRut(value) }));
      if (formErrors.rut) setFormErrors((prev) => ({ ...prev, rut: null }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleRegionChange = (e) => {
    const idx = parseInt(e.target.value, 10);
    setFormData((prev) => ({ ...prev, regionIndex: idx, city: CHILE_REGIONS[idx].cities[0] }));
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Nombre requerido';
    if (!formData.phone.trim()) errors.phone = 'Teléfono requerido';
    if (!formData.address.trim()) errors.address = 'Dirección requerida';
    if (!formData.rut) errors.rut = 'RUT requerido';
    else if (!validarRut(formData.rut)) errors.rut = 'RUT inválido (ej: 12345678-K)';
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setCheckoutError(null);
    setStep('confirm');
  };

  // Cancelar = liberar el stock reservado por G4 y volver a la tienda.
  const exitCheckout = () => {
    cancelCheckoutFlow();
    navigate('/tienda');
  };

  // Iniciar el pago: G4 orquesta todo y nos devuelve la paymentUrl.
  const handlePayNow = async () => {
    setCheckoutError(null);
    setCheckoutLoading(true);
    try {
      const region = CHILE_REGIONS[formData.regionIndex]?.name;
      const result = await placeOrder({
        address: formData.address,
        city: formData.city,
        region,
        postalCode: formData.postalCode,
        notes: formData.notes,
      });
      if (result?.paymentUrl) {
        window.location.href = result.paymentUrl; // redirección a MercadoPago
        return;
      }
      setCheckoutError('No recibimos la URL de pago desde el checkout. Intenta nuevamente.');
      setCheckoutLoading(false);
    } catch (err) {
      if (err?.status === 409) {
        setCheckoutError('No hay stock suficiente para uno o más productos de tu carrito.');
      } else {
        setCheckoutError(err?.message || 'No se pudo iniciar el pago. Intenta nuevamente.');
      }
      setCheckoutLoading(false);
    }
  };

  const fmt = (n) => '$' + Number(n || 0).toLocaleString('es-CL');
  const steps = [
    { id: 'address', label: 'Despacho', icon: 'ti-map-pin' },
    { id: 'confirm', label: 'Pago', icon: 'ti-credit-card' },
  ];
  const currentIdx = steps.findIndex((s) => s.id === step);

  return (
    <div className="app">
      <header className="nav" style={{ padding: '0 40px', height: '60px' }}>
        <div className="nav-logo" onClick={exitCheckout} style={{ cursor: 'pointer' }}>
          <i className="ti ti-shopping-cart-check" style={{ fontSize: '20px' }}></i>
          <span style={{ fontWeight: 600, letterSpacing: '0.5px' }}>MARKETPLACE CLOUD</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          <i className="ti ti-lock"></i> Pago Seguro (MercadoPago)
        </div>
      </header>

      {/* Indicador de pasos */}
      <div style={{ background: 'var(--color-background-primary)', borderBottom: '0.5px solid var(--color-border-primary)', padding: '16px 0' }}>
        <div style={{ maxWidth: '520px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', padding: '0 20px' }}>
          {steps.map((s, idx) => {
            const isCompleted = idx < currentIdx;
            const isActive = s.id === step;
            return (
              <React.Fragment key={s.id}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, opacity: isActive || isCompleted ? 1 : 0.4 }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: isCompleted ? 'var(--color-primary)' : isActive ? 'var(--color-background-secondary)' : '#333', border: isActive ? '2px solid var(--color-primary)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isCompleted ? '#000' : '#fff', fontWeight: 'bold', fontSize: '14px' }}>
                    {isCompleted ? <i className="ti ti-check"></i> : <i className={`ti ${s.icon}`}></i>}
                  </div>
                  <span style={{ fontSize: '11px', marginTop: '6px', fontWeight: isActive ? 600 : 'normal', color: isActive ? 'var(--color-primary)' : '#fff' }}>{s.label}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div style={{ flex: 1, height: '2px', background: idx < currentIdx ? 'var(--color-primary)' : '#3f3f46', alignSelf: 'center', margin: '0 10px', transform: 'translateY(-10px)' }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <main style={{ flex: 1, padding: '40px 20px', maxWidth: '1000px', width: '100%', margin: '0 auto', display: 'flex', gap: '30px', flexDirection: 'row' }}>
        <div style={{ flex: 1, background: 'var(--color-background-primary)', borderRadius: 'var(--border-radius-lg)', border: '0.5px solid var(--color-border-primary)', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>

          {/* PASO 1: DIRECCIÓN */}
          {step === 'address' && (
            <form onSubmit={handleAddressSubmit}>
              <h2 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="ti ti-map-pin" style={{ color: 'var(--color-primary)' }}></i> Datos de Despacho
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label htmlFor="fullName" style={labelStyle}>Nombre Destinatario</label>
                  <input id="fullName" type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} style={inputStyle(formErrors.fullName)} placeholder="Ej. Juan Pérez" />
                  {formErrors.fullName && <span style={errStyle}>{formErrors.fullName}</span>}
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="rut" style={labelStyle}>RUT Destinatario</label>
                    <input id="rut" type="text" name="rut" value={formData.rut} onChange={handleInputChange} style={inputStyle(formErrors.rut)} placeholder="12345678-K" maxLength={10} />
                    {formErrors.rut && <span style={errStyle}>{formErrors.rut}</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="phone" style={labelStyle}>Teléfono de Contacto</label>
                    <input id="phone" type="text" name="phone" value={formData.phone} onChange={handleInputChange} style={inputStyle(formErrors.phone)} placeholder="+56 9 1234 5678" />
                    {formErrors.phone && <span style={errStyle}>{formErrors.phone}</span>}
                  </div>
                </div>

                <div>
                  <label htmlFor="address" style={labelStyle}>Dirección (Calle, Número, Depto)</label>
                  <input id="address" type="text" name="address" value={formData.address} onChange={handleInputChange} style={inputStyle(formErrors.address)} placeholder="Av. Dieciocho 161, Depto 402" />
                  {formErrors.address && <span style={errStyle}>{formErrors.address}</span>}
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="region" style={labelStyle}>Región</label>
                    <select id="region" value={formData.regionIndex} onChange={handleRegionChange} style={selectStyle}>
                      {CHILE_REGIONS.map((r, idx) => (<option key={r.name} value={idx}>{r.name}</option>))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="city" style={labelStyle}>Comuna / Ciudad</label>
                    <select id="city" name="city" value={formData.city} onChange={handleInputChange} style={selectStyle}>
                      {CHILE_REGIONS[formData.regionIndex].cities.map((city) => (<option key={city} value={city}>{city}</option>))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="postalCode" style={labelStyle}>Código Postal (opcional)</label>
                    <input id="postalCode" type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} style={inputStyle(false)} placeholder="8320000" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="notes" style={labelStyle}>Notas de entrega (opcional)</label>
                    <input id="notes" type="text" name="notes" value={formData.notes} onChange={handleInputChange} style={inputStyle(false)} placeholder="Dejar en conserjería" />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '14px', marginTop: '10px' }}>
                  Continuar al pago <i className="ti ti-arrow-right" style={{ marginLeft: '4px' }}></i>
                </button>
                <button type="button" className="btn" onClick={exitCheckout} style={{ width: '100%', padding: '10px', fontSize: '13px' }}>
                  Cancelar y volver a la tienda
                </button>
              </div>
            </form>
          )}

          {/* PASO 2: CONFIRMAR Y PAGAR */}
          {step === 'confirm' && (
            <div>
              <h2 style={{ marginBottom: '14px', fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="ti ti-discount-check" style={{ color: 'var(--color-primary)' }}></i> Confirmar y Pagar
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '12px', marginBottom: '20px' }}>
                Al pagar, serás redirigido a <strong>MercadoPago</strong> para completar la compra de forma segura. El costo de despacho lo calcula el checkout.
              </p>

              <div style={{ background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-primary)', borderRadius: 'var(--border-radius-md)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                <div>
                  <h4 style={sectionTitle}>Datos del Cliente</h4>
                  <p style={{ fontWeight: 600 }}>{formData.fullName}</p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>RUT: {formData.rut} | Tel: {formData.phone}</p>
                </div>
                <div style={{ borderTop: '0.5px solid var(--color-border-primary)', paddingTop: '14px' }}>
                  <h4 style={sectionTitle}>Dirección de Envío</h4>
                  <p>{formData.address}</p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>{formData.city}, {CHILE_REGIONS[formData.regionIndex].name}{formData.postalCode ? ` · ${formData.postalCode}` : ''}</p>
                  {formData.notes && <p style={{ color: 'var(--color-text-secondary)', fontSize: '12px', marginTop: '4px' }}>Nota: {formData.notes}</p>}
                </div>
              </div>

              {checkoutError && (
                <div style={{ marginTop: '16px', padding: '12px 14px', background: 'rgba(220, 38, 38, 0.1)', border: '0.5px solid rgba(220, 38, 38, 0.3)', borderRadius: 'var(--border-radius-md)', fontSize: '12px', color: '#f87171', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: 1.5 }}>
                  <i className="ti ti-alert-triangle" style={{ marginTop: '2px' }}></i>
                  <span>{checkoutError}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button className="btn" onClick={() => setStep('address')} style={{ flex: 1, padding: '12px' }} disabled={checkoutLoading}>
                  Atrás
                </button>
                <button className="btn btn-primary" onClick={handlePayNow} style={{ flex: 2, padding: '12px', fontWeight: 'bold' }} disabled={checkoutLoading}>
                  {checkoutLoading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <span className="spinner" style={{ width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent' }} />
                      Iniciando pago...
                    </span>
                  ) : (
                    <>Pagar con MercadoPago <i className="ti ti-external-link" style={{ marginLeft: '4px' }}></i></>
                  )}
                </button>
              </div>
              <button type="button" onClick={exitCheckout} disabled={checkoutLoading} style={{ display: 'block', margin: '14px auto 0', background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '12px', textDecoration: 'underline', cursor: 'pointer' }}>
                Cancelar y volver a la tienda
              </button>
            </div>
          )}
        </div>

        {/* RESUMEN */}
        <div style={{ width: '340px', background: 'var(--color-background-primary)', borderRadius: 'var(--border-radius-lg)', border: '0.5px solid var(--color-border-primary)', padding: '24px', height: 'fit-content' }}>
          <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="ti ti-shopping-cart" style={{ color: 'var(--color-primary)' }}></i> Resumen de Compra
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '200px', overflowY: 'auto', marginBottom: '16px', paddingRight: '4px' }}>
            {Object.values(cartState).map((item) => (
              <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '12px' }}>
                <div style={{ flex: 1, paddingRight: '12px' }}>
                  <p style={{ fontWeight: 500, color: '#fff' }} className="truncate-2-lines">{item.product.name}</p>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{fmt(item.product.price)} × {item.qty}</span>
                </div>
                <span style={{ fontWeight: 600 }}>{fmt(item.product.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '0.5px solid var(--color-border-primary)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal</span>
              <span>{fmt(cartTotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Despacho</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>Se calcula al pagar</span>
            </div>
            <div style={{ borderTop: '0.5px solid var(--color-border-primary)', marginTop: '6px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '15px' }}>
              <span>Subtotal</span>
              <span style={{ color: 'var(--color-primary)' }}>{fmt(cartTotal)}</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '6px' };
const errStyle = { color: 'var(--color-text-danger)', fontSize: '11px', marginTop: '4px', display: 'block' };
const selectStyle = { width: '100%', padding: '10px', borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-primary)', color: '#fff', fontSize: '13px', outline: 'none' };
const sectionTitle = { color: 'var(--color-primary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' };
function inputStyle(hasError) {
  return { width: '100%', padding: '10px', borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-secondary)', border: `0.5px solid ${hasError ? 'var(--color-text-danger)' : 'var(--color-border-primary)'}`, color: '#fff', fontSize: '13px' };
}
