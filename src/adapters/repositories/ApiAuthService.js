import { IAuthService } from '../../domain/ports/IAuthService.js';
import { bffFetch } from '../../api.js';

export class ApiAuthService extends IAuthService {
  async login(email, password) {
    // Login real contra el BFF (que a su vez llama a Grupo 2).
    const data = await bffFetch('/v1/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    return {
      id: data.user?.id,
      email,
      name: data.user?.name || email,
      roles: data.user?.roles || [],
      token: data.accessToken,
    };
  }

  async register(name, email, password) {
    // Registro real contra el BFF. G2 devuelve token + user, asi que
    // dejamos la sesion iniciada de una (mismo shape que login).
    const data = await bffFetch('/v1/auth/register', {
      method: 'POST',
      body: { name, email, password },
    });
    return {
      id: data.user?.id,
      email,
      name: data.user?.name || name,
      roles: data.user?.roles || [],
      token: data.accessToken,
    };
  }
}
