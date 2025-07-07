# Modelos del Bounded Context: Tracking

Este directorio contiene los modelos para el manejo de seguimiento y rutas en el frontend.

## Estructura

### Resources
Los **Resources** representan la estructura de datos que viene del backend (DTOs):

#### Container Resources
- `ContainerResource`: Datos de un contenedor completo
- `CreateContainerResource`: Datos para crear un nuevo contenedor
- `ShipItemResource`: Datos de un item de envío
- `QrCodeResource`: Datos del código QR del contenedor
- `CompleteContainerResource`: Datos para completar un contenedor

#### Route Resources
- `RouteResource`: Datos de una ruta completa
- `CreateRouteResource`: Datos para crear una nueva ruta
- `RouteItemResource`: Datos de un item de ruta (almacén)
- `AddNodeResource`: Datos para agregar un nodo a la ruta
- `AddOrderToRouteResource`: Datos para agregar una orden a la ruta

#### TrackingEvent Resources
- `TrackingEventResource`: Datos de un evento de seguimiento

### Entities
Las **Entities** contienen la lógica de negocio y métodos útiles para el frontend:

- `ContainerEntity`: Lógica de negocio para contenedores
- `ShipItemEntity`: Lógica de negocio para items de envío
- `RouteEntity`: Lógica de negocio para rutas
- `RouteItemEntity`: Lógica de negocio para items de ruta
- `TrackingEventEntity`: Lógica de negocio para eventos de seguimiento

### Enums
Los **Enums** definen los valores válidos para ciertos campos:

- `EventType`: Tipos de eventos de seguimiento
  - `CREATION`: Creación del contenedor
  - `ARRIVAL`: Llegada del contenedor
  - `DEPARTURE`: Salida del contenedor  
  - `DELIVERED`: Contenedor entregado

## Uso en el Frontend

### 1. Trabajar con Contenedores

```javascript
import { ContainerEntity, ContainerResource } from '@/features/tracking/models'

// Datos del backend
const containerData = await containerService.getContainer(containerId)

// Crear entity
const containerEntity = new ContainerEntity(new ContainerResource(containerData))

// Usar métodos útiles
const isCompleted = containerEntity.isContainerCompleted()
const status = containerEntity.getStatusInSpanish() // "Completado" o "Pendiente"
const weight = containerEntity.getFormattedWeight() // "150 kg"
const totalItems = containerEntity.getTotalItems() // 10
const hasQR = containerEntity.hasQRCode()
```

### 2. Trabajar con Rutas

```javascript
import { RouteEntity, RouteResource } from '@/features/tracking/models'

const routeData = await routeService.getRoute(routeId)
const routeEntity = new RouteEntity(new RouteResource(routeData))

// Calcular progreso
const progress = routeEntity.getProgressPercentage() // 75
const totalWarehouses = routeEntity.getTotalWarehouses() // 4
const completedWarehouses = routeEntity.getCompletedWarehouses() // 3
const nextWarehouse = routeEntity.getNextWarehouse() // { id: 4, warehouseId: 'W004' }

// Verificar estado
const isActive = routeEntity.isRouteActive()
const isCompleted = routeEntity.isCompleted()
const hasStarted = routeEntity.hasStarted()
```

### 3. Trabajar con Eventos de Seguimiento

```javascript
import { TrackingEventEntity, EventType } from '@/features/tracking/models'

const eventEntity = new TrackingEventEntity(eventData)

// Formatear para UI
const eventType = eventEntity.getEventTypeInSpanish() // "Llegada del contenedor"
const eventTime = eventEntity.getFormattedEventTime() // "15 de enero de 2024, 14:30"
const timeAgo = eventEntity.getTimeAgo() // "Hace 2 horas"
const eventColor = eventEntity.getEventColor() // "#9C27B0"
const eventIcon = eventEntity.getEventIcon() // "warehouse"

// Verificar tipo de evento
const isDelivery = eventEntity.isDeliveryEvent()
const isArrival = eventEntity.isArrivalEvent()
const isDeparture = eventEntity.isDepartureEvent()
const isCreation = eventEntity.isCreationEvent()

// Trabajar directamente con enums
const arrivalType = EventType.Arrival
const isValidType = EventType.isValidType('ARRIVAL') // true
```

### 4. Ejemplo de implementación en componente Vue

```vue
<template>
  <div class="tracking-card">
    <div class="container-info">
      <h3>Contenedor {{ container.containerId }}</h3>
      <span :class="['status', container.isContainerCompleted() ? 'completed' : 'pending']">
        {{ container.getStatusInSpanish() }}
      </span>
      <p>Peso: {{ container.getFormattedWeight() }}</p>
      <p>Items: {{ container.getTotalItems() }}</p>
    </div>
    
    <div class="tracking-events">
      <div 
        v-for="event in trackingEvents" 
        :key="event.eventId"
        class="event-item"
        :style="{ borderColor: event.getEventColor() }"
      >
        <i :style="{ color: event.getEventColor() }">{{ event.getEventIcon() }}</i>
        <div>
          <p><strong>{{ event.getEventTypeInSpanish() }}</strong></p>
          <p>{{ event.getFormattedEventTime() }}</p>
          <small>{{ event.getTimeAgo() }}</small>
        </div>
      </div>
    </div>
    
    <!-- Botón para añadir evento -->
    <div class="add-event-section">
      <select v-model="selectedEventType">
        <option v-for="eventType in availableEventTypes" :key="eventType.name" :value="eventType">
          {{ eventType.description }}
        </option>
      </select>
      <button @click="addEvent">Añadir Evento</button>
    </div>
  </div>
</template>

<script>
import { ContainerEntity, TrackingEventEntity, EventType } from '@/features/tracking/models'

export default {
  data() {
    return {
      container: null,
      trackingEvents: [],
      selectedEventType: EventType.Arrival,
      availableEventTypes: EventType.getAllTypes()
    }
  },
  
  async mounted() {
    // Cargar datos del contenedor
    const containerData = await this.$containerService.getContainer(this.containerId)
    this.container = new ContainerEntity(containerData)
    
    // Cargar eventos de seguimiento
    const eventsData = await this.$trackingService.getContainerEvents(this.containerId)
    this.trackingEvents = eventsData.map(event => new TrackingEventEntity(event))
  },
  
  methods: {
    async addEvent() {
      const eventData = {
        containerId: this.container.containerId,
        type: this.selectedEventType.name,
        eventTime: new Date().toISOString(),
        warehouseId: 'W001'
      }
      
      // Enviar al backend
      await this.$trackingService.createEvent(eventData)
      
      // Actualizar lista local
      const newEvent = new TrackingEventEntity(eventData)
      this.trackingEvents.push(newEvent)
    }
  }
}
</script>
```

## Beneficios

1. **Formateo automático**: Fechas, pesos y estados en español
2. **Validaciones de estado**: Métodos para verificar estados específicos
3. **Información visual**: Colores e iconos para eventos
4. **Cálculos automáticos**: Progreso, totales y estadísticas
5. **Reutilización**: Lógica compartida entre componentes
6. **Seguridad de tipos**: Enums previenen errores de valores inválidos
7. **Validación automática**: Los enums validan los datos del backend
8. **Consistencia visual**: Colores e iconos definidos por tipo de evento 