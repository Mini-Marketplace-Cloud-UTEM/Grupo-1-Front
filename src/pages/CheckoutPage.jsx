import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../adapters/hooks/useCart.jsx';
import { useAuth } from '../adapters/hooks/useAuth.jsx';
import Footer from '../components/Footer';

// Listado de regiones y comunas de Chile para la experiencia de despacho
const CHILE_REGIONS = [
  {
    name: 'Región Metropolitana',
    zone: 'CENTRO',
    cities: ['Santiago', 'Providencia', 'Las Condes', 'Maipú', 'Puente Alto', 'La Florida', 'Ñuñoa', 'San Bernardo']
  },
  {
    name: 'Región de Valparaíso',
    zone: 'CENTRO',
    cities: ['Valparaíso', 'Viña del Mar', 'Quilpué', 'Villa Alemana', 'San Antonio', 'San Felipe']
  },
  {
    name: 'Región de Antofagasta',
    zone: 'NORTE',
    cities: ['Antofagasta', 'Calama', 'Tocopilla', 'Mejillones']
  },
  {
    name: 'Región del Bío Bío',
    zone: 'SUR',
    cities: ['Concepción', 'Talcahuano', 'San Pedro de la Paz', 'Coronel', 'Chillán', 'Los Ángeles']
  },
  {
    name: 'Región de Magallanes',
    zone: 'SUR',
    cities: ['Punta Arenas', 'Puerto Natales', 'Porvenir']
  }
];

// Algoritmo de validación de RUT Chileno
function validarRut(rutCompleto) {
  if (!rutCompleto) return false;
  // Limpiar puntos y guiones
  const cleanRut = rutCompleto.replace(/\./g, '').replace(/-/g, '').trim();
  if (cleanRut.length < 8) return false;

  const cuerpo = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1).toLowerCase();

  // Calcular Dígito Verificador
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

