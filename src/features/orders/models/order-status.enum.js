/**
 * Enum class for order status
 */
export class OrderStatus {
  constructor(name, description) {
    this.name = name;
    this.description = description;
  }

  // Predefined order statuses
  static Pending = new OrderStatus('Pending', 'Orden pendiente');
  static InProcess = new OrderStatus('InProcess', 'Orden en proceso');
  static Shipped = new OrderStatus('Shipped', 'Orden enviada');
  static Delivered = new OrderStatus('Delivered', 'Orden entregada');
  static Cancelled = new OrderStatus('Cancelled', 'Orden cancelada');

  /**
   * Get all available order statuses
   * @returns {OrderStatus[]} Array of order status instances
   */
  static getAllStatuses() {
    return [OrderStatus.Pending, OrderStatus.InProcess, OrderStatus.Shipped, OrderStatus.Delivered, OrderStatus.Cancelled];
  }

  /**
   * Create order status from name (validates against predefined statuses)
   * @param {string} name - Order status name to find
   * @returns {OrderStatus} Order status instance
   * @throws {Error} If order status name is invalid
   */
  static fromName(name) {
    const status = OrderStatus.getAllStatuses().find(s => s.name === name);
    if (!status) {
      throw new Error(`Invalid order status: ${name}. Must be one of: ${OrderStatus.getAllStatuses().map(s => s.name).join(', ')}`);
    }
    return status;
  }

  /**
   * Check if order status name is valid
   * @param {string} name - Order status name to validate
   * @returns {boolean} True if valid order status name
   */
  static isValidStatus(name) {
    return OrderStatus.getAllStatuses().some(s => s.name === name);
  }

  // Convenience methods
  isPending() {
    return this === OrderStatus.Pending;
  }

  isInProcess() {
    return this === OrderStatus.InProcess;
  }

  isShipped() {
    return this === OrderStatus.Shipped;
  }

  isDelivered() {
    return this === OrderStatus.Delivered;
  }

  isCancelled() {
    return this === OrderStatus.Cancelled;
  }

  /**
   * Convert order status to string representation
   * @returns {string} Order status name
   */
  toString() {
    return this.name;
  }
}