import { ApiProductRepository } from '../adapters/repositories/ApiProductRepository.js';
import { ApiAuthService } from '../adapters/repositories/ApiAuthService.js';
import { MemoryOrderRepository } from '../adapters/repositories/MemoryOrderRepository.js';

import { GetProductCatalog } from '../use-cases/GetProductCatalog.js';
import { LoginUser } from '../use-cases/LoginUser.js';
import { RegisterUser } from '../use-cases/RegisterUser.js';
import { PlaceOrder } from '../use-cases/PlaceOrder.js';

// Instanciar adaptadores de infraestructura
const productRepository = new ApiProductRepository();
const authService = new ApiAuthService();
export const orderRepository = new MemoryOrderRepository(); // Exportado por si necesitamos acceder directamente

// Instanciar Casos de Uso con dependencias inyectadas
export const getProductCatalogUseCase = new GetProductCatalog(productRepository);
export const loginUserUseCase = new LoginUser(authService);
export const registerUserUseCase = new RegisterUser(authService);
export const placeOrderUseCase = new PlaceOrder(orderRepository);
