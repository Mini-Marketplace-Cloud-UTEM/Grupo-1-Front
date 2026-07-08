export class User {
  constructor({ id, email, name, roles = [], token }) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.roles = roles;
    this.token = token;
  }
}
