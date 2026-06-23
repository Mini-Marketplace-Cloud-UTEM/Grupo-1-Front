import { Order } from '../domain/entities/Order.js';

export class PlaceOrder {
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(cart) {
    const order = await this.orderRepository.createOrder(cart);
    return new Order(order);
  }
}
