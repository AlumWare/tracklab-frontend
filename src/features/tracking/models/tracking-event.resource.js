
export class TrackingEventResource {
  constructor({
    eventId,
    containerId,
    warehouseId,
    type,
    eventTime
  }) {
    this.eventId = eventId
    this.containerId = containerId
    this.warehouseId = warehouseId
    this.type = type
    this.eventTime = eventTime
  }
}
