export class IProductRepository {
  async getProducts({ q, page, pageSize }) {
    throw new Error('Método getProducts() no implementado.');
  }
}
