export class Order {
  constructor(id, logisticsCompany, deliveryAddress, deliveryDate, items) {
    this.id = id;
    this.logisticsCompany = logisticsCompany || null;
    this.deliveryAddress = deliveryAddress || '';
    this.deliveryDate = deliveryDate || '';
    this.items = items || [];
    this.totalItems = this.calculateTotalItems();
    this.totalWeight = this.calculateTotalWeight();
  }

  calculateTotalItems() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  calculateTotalWeight() {
    return this.items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
  }
}

export default Order;
