import { Product } from '../domain/entities/Product.js';

export class GetProductCatalog {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async execute({ q, page, pageSize }) {
    const result = await this.productRepository.getProducts({ q, page, pageSize });
    return {
      products: result.products.map((p) => new Product(p)),
      pagination: result.pagination
    };
  }
}
