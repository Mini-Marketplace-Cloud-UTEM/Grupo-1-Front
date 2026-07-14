import { IProductRepository } from '../../domain/ports/IProductRepository.js';
import { fetchProducts } from '../../api.js';

export class ApiProductRepository extends IProductRepository {
  async getProducts({ q, category, page, pageSize }) {
    const response = await fetchProducts({ q, category, page, pageSize });
    return {
      products: response.data,
      pagination: response.pagination
    };
  }
}
