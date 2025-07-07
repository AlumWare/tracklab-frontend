<template>
  <div class="order-creation-view">
    <div class="view-header">
      <h1>{{ $t('orders.createOrder') }}</h1>
    </div>

    <div class="order-form" v-if="!orderCreated">
      <!-- Información básica de la orden -->
      <section class="form-section">
        <h2>{{ $t('orders.shippingInfo') }}</h2>
        <div class="form-grid">
          <BaseFormField
            v-model="orderData.shippingAddress"
            :label="$t('orders.shippingAddress')"
            type="text"
            :placeholder="$t('orders.form.addressPlaceholder')"
            required
          />

          <BaseFormField
            v-model="orderData.deliveryDate"
            :label="$t('orders.deliveryDate')"
            type="date"
            :min="minDeliveryDate"
            required
          />

          <BaseFormField
            v-model="orderData.logisticsId"
            :label="$t('orders.logisticsCompany')"
            type="select"
            :options="[
              { value: null, label: $t('orders.form.selectLogisticsPlaceholder') },
              { value: 1, label: 'Express Logistics S.A.' }
            ]"
            required
          />
        </div>
      </section>

      <!-- Selección de productos -->
      <section class="form-section">
        <div class="section-header">
          <h2>{{ $t('orders.selectProducts') }}</h2>
          <div class="total-summary" v-if="hasProducts">
            <span>{{ $t('orders.totalItems') }}: {{ totalItems }}</span>
            <span>{{ $t('orders.totalPrice') }}: {{ formattedTotalPrice }}</span>
          </div>
        </div>

        <ProductSelector
          @update:selectedProducts="handleProductsSelected"
          :selected-products="selectedProducts"
        />
      </section>

      <!-- Botones de acción -->
      <div class="form-actions">
        <BaseButton
          variant="secondary"
          @click="$router.back()"
        >
          {{ $t('common.cancel') }}
        </BaseButton>
        
        <BaseButton
          variant="primary"
          @click="createOrder"
          :disabled="!isFormValid"
          :loading="isSubmitting"
        >
          {{ $t('orders.createOrder') }}
        </BaseButton>
      </div>
    </div>

    <!-- Mensaje de éxito -->
    <div v-else class="success-view">
      <div class="success-content">
        <i class="material-icons success-icon">check_circle</i>
        <h2>{{ $t('orders.orderCreatedSuccess') }}</h2>
        <p>{{ $t('orders.orderCreatedMessage') }}</p>
        <div class="success-actions">
          <BaseButton
            variant="secondary"
            @click="createNewOrder"
          >
            {{ $t('orders.createAnother') }}
          </BaseButton>
          
          <BaseButton
            variant="primary"
            @click="viewOrders"
          >
            {{ $t('orders.viewOrders') }}
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import BaseButton from '@/shared/components/BaseButton.vue'
import BaseFormField from '@/shared/components/base-form-field.component.vue'
import ProductSelector from '../components/product-selector.vue'
import { productService } from '@/features/resources/services/product.service.js'
import { OrderService } from '../services/order.service.js'
import { UxService } from '@/core/services/ux.service.js'

import { CreateOrderResource } from '../models/order.resource.js'

export default {
  name: 'ClientOrderCreationView',
  
  components: {
    BaseButton,
    BaseFormField,
    ProductSelector
  },

  setup() {
    const { t } = useI18n()
    const router = useRouter()

    // Estado del formulario
    const orderData = ref({
      shippingAddress: '',
      deliveryDate: '',
      logisticsId: '',
      orderItems: []
    })
    const selectedProducts = ref([])
    const isSubmitting = ref(false)
    const orderCreated = ref(false)

    // Computed properties
    const minDeliveryDate = computed(() => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      return tomorrow.toISOString().split('T')[0]
    })

    const totalItems = computed(() => {
      return selectedProducts.value.reduce((sum, item) => sum + item.quantity, 0)
    })

    const totalPrice = computed(() => {
      return selectedProducts.value.reduce((sum, item) => {
        return sum + (item.quantity * item.priceAmount)
      }, 0)
    })

    const formattedTotalPrice = computed(() => {
      return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
      }).format(totalPrice.value)
    })

    const hasProducts = computed(() => selectedProducts.value.length > 0)

    const isFormValid = computed(() => {
      return orderData.value.shippingAddress &&
             orderData.value.deliveryDate &&
             orderData.value.logisticsId &&
             selectedProducts.value.length > 0
    })

    // Métodos
    const handleProductsSelected = (products) => {
      selectedProducts.value = products
    }

    const createOrder = async () => {
      if (!isFormValid.value) return

      isSubmitting.value = true
      try {


        // Crear items de la orden con la estructura correcta
        const orderItems = selectedProducts.value.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          priceAmount: item.priceAmount,
          priceCurrency: item.priceCurrency
        }))

        // Crear el payload correcto usando CreateOrderResource
        const createOrderPayload = new CreateOrderResource({
          customerId: null, // Se asigna automáticamente en el backend
          logisticsId: orderData.value.logisticsId,
          shippingAddress: orderData.value.shippingAddress,
          items: orderItems
        })

        await OrderService.createOrder(createOrderPayload)

        orderCreated.value = true
        UxService.showSnackbar({
          message: t('orders.orderCreatedSuccess'),
          type: 'success'
        })
      } catch (error) {
        console.error('Error creating order:', error)
        UxService.showSnackbar({
          message: t('orders.error.createFailed'),
          type: 'error'
        })
      } finally {
        isSubmitting.value = false
      }
    }

    const createNewOrder = () => {
      orderData.value = {
        shippingAddress: '',
        deliveryDate: '',
        orderItems: []
      }
      selectedProducts.value = []
      orderCreated.value = false
    }

    const viewOrders = () => {
      router.push('/tracklab/orders')
    }

    return {
      orderData,
      selectedProducts,
      isSubmitting,
      orderCreated,
      minDeliveryDate,
      totalItems,
      formattedTotalPrice,
      hasProducts,
      isFormValid,
      handleProductsSelected,
      createOrder,
      createNewOrder,
      viewOrders
    }
  }
}
</script>

<style scoped lang="scss">
.order-creation-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;

  .view-header {
    margin-bottom: 2rem;
    
    h1 {
      font-size: 1.75rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }
  }

  .form-section {
    background: var(--color-background-card);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: var(--shadow-sm);

    h2 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      color: var(--color-text-primary);
    }
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;

    .total-summary {
      display: flex;
      gap: 1.5rem;
      font-weight: 500;

      span {
        color: var(--color-text-secondary);
      }
    }
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
  }

  .success-view {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;

    .success-content {
      text-align: center;
      max-width: 400px;

      .success-icon {
        font-size: 4rem;
        color: var(--color-success);
        margin-bottom: 1rem;
      }

      h2 {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: var(--color-text-primary);
      }

      p {
        color: var(--color-text-secondary);
        margin-bottom: 2rem;
      }

      .success-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
      }
    }
  }
}

@media (max-width: 768px) {
  .order-creation-view {
    padding: 1rem;

    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .form-actions {
      flex-direction: column;
      
      button {
        width: 100%;
      }
    }
  }
}
</style>
