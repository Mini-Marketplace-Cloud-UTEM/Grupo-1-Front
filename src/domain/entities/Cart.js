export class CartItem {
  constructor(product, qty) {
    this.product = product;
    this.qty = qty;
  }

  get subtotal() {
    return this.product.price * this.qty;
  }
}

export class Cart {
  constructor(items = {}) {
    this.items = items; // Objeto con la forma { [productId]: CartItem }
  }

  static fromState(state) {
    const items = {};
    if (state) {
      Object.keys(state).forEach((id) => {
        if (state[id] && state[id].product) {
          items[id] = new CartItem(state[id].product, state[id].qty);
        }
      });
    }
    return new Cart(items);
  }

  addItem(product, qty = 1) {
    if (!product || product.inStock === false) {
      throw new Error('El producto no tiene stock disponible.');
    }
    const existing = this.items[product.id];
    const currentQty = existing ? existing.qty : 0;
    this.items[product.id] = new CartItem(product, currentQty + qty);
  }

  changeQty(productId, delta) {
    const existing = this.items[productId];
    if (!existing) return;
    const newQty = existing.qty + delta;
    if (newQty <= 0) {
      delete this.items[productId];
    } else {
      existing.qty = newQty;
    }
  }

  removeItem(productId) {
    delete this.items[productId];
  }

  clear() {
    this.items = {};
  }

  get total() {
    return Object.values(this.items).reduce((acc, item) => acc + item.subtotal, 0);
  }

  get count() {
    return Object.values(this.items).reduce((acc, item) => acc + item.qty, 0);
  }

  toState() {
    const state = {};
    Object.keys(this.items).forEach((id) => {
      state[id] = { product: this.items[id].product, qty: this.items[id].qty };
    });
    return state;
  }
}
