import { IAuthService } from '../../domain/ports/IAuthService.js';

export class ApiAuthService extends IAuthService {
  async login(email, password) {
    // Simulado para la demo, igual al Login.jsx original
    if (email === 'demo@minimarket.cl' && password === 'demo1234') {
      const mockToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkZW1vQG1pbmltYXJrZXQuY2wiLCJleHAiOjE3NTEwMDAwMDB9.demo_jwt_token';
      return {
        email,
        name: 'Demo Usuario',
        token: mockToken
      };
    } else {
      throw new Error('Credenciales incorrectas.');
    }
  }
}
