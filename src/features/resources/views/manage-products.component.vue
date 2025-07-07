<template>
  <div class="manage-products">
    <div class="page-header">
      <h1 class="page-title">{{ $t('resources.products.title') }}</h1>
      <BaseButton 
        variant="primary" 
        icon="fas fa-plus" 
        @click="showCreateModal = true"
      >
        {{ $t('resources.products.actions.add') }}
      </BaseButton>
    </div>

    <div class="filters-section">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('resources.products.actions.search')"
          class="search-input"
          @input="handleSearch"
        />
        <i class="fas fa-search search-icon"></i>
      </div>
      
      <select v-model="selectedCategory" class="category-filter" @change="filterProducts">
        <option value="">{{ $t('resources.products.fields.category') }}</option>
        <option value="electronics">Electrónicos</option>
        <option value="clothing">Ropa</option>
        <option value="books">Libros</option>
        <option value="home">Hogar</option>
      </select>
    </div>

    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin loading-spinner"></i>
      <p>{{ $t('common.loading') }}</p>
    </div>

    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-triangle error-icon"></i>
      <p>{{ error }}</p>
      <BaseButton variant="outline" @click="loadProducts">
        {{ $t('common.retry') }}
      </BaseButton>
    </div>

    <div v-else-if="filteredProducts.length === 0" class="empty-state">
      <i class="fas fa-info-circle empty-icon"></i>
      <p>{{ $t('resources.products.messages.noProducts') }}</p>
    </div>

    <div v-else class="products-grid">
      <div 
        v-for="product in filteredProducts" 
        :key="product.id" 
        class="product-card"
      >
        <div class="product-image">
          <img 
            v-if="product.images.length > 0" 
            :src="product.images[0]" 
            :alt="product.name"
            class="product-img"
          />
                     <div v-else class="no-image">
             <i class="fas fa-image"></i>
           </div>
        </div>

        <div class="product-info">
          <h3 class="product-name">{{ product.name }}</h3>
          <p class="product-description">{{ product.description }}</p>
          
          <div class="product-details">
            <span class="product-price">{{ product.getFormattedPrice() }}</span>
            <span 
              :class="['product-status', `status-${product.status}`]"
            >
              {{ $t(`resources.products.status.${product.status}`) }}
            </span>
          </div>

          <div class="product-meta">
            <span class="stock-info">
              {{ $t('resources.products.fields.stock') }}: {{ product.stock }}
            </span>
            <span v-if="product.manufacturer" class="manufacturer">
              {{ product.manufacturer }}
            </span>
          </div>
        </div>

        <div class="product-actions">
          <BaseButton 
            variant="text" 
            icon="far fa-eye" 
            size="small"
            @click="viewProduct(product)"
          >
            {{ $t('resources.products.actions.view') }}
          </BaseButton>
          
          <BaseButton 
            variant="text" 
            icon="far fa-edit" 
            size="small"
            @click="editProduct(product)"
          >
            {{ $t('resources.products.actions.edit') }}
          </BaseButton>
          
          <BaseButton 
            variant="text" 
            icon="far fa-trash-alt" 
            size="small"
            @click="confirmDelete(product)"
          >
            {{ $t('resources.products.actions.delete') }}
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content" @click.stop>
        <h3>{{ $t('resources.products.messages.confirmDelete') }}</h3>
        <p>{{ selectedProduct?.name }}</p>
        <div class="modal-actions">
          <BaseButton variant="outline" @click="showDeleteModal = false">
            {{ $t('common.cancel') }}
          </BaseButton>
          <BaseButton variant="secondary" @click="deleteProduct">
            {{ $t('resources.products.actions.delete') }}
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ProductService } from '../services/product.service'
import BaseButton from '@/shared/components/BaseButton.vue'

