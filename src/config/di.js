import { ApiProductRepository } from '../adapters/repositories/ApiProductRepository.js';
import { ApiAuthService } from '../adapters/repositories/ApiAuthService.js';

import { GetProductCatalog } from '../use-cases/GetProductCatalog.js';
import { LoginUser } from '../use-cases/LoginUser.js';
import { RegisterUser } from '../use-cases/RegisterUser.js';

// Instanciar adaptadores de infraestructura
const productRepository = new ApiProductRepository();
const authService = new ApiAuthService();

// Instanciar Casos de Uso con dependencias inyectadas
export const getProductCatalogUseCase = new GetProductCatalog(productRepository);
export const loginUserUseCase = new LoginUser(authService);
export const registerUserUseCase = new RegisterUser(authService);
