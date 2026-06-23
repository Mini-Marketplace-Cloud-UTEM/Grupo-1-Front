export class Order {
  constructor({ id, date, status, items, total }) {
    this.id = id;
    this.date = date || new Date().toLocaleDateString('es-CL');
    this.status = status || 'pending';
    this.items = items || []; // Array de { name, qty, price }
    this.total = total;
  }
}
