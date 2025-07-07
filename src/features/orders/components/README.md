# Componentes Modulares de Orders

Esta carpeta contiene componentes reutilizables para el bounded context de Orders, siguiendo las mejores prácticas de modularidad y DRY.

## 📁 **Componentes Disponibles**

### **OrderStatusChip.vue**
Componente para mostrar el estado de las órdenes con colores e iconos distintivos.

**Características:**
- ✅ Usa **OrderStatus enum** para validación
- ✅ **Tamaños configurables** (small, medium, large)
- ✅ **Colores automáticos** por estado
- ✅ **Iconos Material Design**
- ✅ **Responsive**

**Uso:**
```vue
<OrderStatusChip 
  :status="order.status" 
  size="medium" 
/>
```

### **OrderCard.vue**
Tarjeta reutilizable para mostrar información de órdenes.

**Características:**
- ✅ Usa **OrderEntity** con métodos de negocio
- ✅ **Expandible** para mostrar detalles
- ✅ **Acciones contextuales** según rol de usuario
- ✅ **UX Service** para confirmaciones
- ✅ **Router integration** para navegación
- ✅ **i18n** completo
- ✅ **Responsive design**

**Uso:**
```vue
<OrderCard 
  :order="orderData"
  :show-details="true"
  :user-role="userRole"
  @cancel-order="handleCancelOrder"
  @track-order="handleTrackOrder"
/>
```

### **ProductSelector.vue**
Selector de productos para crear órdenes, integrando servicios cross-context.

**Características:**
- ✅ **Cross-context service** (ProductService de resources)
- ✅ **Búsqueda y filtros** en tiempo real
- ✅ **Selector de cantidad** interactivo
- ✅ **Resumen de orden** en tiempo real
- ✅ **Estados de carga** y vacío
- ✅ **UX Service** para manejo de errores
- ✅ **Grid responsive**

**Uso:**
```vue
<ProductSelector 
  @products-selected="handleProductsSelected"
/>
```

## 🎯 **Patrones Implementados**

### **1. Modularidad**
- Componentes específicos en `/features/orders/components/`
- Reutilización mediante props y eventos
- Separación de responsabilidades clara

### **2. Integración con Modelos**
- **OrderEntity** para lógica de negocio
- **OrderStatus enum** para validación de estados
- Formateo automático de datos

### **3. Servicios Cross-Context**
- **ProductService** del context resources
- **UxService** para snackbars y confirmaciones
- **Router** para navegación

### **4. i18n y UX**
- Textos traducibles con `$t()`
- Confirmaciones amigables con UxService
- Estados de loading y error

### **5. Responsive Design**
- Grid layouts adaptables
- Breakpoints móviles
- Botones touch-friendly

## 🔧 **Cómo Usar en Vistas**

### **Ejemplo: Vista de Lista de Órdenes**
```vue
<template>
  <div class="orders-list">
    <div class="orders-grid">
      <OrderCard
        v-for="order in orders"
        :key="order.orderId"
        :order="order"
        :user-role="currentUser.role"
        @cancel-order="cancelOrder"
        @track-order="trackOrder"
      />
    </div>
  </div>
</template>

<script>
import { OrderCard } from '../components'
import { OrderService } from '../services/order.service.js'
import { UxService } from '@/core/services/ux.service.js'

export default {
  components: { OrderCard },
  // ... resto del componente
}
</script>
```

### **Ejemplo: Vista de Creación de Orden**
```vue
<template>
  <div class="create-order">
    <ProductSelector @products-selected="handleProductSelection" />
    
    <div class="order-summary">
      <h3>{{ $t('orders.orderSummary') }}</h3>
      <!-- Formulario de dirección, etc. -->
    </div>
  </div>
</template>

<script>
import { ProductSelector } from '../components'
import { CreateOrderResource } from '../models'

export default {
  components: { ProductSelector },
  // ... resto del componente
}
</script>
```

## 🚀 **Beneficios Logrados**

1. **🔄 Reutilización**: Componentes usables en múltiples vistas
2. **🧪 Testeable**: Lógica separada en métodos específicos
3. **🌍 i18n Ready**: Textos traducibles desde el primer día
4. **📱 Responsive**: Funciona en mobile y desktop
5. **🎨 Consistente**: Uso de design system y Material Icons
6. **⚡ Performance**: Lazy loading y optimizaciones
7. **🛡️ Type Safety**: Uso de enums para validación
8. **🔧 Mantenible**: Código modular y bien documentado

## 📋 **Próximos Pasos Sugeridos**

1. **Componente OrderFilters**: Para filtrar órdenes por estado, fecha, etc.
2. **Componente OrderTimeline**: Para mostrar el progreso de tracking
3. **Componente OrderForm**: Form reutilizable para crear/editar órdenes
4. **Composables**: `useOrders`, `useOrderTracking` para lógica compartida
5. **Tests**: Unit tests para cada componente 