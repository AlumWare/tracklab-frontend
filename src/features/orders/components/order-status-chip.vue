<template>
  <div 
    class="order-status-chip"
    :class="[`status-${status.name.toLowerCase()}`, sizeClass]"
  >
    <i class="status-icon">{{ statusIcon }}</i>
    <span class="status-text">{{ status.description }}</span>
  </div>
</template>

<script>
import { computed } from 'vue'
import { OrderStatus } from '../models/order-status.enum.js'

export default {
  name: 'OrderStatusChip',
  props: {
    status: {
      type: [String, Object],
      required: true
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    }
  },
  setup(props) {
    const normalizedStatus = computed(() => {
      if (typeof props.status === 'string') {
        return OrderStatus.fromName(props.status)
      }
      return props.status
    })

    const statusIcon = computed(() => {
      const iconMap = {
        'PENDING': 'schedule',
        'IN_PROCESS': 'autorenew',
        'SHIPPED': 'local_shipping',
        'DELIVERED': 'check_circle',
        'CANCELLED': 'cancel'
      }
      return iconMap[normalizedStatus.value.name] || 'info'
    })

    const sizeClass = computed(() => `size-${props.size}`)

    return {
      status: normalizedStatus,
      statusIcon,
      sizeClass
    }
  }
}
</script>

<style scoped>
.order-status-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.size-small {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
}

.size-medium {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.size-large {
  padding: 0.75rem 1.25rem;
  font-size: 1rem;
}

.status-icon {
  font-size: 1.2em;
  font-family: 'Material Icons';
}

/* Estados específicos */
.status-pending {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.status-in_process {
  background-color: #cce5ff;
  color: #0056b3;
  border: 1px solid #99d3ff;
}

.status-shipped {
  background-color: #e1f5fe;
  color: #01579b;
  border: 1px solid #4fc3f7;
}

.status-delivered {
  background-color: #e8f5e8;
  color: #2e7d32;
  border: 1px solid #81c784;
}

.status-cancelled {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ef9a9a;
}
</style> 