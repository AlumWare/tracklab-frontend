<template>
  <div class="product-selector">
    <div class="selector-header">
      <h3>{{ $t('orders.selectProducts') }}</h3>
      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('common.search')"
          class="search-input"
        >
        <i class="material-icons search-icon">search</i>
      </div>
    </div>

    <div class="products-grid" v-if="!isLoading">
      <div 
        v-for="product in filteredProducts" 
        :key="product.id"
        class="product-card"
        :class="{ 'selected': isSelected(product.id) }"
        @click="toggleProduct(product)"
      >
        <div class="product-info">
          <h3 class="product-name">{{ product.name }}</h3>
          <p class="product-description">{{ product.description }}</p>
          <div class="product-price">{{ formatPrice(product.priceAmount, product.priceCurrency) }}</div>
          
          <div v-if="isSelected(product.id)" class="quantity-controls">
            <button 
              class="quantity-btn"
              @click.stop="decreaseQuantity(product.id)"
            >
              <i class="material-icons">remove</i>
            </button>
            <span class="quantity">{{ getSelectedQuantity(product.id) }}</span>
            <button 
              class="quantity-btn"
              @click.stop="increaseQuantity(product.id)"
            >
              <i class="material-icons">add</i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="loading-state" v-else>
      <i class="material-icons spinning">refresh</i>
      <span>{{ $t('common.loading') }}</span>
    </div>

    <div class="no-results" v-if="!isLoading && filteredProducts.length === 0">
      <i class="material-icons">search_off</i>
      <span>{{ $t('common.noResults') }}</span>
    </div>

    <div class="selected-summary" v-if="selectedItems.size > 0">
      <h4>{{ $t('orders.orderSummary') }}</h4>
      <div class="summary-items">
        <div 
          v-for="[productId, quantity] in selectedItems" 
          :key="productId"
          class="summary-item"
        >
          <span class="item-name">{{ getProductName(productId) }}</span>
          <span class="item-quantity">x{{ quantity }}</span>
          <span class="item-total">{{ formatPrice(quantity * getProductPrice(productId), getProductCurrency(productId)) }}</span>
        </div>
      </div>
      <div class="summary-total">
        <strong>{{ $t('orders.orderTotal') }}: {{ formatPrice(totalAmount, totalCurrency) }}</strong>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { productService } from '@/features/resources/services/product.service.js'
import { UxService } from '@/core/services/ux.service.js'

