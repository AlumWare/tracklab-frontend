export class ContainerResource {
  constructor({
    containerId,
    orderId,
    warehouseId,
    shipItems = [],
    totalWeight = 0,
    qrCode = null,
    isCompleted = false,
    completedAt = null,
    completionNotes = null
  }) {
    this.containerId = containerId
    this.orderId = orderId
    this.warehouseId = warehouseId
    this.shipItems = shipItems
    this.totalWeight = totalWeight
    this.qrCode = qrCode
    this.isCompleted = isCompleted
    this.completedAt = completedAt
    this.completionNotes = completionNotes
  }
}

export class CreateContainerResource {
  constructor({
    orderId,
    warehouseId,
    shipItems = [],
    totalWeight = 0
  }) {
    this.orderId = orderId
    this.warehouseId = warehouseId
    this.shipItems = shipItems
    this.totalWeight = totalWeight
  }
}

export class ShipItemResource {
  constructor({
    productId,
    quantity,
    unitWeight
  }) {
    this.productId = productId
    this.quantity = quantity
    this.unitWeight = unitWeight
  }
}

export class CreateShipItemResource {
  constructor({
    productId,
    quantity,
    unitWeight = 1.0
  }) {
    this.productId = productId
    this.quantity = quantity
    this.unitWeight = unitWeight
  }
}

export class QrCodeResource {
  constructor({
    url,
    generatedAt
  }) {
    this.url = url
    this.generatedAt = generatedAt
  }
}


export class CompleteContainerResource {
  constructor({
    deliveryWarehouseId,
    deliveryDate = null,
    deliveryNotes = null
  }) {
    this.deliveryWarehouseId = deliveryWarehouseId
    this.deliveryDate = deliveryDate
    this.deliveryNotes = deliveryNotes
  }
}