// Formateador de RUT en tiempo real (12345678-K)
function formatearRut(value) {
  const clean = value.replace(/[^0-9kK]/g, '');
  if (clean.length <= 1) return clean;
  const cuerpo = clean.slice(0, -1);
  const dv = clean.slice(-1).toUpperCase();
  return `${cuerpo}-${dv}`;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartState, cartCount, cartTotal, placeOrder, clearCart } = useCart();

  // Pasos: 'address' -> 'shipping' -> 'payment' -> 'confirm' -> 'success'
  const [step, setStep] = useState('address');
  
  // Datos del paso 1: Dirección y RUT
  const [formData, setFormData] = useState({
    fullName: user || '',
    rut: '',
    phone: '',
    address: '',
    regionIndex: 0,
    city: 'Santiago'
  });
  const [formErrors, setFormErrors] = useState({});

  // Datos del paso 2: Cotización de Despacho (G6)
  const [shippingQuote, setShippingQuote] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isQuoteFallBack, setIsQuoteFallBack] = useState(false);

  // Datos del paso 3: Pago (G8)
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: ''
  });
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Estado final de la confirmación
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Redirigir al catálogo si el carro está vacío (salvo si ya terminamos con éxito)
  useEffect(() => {
    if (cartCount === 0 && step !== 'success') {
      navigate('/tienda');
    }
  }, [cartCount, step, navigate]);

  // Manejar cambios en el formulario del Paso 1
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'rut') {
      const formatted = formatearRut(value);
      setFormData(prev => ({ ...prev, [name]: formatted }));
      if (formErrors.rut) setFormErrors(prev => ({ ...prev, rut: null }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleRegionChange = (e) => {
    const idx = parseInt(e.target.value, 10);
    const region = CHILE_REGIONS[idx];
    setFormData(prev => ({
      ...prev,
      regionIndex: idx,
      city: region.cities[0]
    }));
  };

  // Validar Paso 1 e ir a Paso 2 (Despacho)
  const handleAddressSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Nombre requerido';
    if (!formData.phone.trim()) errors.phone = 'Teléfono requerido';
    if (!formData.address.trim()) errors.address = 'Dirección requerida';
    
    if (!formData.rut) {
      errors.rut = 'RUT requerido';
    } else if (!validarRut(formData.rut)) {
      errors.rut = 'RUT inválido (ej: 12345678-K)';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setStep('shipping');
    fetchShippingQuote();
  };

  // Cotizar Despacho en G6 (Llamado Real con fallback)
  const fetchShippingQuote = async () => {
    setLoadingQuote(true);
    setQuoteError(null);
    setIsQuoteFallBack(false);

    const region = CHILE_REGIONS[formData.regionIndex];
    
    // Preparar el cuerpo de la cotización según el esquema de G6
    const packageItems = Object.values(cartState).map(item => ({
      originCd: region.zone, // El origen del almacén más cercano
      weightKg: 1.5 * item.qty,
      dimensionsCm: {
        length: 20,
        width: 15,
        height: 15
      }
    }));

    try {
      const response = await fetch('https://g6-despacho-oficial.onrender.com/api/v1/shipments/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Id': crypto.randomUUID(),
          'X-Correlation-Id': crypto.randomUUID(),
          'X-Consumer': 'grupo-1-frontend'
        },
        body: JSON.stringify({
          city: formData.city,
          packages: packageItems
        })
      });

      if (!response.ok) throw new Error('Error al cotizar en el servidor de despacho');
      const data = await response.json();
      
      const baseCost = data.totalShippingCost || 3500;
      const methods = [
        { id: 'STANDARD', name: 'Despacho Estándar (G6)', cost: baseCost, days: '3-5 días hábiles' },
        { id: 'EXPRESS', name: 'Despacho Express (G6)', cost: Math.round(baseCost * 1.5), days: '24 horas' },
        { id: 'PICKUP', name: 'Retiro en Tienda UTEM', cost: 0, days: 'Disponible en 2 horas' }
      ];
      setShippingQuote(methods);
      setSelectedMethod(methods[0]);
    } catch (err) {
      console.warn('Falla de red/CORS en G6 Despacho, utilizando fallback de contingencia.', err);
      
      // Fallback robusto local basado en la zona
      let baseCost = 3500; // Centro
      if (region.zone === 'NORTE') baseCost = 6500;
      else if (region.zone === 'SUR') baseCost = 7500;
      if (formData.city === 'Punta Arenas') baseCost = 10500; // Extremo Sur

      const fallbackMethods = [
        { id: 'STANDARD', name: 'Despacho Estándar (Fallback local)', cost: baseCost, days: '3-5 días hábiles' },
        { id: 'EXPRESS', name: 'Despacho Express (Fallback local)', cost: Math.round(baseCost * 1.5), days: '24-48 horas' },
        { id: 'PICKUP', name: 'Retiro en Tienda UTEM', cost: 0, days: 'Gratis' }
      ];

      setShippingQuote(fallbackMethods);
      setSelectedMethod(fallbackMethods[0]);
      setIsQuoteFallBack(true);
    } finally {
      setLoadingQuote(false);
    }
  };

  // Confirmar Paso 2 (Despacho) e ir a Paso 3 (Pago)
  const handleShippingSubmit = () => {
    if (!selectedMethod) return;
    setStep('payment');
  };

  // Simular el pago en G8
  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (paymentMethod === 'CARD') {
      if (!cardData.cardNumber || !cardData.cardName || !cardData.cardExpiry || !cardData.cardCvv) {
        alert('Por favor complete todos los datos de su tarjeta.');
        return;
      }
    }
    
    setPaymentLoading(true);
    // Simular latencia de validación con G8
    setTimeout(() => {
      setPaymentLoading(false);
      setStep('confirm');
    }, 1500);
  };

  // Paso 4: Confirmar y realizar el Checkout Real en G4
  const handleConfirmOrder = async () => {
    setCheckoutLoading(true);
    try {
      // placeOrder llama a /v1/checkout del BFF (que a su vez llama a G4)
      const result = await placeOrder(formData, selectedMethod.cost);
      if (result && result.success) {
        setCheckoutResult(result);
        setStep('success');
      } else {
        alert('No se pudo procesar el checkout. Intente nuevamente.');
      }
    } catch (err) {
      console.error(err);
      alert(`Error al procesar el checkout: ${err.message}`);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const fmt = (n) => '$' + n.toLocaleString('es-CL');

  return (
    <div className="app">
      {/* Header simple para el Checkout */}
      <header className="nav" style={{ padding: '0 40px', height: '60px' }}>
        <div className="nav-logo" onClick={() => navigate('/tienda')} style={{ cursor: 'pointer' }}>
          <i className="ti ti-shopping-cart-check" style={{ fontSize: '20px' }}></i>
          <span style={{ fontWeight: 600, letterSpacing: '0.5px' }}>MARKETPLACE CLOUD</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          <i className="ti ti-lock"></i> Pago Seguro SSL
        </div>
      </header>

      {/* Indicador de Pasos del Asistente */}
      <div style={{ background: 'var(--color-background-primary)', borderBottom: '0.5px solid var(--color-border-primary)', padding: '16px 0' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', padding: '0 20px' }}>
          {[
            { id: 'address', label: 'Despacho', icon: 'ti-map-pin' },
            { id: 'shipping', label: 'Envío', icon: 'ti-truck' },
            { id: 'payment', label: 'Pago', icon: 'ti-credit-card' },
            { id: 'confirm', label: 'Confirmación', icon: 'ti-discount-check' }
          ].map((s, idx, arr) => {
            const stepsOrder = ['address', 'shipping', 'payment', 'confirm', 'success'];
            const currentIdx = stepsOrder.indexOf(step);
            const thisIdx = stepsOrder.indexOf(s.id);
            const isCompleted = thisIdx < currentIdx;
            const isActive = s.id === step;

            return (
              <React.Fragment key={s.id}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, opacity: isActive || isCompleted ? 1 : 0.4 }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: isCompleted ? 'var(--color-primary)' : isActive ? 'var(--color-background-secondary)' : '#333',
                    border: isActive ? '2px solid var(--color-primary)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isCompleted ? '#000' : '#fff',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    transition: 'all 0.3s'
                  }}>
                    {isCompleted ? <i className="ti ti-check" style={{ strokeWidth: 3 }}></i> : <i className={`ti ${s.icon}`}></i>}
                  </div>
                  <span style={{ fontSize: '11px', marginTop: '6px', fontWeight: isActive ? '600' : 'normal', color: isActive ? 'var(--color-primary)' : '#fff' }}>
                    {s.label}
                  </span>
                </div>
                {idx < arr.length - 1 && (
                  <div style={{
                    flex: 1,
                    height: '2px',
                    background: thisIdx < currentIdx - 1 ? 'var(--color-primary)' : '#3f3f46',
                    alignSelf: 'center',
                    margin: '0 10px',
                    transform: 'translateY(-10px)',
                    transition: 'all 0.3s'
                  }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Contenido Principal */}
      <main style={{ flex: 1, padding: '40px 20px', maxWidth: '1000px', width: '100%', margin: '0 auto', display: 'flex', gap: '30px', flexDirection: 'row' }}>
        
        {/* LADO IZQUIERDO: Formulario de Pasos */}
        <div style={{ flex: 1, background: 'var(--color-background-primary)', borderRadius: 'var(--border-radius-lg)', border: '0.5px solid var(--color-border-primary)', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          
          {/* PASO 1: DIRECCIÓN Y RUT */}
          {step === 'address' && (
            <form onSubmit={handleAddressSubmit}>
              <h2 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="ti ti-map-pin" style={{ color: 'var(--color-primary)' }}></i> Datos de Despacho
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label htmlFor="fullName" style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Nombre Destinatario</label>
                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-secondary)', border: `0.5px solid ${formErrors.fullName ? 'var(--color-text-danger)' : 'var(--color-border-primary)'}`, color: '#fff', fontSize: '13px' }}
                    placeholder="Ej. Juan Pérez"
                  />
                  {formErrors.fullName && <span style={{ color: 'var(--color-text-danger)', fontSize: '11px', marginTop: '4px', display: 'block' }}>{formErrors.fullName}</span>}
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="rut" style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>RUT Destinatario</label>
                    <input
                      id="rut"
                      type="text"
                      name="rut"
                      value={formData.rut}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '10px', borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-secondary)', border: `0.5px solid ${formErrors.rut ? 'var(--color-text-danger)' : 'var(--color-border-primary)'}`, color: '#fff', fontSize: '13px' }}
                      placeholder="12345678-K"
                      maxLength={10}
                    />
                    {formErrors.rut && <span style={{ color: 'var(--color-text-danger)', fontSize: '11px', marginTop: '4px', display: 'block' }}>{formErrors.rut}</span>}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <label htmlFor="phone" style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Teléfono de Contacto</label>
                    <input
                      id="phone"
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '10px', borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-secondary)', border: `0.5px solid ${formErrors.phone ? 'var(--color-text-danger)' : 'var(--color-border-primary)'}`, color: '#fff', fontSize: '13px' }}
                      placeholder="+56 9 1234 5678"
                    />
                    {formErrors.phone && <span style={{ color: 'var(--color-text-danger)', fontSize: '11px', marginTop: '4px', display: 'block' }}>{formErrors.phone}</span>}
                  </div>
                </div>

                <div>
                  <label htmlFor="address" style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Dirección (Calle, Número, Depto)</label>
                  <input
                    id="address"
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-secondary)', border: `0.5px solid ${formErrors.address ? 'var(--color-text-danger)' : 'var(--color-border-primary)'}`, color: '#fff', fontSize: '13px' }}
                    placeholder="Av. Dieciocho 161, Depto 402"
                  />
                  {formErrors.address && <span style={{ color: 'var(--color-text-danger)', fontSize: '11px', marginTop: '4px', display: 'block' }}>{formErrors.address}</span>}
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="region" style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Región</label>
                    <select
                      id="region"
                      value={formData.regionIndex}
                      onChange={handleRegionChange}
                      style={{ width: '100%', padding: '10px', borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-primary)', color: '#fff', fontSize: '13px', outline: 'none' }}
                    >
                      {CHILE_REGIONS.map((r, idx) => (
                        <option key={r.name} value={idx}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <label htmlFor="city" style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Comuna / Ciudad</label>
                    <select
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '10px', borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-primary)', color: '#fff', fontSize: '13px', outline: 'none' }}
                    >
                      {CHILE_REGIONS[formData.regionIndex].cities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '14px', marginTop: '10px' }}>
                  Continuar al despacho <i className="ti ti-arrow-right" style={{ marginLeft: '4px' }}></i>
                </button>
              </div>
            </form>
          )}

          {/* PASO 2: TIPO DE ENTREGA / COTIZACIÓN G6 */}
          {step === 'shipping' && (
            <div>
              <h2 style={{ marginBottom: '10px', fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="ti ti-truck" style={{ color: 'var(--color-primary)' }}></i> Método de Envío
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '12px', marginBottom: '20px' }}>
                Tarifas obtenidas en tiempo real desde el <strong>Servicio de Logística de Grupo 6</strong> para {formData.city}.
              </p>

              {loadingQuote ? (
                <div style={{ padding: '40px 0', textAlign: 'center' }}>
                  <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Calculando tarifas con Grupo 6...</p>
                </div>
              ) : quoteError ? (
                <div className="error-card" style={{ padding: '20px', textAlign: 'center' }}>
                  <p style={{ color: 'var(--color-text-danger)', fontSize: '13px' }}>{quoteError}</p>
                  <button className="btn btn-sm" onClick={fetchShippingQuote} style={{ marginTop: '10px' }}>Reintentar</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  {isQuoteFallBack && (
                    <div style={{
                      padding: '10px 14px',
                      background: 'rgba(217, 119, 6, 0.1)',
                      border: '0.5px solid rgba(217, 119, 6, 0.3)',
                      borderRadius: 'var(--border-radius-md)',
                      fontSize: '11px',
                      color: '#fbbf24',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <i className="ti ti-alert-circle"></i>
                      <span>Servicio de Grupo 6 offline. Utilizando cálculo de tarifas de contingencia local.</span>
                    </div>
                  )}

                  {shippingQuote?.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setSelectedMethod(method)}
                      style={{
                        padding: '16px',
                        borderRadius: 'var(--border-radius-md)',
                        background: 'var(--color-background-secondary)',
                        border: `1px solid ${selectedMethod?.id === method.id ? 'var(--color-primary)' : 'var(--color-border-primary)'}`,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: `2px solid ${selectedMethod?.id === method.id ? 'var(--color-primary)' : 'var(--color-text-secondary)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          {selectedMethod?.id === method.id && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)' }} />}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '13px' }}>{method.name}</p>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{method.days}</span>
                        </div>
                      </div>
                      <span style={{ fontWeight: 'bold', fontSize: '14px', color: method.cost === 0 ? 'var(--color-primary)' : '#fff' }}>
                        {method.cost === 0 ? 'Gratis' : fmt(method.cost)}
                      </span>
                    </div>
                  ))}

                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                    <button className="btn" onClick={() => setStep('address')} style={{ flex: 1, padding: '12px' }}>
                      Atrás
                    </button>
                    <button className="btn btn-primary" onClick={handleShippingSubmit} style={{ flex: 2, padding: '12px' }}>
                      Continuar al pago <i className="ti ti-arrow-right" style={{ marginLeft: '4px' }}></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PASO 3: PAGO / SIMULACIÓN G8 */}
          {step === 'payment' && (
            <form onSubmit={handlePaymentSubmit}>
              <h2 style={{ marginBottom: '10px', fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="ti ti-credit-card" style={{ color: 'var(--color-primary)' }}></i> Método de Pago
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '12px', marginBottom: '20px' }}>
                Simulación segura de pasarela integrada con el <strong>Servicio de Pagos de Grupo 8</strong>.
              </p>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <div
                  onClick={() => setPaymentMethod('CARD')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 'var(--border-radius-md)',
                    background: 'var(--color-background-secondary)',
                    border: `1.5px solid ${paymentMethod === 'CARD' ? 'var(--color-primary)' : 'var(--color-border-primary)'}`,
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <i className="ti ti-credit-card" style={{ fontSize: '20px', display: 'block', marginBottom: '4px' }}></i>
                  <span style={{ fontSize: '12px', fontWeight: 500 }}>Tarjeta de Crédito</span>
                </div>
                <div
                  onClick={() => setPaymentMethod('TRANSFER')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 'var(--border-radius-md)',
                    background: 'var(--color-background-secondary)',
                    border: `1.5px solid ${paymentMethod === 'TRANSFER' ? 'var(--color-primary)' : 'var(--color-border-primary)'}`,
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <i className="ti ti-building-bank" style={{ fontSize: '20px', display: 'block', marginBottom: '4px' }}></i>
                  <span style={{ fontSize: '12px', fontWeight: 500 }}>Transferencia</span>
                </div>
              </div>

              {paymentMethod === 'CARD' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label htmlFor="cardNumber" style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Número de Tarjeta</label>
                    <input
                      id="cardNumber"
                      type="text"
                      value={cardData.cardNumber}
                      onChange={(e) => setCardData(prev => ({ ...prev, cardNumber: e.target.value.replace(/[^0-9]/g, '').slice(0, 16) }))}
                      style={{ width: '100%', padding: '10px', borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-primary)', color: '#fff', fontSize: '13px' }}
                      placeholder="4512 3456 7890 1234"
                    />
                  </div>
                  <div>
                    <label htmlFor="cardName" style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Nombre en la Tarjeta</label>
                    <input
                      id="cardName"
                      type="text"
                      value={cardData.cardName}
                      onChange={(e) => setCardData(prev => ({ ...prev, cardName: e.target.value.toUpperCase() }))}
                      style={{ width: '100%', padding: '10px', borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-primary)', color: '#fff', fontSize: '13px' }}
                      placeholder="JUAN PEREZ Z."
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 2 }}>
                      <label htmlFor="cardExpiry" style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Vencimiento (MM/AA)</label>
                      <input
                        id="cardExpiry"
                        type="text"
                        value={cardData.cardExpiry}
                        onChange={(e) => setCardData(prev => ({ ...prev, cardExpiry: e.target.value.slice(0, 5) }))}
                        style={{ width: '100%', padding: '10px', borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-primary)', color: '#fff', fontSize: '13px' }}
                        placeholder="12/29"
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label htmlFor="cardCvv" style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>CVV</label>
                      <input
                        id="cardCvv"
                        type="password"
                        value={cardData.cardCvv}
                        onChange={(e) => setCardData(prev => ({ ...prev, cardCvv: e.target.value.replace(/[^0-9]/g, '').slice(0, 3) }))}
                        style={{ width: '100%', padding: '10px', borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-primary)', color: '#fff', fontSize: '13px' }}
                        placeholder="123"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--color-border-primary)', borderRadius: 'var(--border-radius-md)', padding: '16px', fontSize: '12px', lineHeight: '1.5', color: 'var(--color-text-secondary)' }}>
                  <p style={{ fontWeight: 600, color: '#fff', marginBottom: '8px' }}>Instrucciones de Transferencia:</p>
                  <p>Al confirmar el pedido se te entregarán los datos de transferencia ficticios de la universidad.</p>
                  <p style={{ marginTop: '8px' }}>El servicio de pagos de Grupo 8 validará la reconciliación bancaria simulada una vez se notifique el depósito.</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn" onClick={() => setStep('shipping')} style={{ flex: 1, padding: '12px' }}>
                  Atrás
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: '12px', position: 'relative' }} disabled={paymentLoading}>
                  {paymentLoading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <span className="spinner" style={{ width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent' }} />
                      Procesando con G8...
                    </span>
                  ) : (
                    <>Continuar a la confirmación <i className="ti ti-arrow-right" style={{ marginLeft: '4px' }}></i></>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* PASO 4: CONFIRMACIÓN Y LLAMADO REAL A BFF */}
          {step === 'confirm' && (
            <div>
              <h2 style={{ marginBottom: '14px', fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="ti ti-discount-check" style={{ color: 'var(--color-primary)' }}></i> Confirmación del Pedido
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '12px', marginBottom: '24px' }}>
                Al presionar "Pagar y Finalizar" se ejecutará la orquestación real del checkout en el <strong>BFF y Grupo 4</strong>.
              </p>

              <div style={{ background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-primary)', borderRadius: 'var(--border-radius-md)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                <div>
                  <h4 style={{ color: 'var(--color-primary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Datos del Cliente</h4>
                  <p style={{ fontWeight: 600 }}>{formData.fullName}</p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>RUT: {formData.rut} | Tel: {formData.phone}</p>
                </div>

                <div style={{ borderTop: '0.5px solid var(--color-border-primary)', paddingTop: '14px' }}>
                  <h4 style={{ color: 'var(--color-primary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Dirección de Envío</h4>
                  <p>{formData.address}</p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>{formData.city}, {CHILE_REGIONS[formData.regionIndex].name}</p>
                </div>

                <div style={{ borderTop: '0.5px solid var(--color-border-primary)', paddingTop: '14px' }}>
                  <h4 style={{ color: 'var(--color-primary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Método de Envío</h4>
                  <p>{selectedMethod?.name} ({selectedMethod?.days})</p>
                </div>

                <div style={{ borderTop: '0.5px solid var(--color-border-primary)', paddingTop: '14px' }}>
                  <h4 style={{ color: 'var(--color-primary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Método de Pago Seleccionado</h4>
                  <p>{paymentMethod === 'CARD' ? '💳 Tarjeta de Crédito (Simulado G8)' : '🏦 Transferencia Bancaria (Simulado G8)'}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button className="btn" onClick={() => setStep('payment')} style={{ flex: 1, padding: '12px' }} disabled={checkoutLoading}>
                  Atrás
                </button>
                <button className="btn btn-primary" onClick={handleConfirmOrder} style={{ flex: 2, padding: '12px', fontWeight: 'bold' }} disabled={checkoutLoading}>
                  {checkoutLoading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <span className="spinner" style={{ width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent' }} />
                      Procesando Checkout...
                    </span>
                  ) : (
                    <>Pagar y Finalizar {fmt(cartTotal + selectedMethod?.cost)}</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* PASO 5: ÉXITO */}
          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--color-background-success)',
                border: '1px solid var(--color-border-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-success)',
                margin: '0 auto 20px',
              }}>
                <i className="ti ti-circle-check" style={{ fontSize: '36px' }}></i>
              </div>
              
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-success)', marginBottom: '10px' }}>¡Compra Finalizada con Éxito!</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', maxWidth: '400px', margin: '0 auto 24px' }}>
                El pedido ha sido orquestado de forma correcta por el BFF de Grupo 1 y el servicio de Carrito de Grupo 4.
              </p>

              <div style={{ background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-primary)', borderRadius: 'var(--border-radius-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '360px', margin: '0 auto 30px', fontSize: '13px', textAlign: 'left' }}>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '11px' }}>ID de Pedido (G5):</span>
                  <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{checkoutResult?.orderId}</p>
                </div>
                <div style={{ borderTop: '0.5px solid var(--color-border-primary)', paddingTop: '8px', marginTop: '4px' }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '11px' }}>Dirección de entrega:</span>
                  <p>{formData.address}, {formData.city}</p>
                </div>
                <div style={{ borderTop: '0.5px solid var(--color-border-primary)', paddingTop: '8px', marginTop: '4px' }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '11px' }}>Destinatario:</span>
                  <p>{formData.fullName} ({formData.rut})</p>
                </div>
                <div style={{ borderTop: '0.5px solid var(--color-border-primary)', paddingTop: '8px', marginTop: '4px' }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '11px' }}>Monto total pagado (G8):</span>
                  <p style={{ fontWeight: 600 }}>{fmt(cartTotal + selectedMethod?.cost)}</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '280px', margin: '0 auto' }}>
                <button className="btn btn-primary" onClick={() => { clearCart(); navigate('/tienda'); }} style={{ padding: '12px' }}>
                  Volver a la tienda
                </button>
                <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                  El pedido ha sido añadido a tu historial local de compras.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* LADO DERECHO: Resumen del Carrito (Visible en pasos 1, 2, 3 y 4) */}
        {step !== 'success' && (
          <div style={{ width: '340px', background: 'var(--color-background-primary)', borderRadius: 'var(--border-radius-lg)', border: '0.5px solid var(--color-border-primary)', padding: '24px', height: 'fit-content' }}>
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="ti ti-shopping-cart" style={{ color: 'var(--color-primary)' }}></i> Resumen de Compra
            </h3>

            {/* Listado de Productos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '200px', overflowY: 'auto', marginBottom: '16px', paddingRight: '4px' }}>
              {Object.values(cartState).map((item) => (
                <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '12px' }}>
                  <div style={{ flex: 1, paddingRight: '12px' }}>
                    <p style={{ fontWeight: 500, color: '#fff' }} className="truncate-2-lines">{item.product.name}</p>
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                      {fmt(item.product.price)} × {item.qty}
                    </span>
                  </div>
                  <span style={{ fontWeight: 600 }}>{fmt(item.product.price * item.qty)}</span>
                </div>
              ))}
            </div>

            {/* desglose de montos */}
            <div style={{ borderTop: '0.5px solid var(--color-border-primary)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal</span>
                <span>{fmt(cartTotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Despacho</span>
                <span style={{ color: selectedMethod ? '#fff' : 'var(--color-text-secondary)' }}>
                  {selectedMethod ? (selectedMethod.cost === 0 ? 'Gratis' : fmt(selectedMethod.cost)) : 'Calculándose...'}
                </span>
              </div>
              
              <div style={{ borderTop: '0.5px solid var(--color-border-primary)', marginTop: '6px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '15px' }}>
                <span>Total Final</span>
                <span style={{ color: 'var(--color-primary)' }}>
                  {fmt(cartTotal + (selectedMethod?.cost || 0))}
                </span>
              </div>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
