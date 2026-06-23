import { User } from '../domain/entities/User.js';

export class LoginUser {
  constructor(authService) {
    this.authService = authService;
  }

  async execute(email, password) {
    const result = await this.authService.login(email, password);
    return new User(result); // { email, name, token }
  }
}
