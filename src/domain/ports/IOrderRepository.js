export class IOrderRepository {
  async getOrders() {
    throw new Error('Método getOrders() no implementado.');
  }

  async createOrder(cart) {
    throw new Error('Método createOrder() no implementado.');
  }
}
