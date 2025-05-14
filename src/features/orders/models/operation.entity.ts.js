export class Operation {
  constructor(id, type, date, node, container, order, photos) {
    this.id = id;
    this.type = type;
    this.date = date;
    this.node = node;
    this.container = container;
    this.order = order;
    this.photos = photos || [];
  }

  static formatDate(date) {
    return new Date(date).toLocaleDateString();
  }

  static capitalizeType(type) {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }
}

export default Operation;
