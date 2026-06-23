import { IOrderRepository } from '../../domain/ports/IOrderRepository.js';

export class MemoryOrderRepository extends IOrderRepository {
  constructor() {
    super();
    this.orders = [
      {
        id: 'ORD-A4F2B1',
        date: '10/06/2026',
        status: 'delivered',
        items: [
          { name: 'Monitor 27"', qty: 1, price: 319990 },
          { name: 'Mouse inalámbrico', qty: 2, price: 24990 }
        ],
        total: 369970
      },
      {
        id: 'ORD-C9D3E8',
        date: '12/06/2026',
        status: 'shipped',
        items: [{ name: 'Notebook Pro 14"', qty: 1, price: 699990 }],
        total: 699990
      },
      {
        id: 'ORD-F1A0B3',
        date: '14/06/2026',
        status: 'processing',
        items: [
          { name: 'Silla ergonómica', qty: 1, price: 189990 },
          { name: 'Lámpara LED', qty: 2, price: 19990 }
        ],
        total: 229970
      }
    ];
  }

  async getOrders() {
    return this.orders;
  }

  async createOrder(cart) {
    const items = Object.values(cart.items).filter((x) => x.qty > 0);
    const total = cart.total;
    const orderId = 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const statuses = ['pending', 'processing', 'shipped', 'delivered'];
    const status = statuses[Math.floor(Math.random() * 2)];

    const newOrder = {
      id: orderId,
      date: new Date().toLocaleDateString('es-CL'),
      status,
      items: items.map(({ product: p, qty }) => ({ name: p.name, qty, price: p.price })),
      total
    };

    this.orders = [newOrder, ...this.orders];
    return newOrder;
  }
}
