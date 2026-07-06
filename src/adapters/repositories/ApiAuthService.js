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
      email,
      name: data.user?.name || email,
      token: data.accessToken,
    };
  }
}