export default {
  name: 'ManageProducts',
  components: {
    BaseButton
  },
  setup() {
    const { t } = useI18n()
    
    const products = ref([])
    const loading = ref(false)
    const error = ref('')
    const searchQuery = ref('')
    const selectedCategory = ref('')
    const showCreateModal = ref(false)
    const showDeleteModal = ref(false)
    const selectedProduct = ref(null)

    const filteredProducts = computed(() => {
      let filtered = products.value

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(product => 
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
        )
      }

      if (selectedCategory.value) {
        filtered = filtered.filter(product => 
          product.category === selectedCategory.value
        )
      }

      return filtered
    })

    const loadProducts = async () => {
      loading.value = true
      error.value = ''
      
      try {
        const productService = new ProductService()
        products.value = await productService.getAvailableProducts()
      } catch (err) {
        error.value = t('resources.products.messages.loadingError')
        console.error('Error loading products:', err)
      } finally {
        loading.value = false
      }
    }

    const handleSearch = () => {
      // La búsqueda se maneja reactivamente a través del computed
    }

    const filterProducts = () => {
      // El filtrado se maneja reactivamente a través del computed
    }

    const viewProduct = (product) => {
      console.log('Viewing product:', product)
      // Implementar vista de detalles
    }

    const editProduct = (product) => {
      console.log('Editing product:', product)
      // Implementar edición
    }

    const confirmDelete = (product) => {
      selectedProduct.value = product
      showDeleteModal.value = true
    }

    const deleteProduct = async () => {
      if (!selectedProduct.value) return

      try {
        const productService = new ProductService()
        // Simular eliminación ya que no tenemos el endpoint delete
        products.value = products.value.filter(p => p.id !== selectedProduct.value.id)
        showDeleteModal.value = false
        selectedProduct.value = null
      } catch (err) {
        error.value = t('resources.products.messages.error')
        console.error('Error deleting product:', err)
      }
    }

    onMounted(() => {
      loadProducts()
    })

    return {
      products,
      loading,
      error,
      searchQuery,
      selectedCategory,
      showCreateModal,
      showDeleteModal,
      selectedProduct,
      filteredProducts,
      loadProducts,
      handleSearch,
      filterProducts,
      viewProduct,
      editProduct,
      confirmDelete,
      deleteProduct
    }
  }
}
</script>

<style lang="scss" scoped>
.manage-products {
  padding: 1.5rem;
  background-color: var(--color-background-primary);
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.filters-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid var(--color-border);
  border-radius: 0.5rem;
  font-size: 1rem;
  color: var(--color-text-primary);
  background-color: var(--color-background-card);

  &:focus {
    outline: none;
    border-color: var(--color-border-focus);
  }
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
}

.category-filter {
  padding: 0.75rem 1rem;
  border: 2px solid var(--color-border);
  border-radius: 0.5rem;
  font-size: 1rem;
  color: var(--color-text-primary);
  background-color: var(--color-background-card);
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: var(--color-border-focus);
  }
}

.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.loading-spinner {
  font-size: 2rem;
  color: var(--color-primary);
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.error-icon, .empty-icon {
  font-size: 3rem;
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.product-card {
  background-color: var(--color-background-card);
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
}

.product-image {
  height: 200px;
  overflow: hidden;
  background-color: var(--color-background-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  color: var(--color-text-disabled);
  font-size: 3rem;
}

.product-info {
  padding: 1.5rem;
}

.product-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 0.5rem 0;
}

.product-description {
  color: var(--color-text-secondary);
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.product-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.product-price {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-primary);
}

.product-status {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;

  &.status-available {
    background-color: rgba(76, 175, 80, 0.1);
    color: var(--color-success);
  }

  &.status-lowStock {
    background-color: rgba(255, 152, 0, 0.1);
    color: var(--color-warning);
  }

  &.status-outOfStock {
    background-color: rgba(244, 67, 54, 0.1);
    color: var(--color-error);
  }
}

.product-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.product-actions {
  display: flex;
  justify-content: space-around;
  padding: 1rem;
  border-top: 1px solid var(--color-border);
  background-color: var(--color-background-secondary);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--color-background-card);
  padding: 2rem;
  border-radius: 0.75rem;
  max-width: 400px;
  width: 90%;
  text-align: center;

  h3 {
    color: var(--color-text-primary);
    margin-bottom: 1rem;
  }

  p {
    color: var(--color-text-secondary);
    margin-bottom: 2rem;
  }
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
