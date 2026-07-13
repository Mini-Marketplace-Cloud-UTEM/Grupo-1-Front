import React, { useEffect, useMemo, useState } from 'react';
import {
  adminCreateProduct,
  adminUpdateProduct,
  fetchCategories,
  fetchProductById,
} from '../../api.js';

// Tallas/tamaños válidos del producto (enum de G3, requerido al crear).
// G4 lo usa para armar el paquete y cotizar el despacho con G6.
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Form de crear/editar producto del panel admin.
// - En edicion la categoria va deshabilitada: el PUT de G3 no acepta
//   categoryId (la categoria es inmutable tras crear).
// - sku solo se pide al crear (G3 no lo expone en su GET publico ni lo
//   actualiza por PUT).
// - Un Idempotency-Key por apertura del form: doble click en "Guardar"
//   no duplica el producto en G3.
export default function AdminProductForm({ mode, product, onSaved, onCancel, onAuthError }) {
  const isEdit = mode === 'edit';
  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);

  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(product?.price ?? '');
  const [categoryId, setCategoryId] = useState(product?.categoryId || '');
  const [description, setDescription] = useState('');
  const [stockVisible, setStockVisible] = useState(product?.stock ?? 0);
  const [size, setSize] = useState(product?.size || '');
  const [sku, setSku] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState(product?.status || 'ACTIVE');

  const [categories, setCategories] = useState([]);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Crear: poblar el select de categorias. Editar: completar los campos que
  // el listado no trae (description, images) desde el detalle.
  useEffect(() => {
    let cancelled = false;
    if (!isEdit) {
      fetchCategories()
        .then((body) => {
          if (!cancelled) setCategories(body.data || []);
        })
        .catch((err) => {
          if (!cancelled && !onAuthError?.(err)) {
            setFormError('No se pudieron cargar las categorías. ' + err.message);
          }
        });
    } else if (product?.id) {
      fetchProductById(product.id)
        .then((detail) => {
          if (cancelled) return;
          setDescription(detail.description || '');
          setImageUrl((detail.images || [])[0] || '');
          if (detail.size) setSize(detail.size);
        })
        .catch(() => {
          // El detalle solo completa campos secundarios; si falla se puede
          // editar igual con lo que trae la fila.
        });
    }
    return () => {
      cancelled = true;
    };
  }, [isEdit, product?.id, onAuthError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const priceInt = Number(price);
    if (!Number.isInteger(priceInt) || priceInt <= 0) {
      setFormError('El precio debe ser un entero en CLP mayor que 0.');
      return;
    }
    if (!isEdit && !categoryId) {
      setFormError('Selecciona una categoría.');
      return;
    }
    if (!size) {
      setFormError('Selecciona un tamaño.');
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await adminUpdateProduct(product.id, {
          name: name.trim(),
          description: description.trim() || null,
          price: priceInt,
          stockVisible: Number(stockVisible) || 0,
          size,
          status,
          images: imageUrl.trim() ? [imageUrl.trim()] : [],
        });
      } else {
        const body = {
          name: name.trim(),
          price: priceInt,
          categoryId,
          size,
          stockVisible: Number(stockVisible) || 0,
        };
        if (description.trim()) body.description = description.trim();
        if (sku.trim()) body.sku = sku.trim();
        if (imageUrl.trim()) body.images = [imageUrl.trim()];
        await adminCreateProduct(body, idempotencyKey);
      }
      onSaved();
    } catch (err) {
      if (!onAuthError?.(err)) setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-form-card">
      <h3>{isEdit ? `Editar: ${product?.name}` : 'Agregar producto'}</h3>

      {formError && (
        <div className="error-msg">
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="admin-form-grid">
          <div className="form-group">
            <label>Nombre *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Precio (CLP) *</label>
            <input
              type="number"
              min="1"
              step="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Categoría {isEdit ? '' : '*'}</label>
            {isEdit ? (
              <input value={product?.category || product?.categoryId || ''} disabled title="La categoría no se puede cambiar después de crear el producto (limitación de Grupo 3)." />
            ) : (
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                <option value="">Selecciona…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="form-group">
            <label>Stock visible</label>
            <input
              type="number"
              min="0"
              step="1"
              value={stockVisible}
              onChange={(e) => setStockVisible(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Tamaño *</label>
            <select value={size} onChange={(e) => setSize(e.target.value)} required>
              <option value="">Selecciona…</option>
              {SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          {!isEdit && (
            <div className="form-group">
              <label>SKU</label>
              <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Opcional" />
            </div>
          )}
          {isEdit && (
            <div className="form-group">
              <label>Estado</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          )}
          <div className="form-group full">
            <label>URL de imagen</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://… (opcional)"
            />
          </div>
          <div className="form-group full">
            <label>Descripción</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-form-footer">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear producto'}
          </button>
          <button className="btn" type="button" onClick={onCancel} disabled={saving}>
            Cancelar
          </button>
          {isEdit && (
            <span className="admin-form-hint">
              La categoría no se puede cambiar después de crear el producto.
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
