import { User } from '../domain/entities/User.js';

export class RegisterUser {
  constructor(authService) {
    this.authService = authService;
  }

  async execute(name, email, password) {
    const result = await this.authService.register(name, email, password);
    return new User(result); // { email, name, token }
  }
}
