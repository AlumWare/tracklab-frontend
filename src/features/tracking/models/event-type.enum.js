/**
 * Enum class for event types
 */
export class EventType {
  constructor(name, description) {
    this.name = name;
    this.description = description;
  }

  // Predefined event types
  static Arrival = new EventType('ARRIVAL', 'Llegada del contenedor');
  static Departure = new EventType('DEPARTURE', 'Salida del contenedor');
  static Creation = new EventType('CREATION', 'Creación del contenedor');
  static Delivered = new EventType('DELIVERED', 'Contenedor entregado');

  /**
   * Get all available event types
   * @returns {EventType[]} Array of event type instances
   */
  static getAllTypes() {
    return [EventType.Arrival, EventType.Departure, EventType.Creation, EventType.Delivered];
  }

  /**
   * Create event type from name (validates against predefined types)
   * @param {string} name - Event type name to find
   * @returns {EventType} Event type instance
   * @throws {Error} If event type name is invalid
   */
  static fromName(name) {
    const type = EventType.getAllTypes().find(t => t.name === name);
    if (!type) {
      throw new Error(`Invalid event type: ${name}. Must be one of: ${EventType.getAllTypes().map(t => t.name).join(', ')}`);
    }
    return type;
  }

  /**
   * Check if event type name is valid
   * @param {string} name - Event type name to validate
   * @returns {boolean} True if valid event type name
   */
  static isValidType(name) {
    return EventType.getAllTypes().some(t => t.name === name);
  }

  // Convenience methods
  isArrival() {
    return this === EventType.Arrival;
  }

  isDeparture() {
    return this === EventType.Departure;
  }

  isCreation() {
    return this === EventType.Creation;
  }

  isDelivered() {
    return this === EventType.Delivered;
  }

  /**
   * Convert event type to string representation
   * @returns {string} Event type name
   */
  toString() {
    return this.name;
  }
}
