# Modelos del Bounded Context: Orders

Este directorio contiene los modelos para el manejo de órdenes en el frontend.

## Estructura

### Resources
Los **Resources** representan la estructura de datos que viene del backend (DTOs):

- `OrderResource`: Datos de una orden completa
- `CreateOrderResource`: Datos para crear una nueva orden
- `OrderItemResource`: Datos de un item de orden
- `OrderTrackingInfoResource`: Información de seguimiento de la orden

### Entities
Las **Entities** contienen la lógica de negocio y métodos útiles para el frontend:

- `OrderEntity`: Lógica de negocio para órdenes
- `OrderItemEntity`: Lógica de negocio para items de orden

### Enums
Los **Enums** definen los valores válidos para ciertos campos:

- `OrderStatus`: Estados posibles de una orden
  - `PENDING`: Orden pendiente
  - `IN_PROCESS`: Orden en proceso
  - `SHIPPED`: Orden enviada
  - `DELIVERED`: Orden entregada
  - `CANCELLED`: Orden cancelada

## Uso en el Frontend

### 1. Transformar datos del backend a entidades

```javascript
import { OrderEntity, OrderResource, OrderStatus } from '@/features/orders/models'

// Datos del backend
const orderData = await orderService.getOrder(orderId)

// Crear resource
const orderResource = new OrderResource(orderData)

// Crear entity con lógica de negocio (automáticamente convierte status a enum)
const orderEntity = new OrderEntity(orderResource)

// También puedes trabajar directamente con enums
const pendingStatus = OrderStatus.Pending
const isValidStatus = OrderStatus.isValidStatus('PENDING') // true
```

### 2. Usar métodos útiles de las entidades

```javascript
// Verificar estado
if (orderEntity.isPending()) {
  // Mostrar botón de cancelar
}

// Formatear datos para UI
const formattedPrice = orderEntity.getFormattedPrice() // "S/ 150.00"
const formattedDate = orderEntity.getFormattedDate() // "15 de enero de 2024"
const statusInSpanish = orderEntity.getStatusInSpanish() // "Pendiente"
const totalItems = orderEntity.getTotalItems() // 5
```

### 3. Enviar datos al backend

```javascript
// Convertir entity a objeto plano para APIs
const orderData = orderEntity.toPlainObject()
await orderService.updateOrder(orderData)
```

## Beneficios

1. **Separación de responsabilidades**: Resources para datos, Entities para lógica
2. **Reutilización**: Métodos de formateo y validación centralizados
3. **Mantenibilidad**: Cambios en la lógica de negocio en un solo lugar
4. **Consistencia**: Formato uniforme de datos en toda la aplicación
5. **Seguridad de tipos**: Enums previenen errores de valores inválidos
6. **Validación automática**: Los enums validan los datos del backend
7. **Internacionalización**: Descripciones en español centralizadas en los enums 