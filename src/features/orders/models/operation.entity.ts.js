export class Operation {
  constructor(id, type, date, node, summary, container, orderId, photos) {
    this.id = id;
    this.type = type;
    this.date = date;
    this.node = node;
    this.summary = summary;
    this.container = container;
    this.orderId = orderId;
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
