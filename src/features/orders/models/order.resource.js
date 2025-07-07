export class AddOrderItemResource {
  constructor({
    productId,
    quantity
  }) {
    this.productId = productId
    this.quantity = quantity
  }
}

export class CreateOrderResource {
  constructor({
    customerId,
    logisticsId,
    shippingAddress,
    items = []
  }) {
    this.customerId = customerId
    this.logisticsId = logisticsId
    this.shippingAddress = shippingAddress
    this.items = items
  }
}

export class OrderResource {
  constructor({
    orderId,
    customerId,
    logisticsId,
    shippingAddress,
    orderDate,
    status,
    totalPrice,
    orderItems = []
  }) {
    this.orderId = orderId
    this.customerId = customerId
    this.logisticsId = logisticsId
    this.shippingAddress = shippingAddress
    this.orderDate = orderDate
    this.status = status
    this.totalPrice = totalPrice
    this.orderItems = orderItems
  }
}

export class OrderItemResource {
  constructor({
    id,
    productId,
    quantity,
    priceAmount,
    priceCurrency
  }) {
    this.id = id
    this.productId = productId
    this.quantity = quantity
    this.priceAmount = priceAmount
    this.priceCurrency = priceCurrency
  }
}

export class OrderTrackingInfoResource {
  constructor({
    orderId,
    totalContainers,
    deliveredContainers,
    inTransitContainers,
    pendingContainers,
    overallStatus,
    lastUpdated = null
  }) {
    this.orderId = orderId
    this.totalContainers = totalContainers
    this.deliveredContainers = deliveredContainers
    this.inTransitContainers = inTransitContainers
    this.pendingContainers = pendingContainers
    this.overallStatus = overallStatus
    this.lastUpdated = lastUpdated
  }
}

export class RouteResource {
  constructor({
    orderId,
    vehicleId,
    warehouses = []
  }) {
    this.orderId = orderId
    this.vehicleId = vehicleId
    this.warehouses = warehouses
  }
}

