export class Order {
  static STATUS = {
    PENDING: 'pending',
    IN_PROCESS: 'inprocess',
    DELIVERED: 'delivered'
  }

  constructor({
    id,
    status = Order.STATUS.PENDING,
    date,
    materials = [],
    destination,
    totalItems = 0,
    deliveredItems = 0
  }) {
    this.id = id
    this.status = status
    this.date = date
    this.materials = materials
    this.destination = destination
    this.totalItems = totalItems
    this.deliveredItems = deliveredItems
  }

  get progress() {
    if (this.totalItems < 30) {
      return this.deliveredItems >= this.totalItems ? 100 : 0
    }
    const validDelivered = Math.floor(this.deliveredItems / 30) * 30
    if (validDelivered === 0) return 0
    let percent = Math.round((validDelivered / this.totalItems) * 100)
    if (percent > 100) percent = 100
    return percent
  }

  canBeCanceled() {
    return this.status === Order.STATUS.PENDING
  }
}
