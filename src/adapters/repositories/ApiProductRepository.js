import { IProductRepository } from '../../domain/ports/IProductRepository.js';
import { fetchProducts } from '../../api.js';

export class ApiProductRepository extends IProductRepository {
  async getProducts({ q, page, pageSize }) {
    const response = await fetchProducts({ q, page, pageSize });
    return {
      products: response.data,
      pagination: response.pagination
    };
  }
}
