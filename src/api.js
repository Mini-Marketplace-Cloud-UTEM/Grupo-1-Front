const BFF_URL = import.meta.env.VITE_BFF_URL || 'https://grupo-1-bff.onrender.com';

export async function fetchProducts({ q = '', page = 1, pageSize = 6 } = {}) {
  const params = new URLSearchParams({ page, pageSize });
  if (q) params.set('q', q);

  const res = await fetch(`${BFF_URL}/v1/products?${params}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Error ${res.status} al cargar productos`);
  }
  return res.json();
}