export default {
  name: 'ProductSelector',
  props: {
    selectedProducts: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:selectedProducts'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const products = ref([])
    const searchQuery = ref('')
    const isLoading = ref(false)
    const selectedItems = ref(new Map())

    const filteredProducts = computed(() => {
      if (!searchQuery.value) return products.value
      
      const query = searchQuery.value.toLowerCase()
      return products.value.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      )
    })

    const totalAmount = computed(() => {
      return Array.from(selectedItems.value.entries()).reduce((total, [productId, quantity]) => {
        const product = products.value.find(p => p.id === productId)
        return total + (product ? quantity * product.priceAmount : 0)
      }, 0)
    })

    const totalCurrency = computed(() => {
      if (selectedItems.value.size === 0) return 'PEN'
      const firstProductId = Array.from(selectedItems.value.keys())[0]
      const product = products.value.find(p => p.id === firstProductId)
      return product ? product.priceCurrency : 'PEN'
    })

    const loadProducts = async () => {
      isLoading.value = true
      try {
        const data = await productService.getAvailableProducts()
        products.value = data
        
        // Restaurar productos seleccionados
        props.selectedProducts.forEach(item => {
          selectedItems.value.set(item.id, item.quantity)
        })
      } catch (error) {
        console.error('Error loading products:', error)
        UxService.showSnackbar({
          message: t('products.error.loadFailed'),
          type: 'error'
        })
      } finally {
        isLoading.value = false
      }
    }

    const isSelected = (productId) => {
      return selectedItems.value.has(productId)
    }

    const getSelectedQuantity = (productId) => {
      return selectedItems.value.get(productId) || 0
    }

    const toggleProduct = (product) => {
      if (isSelected(product.id)) {
        selectedItems.value.delete(product.id)
      } else {
        selectedItems.value.set(product.id, 1)
      }
      emitSelection()
    }

    const increaseQuantity = (productId) => {
      const currentQty = selectedItems.value.get(productId) || 0
      selectedItems.value.set(productId, currentQty + 1)
      emitSelection()
    }

    const decreaseQuantity = (productId) => {
      const currentQty = selectedItems.value.get(productId) || 0
      if (currentQty > 1) {
        selectedItems.value.set(productId, currentQty - 1)
      } else {
        selectedItems.value.delete(productId)
      }
      emitSelection()
    }

    const emitSelection = () => {
      const selection = Array.from(selectedItems.value.entries()).map(([id, quantity]) => {
        const product = products.value.find(p => p.id === id)
        return {
          id,
          quantity,
          name: product.name,
          priceAmount: product.priceAmount,
          priceCurrency: product.priceCurrency
        }
      })
      emit('update:selectedProducts', selection)
    }

    const formatPrice = (amount, currency) => {
      return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: currency || 'PEN'
      }).format(amount)
    }

    const getProductName = (productId) => {
      const product = products.value.find(p => p.id === productId)
      return product ? product.name : ''
    }

    const getProductPrice = (productId) => {
      const product = products.value.find(p => p.id === productId)
      return product ? product.priceAmount : 0
    }

    const getProductCurrency = (productId) => {
      const product = products.value.find(p => p.id === productId)
      return product ? product.priceCurrency : 'PEN'
    }

    onMounted(loadProducts)

    return {
      products,
      searchQuery,
      isLoading,
      filteredProducts,
      totalAmount,
      totalCurrency,
      selectedItems,
      isSelected,
      getSelectedQuantity,
      toggleProduct,
      increaseQuantity,
      decreaseQuantity,
      formatPrice,
      getProductName,
      getProductPrice,
      getProductCurrency
    }
  }
}
</script>

<style scoped>
.product-selector {
  padding: 1rem;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.selector-header h3 {
  margin: 0;
  color: #1a1a1a;
}

.search-bar {
  position: relative;
  max-width: 300px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.search-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.product-card {
  background: var(--color-background-card);
  border: 2px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.product-card.selected {
  border-color: var(--color-primary);
  background: var(--color-background-selected);
}

.product-info {
  padding: 1rem;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text-primary);
}

.product-description {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
}

.product-price {
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.quantity-btn {
  background: var(--color-background-button);
  border: none;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-primary);
  transition: background-color 0.2s ease;
}

.quantity-btn:hover {
  background: var(--color-background-button-hover);
}

.quantity-btn i {
  font-size: 18px;
}

.quantity {
  font-weight: 600;
  min-width: 24px;
  text-align: center;
}

.loading-state,
.no-results {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-secondary);
  gap: 0.5rem;
}

.loading-state i {
  font-size: 2rem;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.no-results i {
  font-size: 2rem;
  color: #ccc;
}

.selected-summary {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.selected-summary h4 {
  margin: 0 0 1rem 0;
  color: #1a1a1a;
}

.summary-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.summary-item:last-child {
  border-bottom: none;
}

.item-name {
  font-weight: 500;
  flex: 1;
}

.item-quantity {
  color: #666;
  margin: 0 1rem;
}

.item-total {
  font-weight: 600;
  color: #2e7d32;
}

.summary-total {
  text-align: right;
  padding-top: 1rem;
  border-top: 2px solid #e0e0e0;
  font-size: 1.1rem;
  color: #1a1a1a;
}

@media (max-width: 768px) {
  .selector-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .search-bar {
    max-width: none;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style> 