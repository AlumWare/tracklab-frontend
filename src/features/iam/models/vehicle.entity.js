export class Vehicle {
  constructor({
    vehicleId,
    accountId,
    plateNumber,
    type,
    capacityTons = 0,
    capacityPassengers = 0,
    status = Vehicle.STATUS.AVAILABLE,
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    this.vehicleId = vehicleId;
    this.accountId = accountId;
    this.plateNumber = plateNumber;
    this.type = type;
    this.capacityTons = capacityTons;
    this.capacityPassengers = capacityPassengers;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static STATUS = {
    AVAILABLE: 'AVAILABLE',
    MAINTENANCE: 'MAINTENANCE',
    ASSIGNED: 'ASSIGNED'
  };

  get isAvailable() {
    return this.status === Vehicle.STATUS.AVAILABLE;
  }

  markAsMaintenance() {
    this.status = Vehicle.STATUS.MAINTENANCE;
  }

  assignToAccount(accountId) {
    this.accountId = accountId;
    this.status = Vehicle.STATUS.ASSIGNED;
  }
}

export default Vehicle;
