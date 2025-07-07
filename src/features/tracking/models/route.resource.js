
export class CreateRouteResource {
  constructor({
    vehicleId,
    routeName,
    warehouseIds = [],
    orderIds = [],
    plannedStartDate = null,
    description = null
  }) {
    this.vehicleId = vehicleId
    this.routeName = routeName
    this.warehouseIds = warehouseIds
    this.orderIds = orderIds
    this.plannedStartDate = plannedStartDate
    this.description = description
  }
}

export class AddNodeResource {
  constructor({
    warehouseId
  }) {
    this.warehouseId = warehouseId
  }
}

export class AddOrderToRouteResource {
  constructor({
    orderId
  }) {
    this.orderId = orderId
  }
}

export class RouteResource {
  constructor({
    routeId,
    vehicleId,
    routeName,
    plannedStartDate = null,
    description = null,
    createdAt,
    isActive,
    routeItems = [],
    orders = []
  }) {
    this.routeId = routeId
    this.vehicleId = vehicleId
    this.routeName = routeName
    this.plannedStartDate = plannedStartDate
    this.description = description
    this.createdAt = createdAt
    this.isActive = isActive
    this.routeItems = routeItems
    this.orders = orders
  }
}

export class RouteItemResource {
  constructor({
    id,
    warehouseId,
    isCompleted = false,
    completedAt = null
  }) {
    this.id = id
    this.warehouseId = warehouseId
    this.isCompleted = isCompleted
    this.completedAt = completedAt
  }
}

export class RouteOrderSummary {
  constructor({
    orderId,
    customerId,
    logisticsId,
    status,
    totalItems,
    shippingAddress
  }) {
    this.orderId = orderId
    this.customerId = customerId
    this.logisticsId = logisticsId
    this.status = status
    this.totalItems = totalItems
    this.shippingAddress = shippingAddress
  }
}
