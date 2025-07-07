<template>
  <div class="warehouse-selector">
    <div class="selector-header">
      <h4>{{ t('routePlanning.selectWarehouse') }}</h4>
      <div class="search-filter">
        <input 
          v-model="searchTerm" 
          type="text" 
          :placeholder="t('routePlanning.searchWarehouses')"
          class="search-input"
        />
        <select v-model="typeFilter" class="type-filter">
          <option value="">{{ t('routePlanning.allTypes') }}</option>
          <option value="DISTRIBUTION">{{ t('warehouses.type.distribution') }}</option>
          <option value="STORAGE">{{ t('warehouses.type.storage') }}</option>
          <option value="FULFILLMENT">{{ t('warehouses.type.fulfillment') }}</option>
        </select>
      </div>
    </div>
    
    <div class="warehouses-container">
      <div v-if="filteredWarehouses.length === 0" class="no-warehouses">
        {{ t('routePlanning.noWarehousesAvailable') }}
      </div>
      <div v-else class="warehouses-list">
        <div 
          v-for="warehouse in paginatedWarehouses" 
          :key="warehouse.id"
          class="warehouse-item"
          :class="{ disabled: isWarehouseSelected(warehouse.id) }"
        >
          <div class="warehouse-info">
            <div class="warehouse-header">
              <span class="name">{{ warehouse.name }}</span>
              <span class="type">{{ t(`warehouses.type.${warehouse.type.toLowerCase()}`) }}</span>
            </div>
            <div class="warehouse-address">
              {{ warehouse.address }}
            </div>
          </div>
          <button
            @click="$emit('add-warehouse', warehouse)"
            :disabled="isWarehouseSelected(warehouse.id)"
            class="add-btn"
          >
            {{ t('common.add') }}
          </button>
        </div>
      </div>
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1"
          class="page-btn"
        >
          {{ t('common.previous') }}
        </button>
        <span class="page-info">
          {{ t('common.page') }} {{ currentPage }} {{ t('common.of') }} {{ totalPages }}
        </span>
        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          {{ t('common.next') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  warehouses: { 
    type: Array, 
    default: () => [] 
  },
  selectedWarehouses: { 
    type: Array, 
    default: () => [] 
  }
})

const emit = defineEmits(['add-warehouse'])

const searchTerm = ref('')
const typeFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = 5

watch([searchTerm, typeFilter], () => {
  currentPage.value = 1
})

const filteredWarehouses = computed(() => {
  let filtered = props.warehouses

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(warehouse => 
      warehouse.name.toLowerCase().includes(term) ||
      warehouse.address.toLowerCase().includes(term) ||
      warehouse.type.toLowerCase().includes(term)
    )
  }

  if (typeFilter.value) {
    filtered = filtered.filter(warehouse => warehouse.type === typeFilter.value)
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredWarehouses.value.length / itemsPerPage))

const paginatedWarehouses = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredWarehouses.value.slice(start, end)
})

function isWarehouseSelected(warehouseId) {
  return props.selectedWarehouses.some(w => w.id === warehouseId)
}
</script>

<style scoped>
.warehouse-selector {
  margin-bottom: 1.5rem;
}

.selector-header {
  margin-bottom: 1rem;
}

.selector-header h4 {
  margin: 0 0 0.8rem 0;
  color: #222b45;
  font-size: 1.1rem;
}

.search-filter {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.search-input, .type-filter {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.search-input {
  flex: 1;
}

.warehouses-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #fff;
}

.warehouses-list {
  padding: 0.5rem;
}

.warehouse-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem;
  margin-bottom: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #f8f9fa;
  transition: all 0.2s;
}

.warehouse-item:hover:not(.disabled) {
  background: #e3f2fd;
  border-color: #1976d2;
}

.warehouse-item.disabled {
  opacity: 0.6;
  background: #f5f5f5;
}

.warehouse-info {
  flex: 1;
  margin-right: 1rem;
}

.warehouse-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.3rem;
}

.name {
  font-weight: 600;
  color: #1976d2;
}

.type {
  font-size: 0.8rem;
  padding: 0.2rem 0.5rem;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 12px;
  font-weight: 500;
}

.warehouse-address {
  font-size: 0.85rem;
  color: #666;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.add-btn {
  padding: 0.4rem 0.8rem;
  border: 1px solid #1976d2;
  background: #fff;
  color: #1976d2;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.add-btn:hover:not(:disabled) {
  background: #1976d2;
  color: #fff;
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
}

.page-btn {
  padding: 0.4rem 0.8rem;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.9rem;
  color: #666;
}

.no-warehouses {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-style: italic;
}
</style> 