export class Product {
  constructor({ id, name, category, price, inStock, imageUrl }) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.price = Number(price);
    this.inStock = Boolean(inStock);
    this.imageUrl = imageUrl;
  }
}
