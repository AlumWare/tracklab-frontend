export class Order {
  constructor({
    id,
    status,
    date,
    product,
    quantity,
    destination,
    deliveredItems = 0,
    totalItems = 0,
    clientId = null,
    items = []
  }) {
    this.id = id;
    this.status = status;
    this.date = date;
    this.product = product;
    this.quantity = quantity;
    this.destination = destination;
    this.deliveredItems = deliveredItems;
    this.totalItems = totalItems;
    this.clientId = clientId;
    this.items = items;
  }

  static STATUS = {
    PENDING: 'pending',
    IN_PROCESS: 'inprocess',
    DELIVERED: 'delivered'
  };

  get progress() {
    if (!this.totalItems) return 0;
    return (this.deliveredItems / this.totalItems) * 100;
  }

  canBeCancelled() {
    return this.status === Order.STATUS.PENDING;
  }
}
