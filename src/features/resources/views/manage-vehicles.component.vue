<template>
  <div class="vehicle-management">
    <!-- Header -->
    <div class="header">
      <h1>{{ $t('vehicle.management.title') }}</h1>
      <div class="actions">
        <button 
          @click="openCreateModal"
          class="create-button"
        >
          <i class="fas fa-plus"></i>
          {{ $t('vehicle.management.create') }}
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters">
      <div class="filter-group">
        <label>{{ $t('vehicle.management.filters.status.label') }}</label>
        <select v-model="filters.status" @change="applyFilters">
          <option value="">{{ $t('vehicle.management.filters.status.all') }}</option>
          <option 
            v-for="status in vehicleStatuses" 
            :key="status.name" 
            :value="status.name"
          >
            {{ $t(`vehicle.status.${status.name}`) }}
          </option>
        </select>
      </div>
      
      <div class="view-toggle">
        <button 
          :class="['view-btn', { active: viewMode === 'table' }]" 
          @click="viewMode = 'table'"
          :title="$t('vehicle.management.viewModes.table')"
        >
          <i class="fas fa-list"></i>
        </button>
        <button 
          :class="['view-btn', { active: viewMode === 'grid' }]" 
          @click="viewMode = 'grid'"
          :title="$t('vehicle.management.viewModes.grid')"
        >
          <i class="fas fa-th"></i>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i>
      <span>{{ $t('vehicle.management.messages.loading') }}</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="!vehicles.length" class="empty-state">
      <i class="fas fa-truck"></i>
      <h3>{{ $t('vehicle.management.messages.noVehicles') }}</h3>
      <button @click="openCreateModal" class="create-button">
        <i class="fas fa-plus"></i>
        {{ $t('vehicle.management.create') }}
      </button>
    </div>

    <!-- Table View -->
    <div v-else-if="viewMode === 'table'" class="table-container">
      <table class="vehicles-table">
        <thead>
          <tr>
            <th>{{ $t('vehicle.management.table.image') }}</th>
            <th>{{ $t('vehicle.management.table.licensePlate') }}</th>
            <th>{{ $t('vehicle.management.table.loadCapacity') }}</th>
            <th>{{ $t('vehicle.management.table.paxCapacity') }}</th>
            <th>{{ $t('vehicle.management.table.status') }}</th>
            <th>{{ $t('vehicle.management.table.location') }}</th>
            <th>{{ $t('vehicle.management.table.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="vehicle in filteredVehicles" :key="vehicle.id">
            <td>
              <div class="vehicle-image">
                <img 
                  v-if="vehicle.images.length > 0" 
                  :src="vehicle.images[0].imageUrl" 
                  :alt="vehicle.licensePlate"
                  @error="handleImageError"
                >
                <div v-else class="no-image">
                  <i class="fas fa-truck"></i>
                </div>
              </div>
            </td>
            <td class="license-plate">{{ vehicle.licensePlate }}</td>
            <td>{{ vehicle.loadCapacity }}t</td>
            <td>{{ vehicle.paxCapacity }}</td>
            <td>
              <span :class="['status-badge', getStatusClass(vehicle.status)]">
                {{ $t(`vehicle.status.${vehicle.status}`) }}
              </span>
            </td>
            <td class="location">
              <span v-if="vehicle.latitude && vehicle.longitude">
                {{ vehicle.latitude.toFixed(4) }}, {{ vehicle.longitude.toFixed(4) }}
              </span>
              <span v-else class="no-location">-</span>
            </td>
            <td class="actions">
              <button 
                @click="openEditModal(vehicle)" 
                class="action-btn edit"
                :title="$t('vehicle.management.actions.edit')"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button 
                @click="openImageModal(vehicle)" 
                class="action-btn images"
                :title="$t('vehicle.management.actions.uploadImages')"
              >
                <i class="fas fa-images"></i>
              </button>
              <button 
                @click="confirmDelete(vehicle)" 
                class="action-btn delete"
                :title="$t('vehicle.management.actions.delete')"
              >
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Grid View -->
    <div v-else class="vehicles-grid">
      <div v-for="vehicle in filteredVehicles" :key="vehicle.id" class="vehicle-card">
        <div class="card-image">
          <img 
            v-if="vehicle.images.length > 0" 
            :src="vehicle.images[0].imageUrl" 
            :alt="vehicle.licensePlate"
            @error="handleImageError"
          >
          <div v-else class="no-image">
            <i class="fas fa-truck"></i>
          </div>
          <span :class="['status-badge', getStatusClass(vehicle.status)]">
            {{ $t(`vehicle.status.${vehicle.status}`) }}
          </span>
        </div>
        <div class="card-content">
          <h3>{{ vehicle.licensePlate }}</h3>
          <div class="vehicle-specs">
            <div class="spec-item">
              <i class="fas fa-weight-hanging"></i>
              <span>{{ vehicle.loadCapacity }}t</span>
              <small>{{ $t('vehicle.management.table.loadCapacity') }}</small>
            </div>
            <div class="spec-item">
              <i class="fas fa-users"></i>
              <span>{{ vehicle.paxCapacity }}</span>
              <small>{{ $t('vehicle.management.table.paxCapacity') }}</small>
            </div>
          </div>
          <div class="location-info" v-if="vehicle.latitude && vehicle.longitude">
            <i class="fas fa-map-marker-alt"></i>
            <span>{{ vehicle.latitude.toFixed(4) }}, {{ vehicle.longitude.toFixed(4) }}</span>
          </div>
          <div class="card-actions">
            <button 
              @click="openEditModal(vehicle)" 
              class="action-btn edit"
              :title="$t('vehicle.management.actions.edit')"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button 
              @click="openImageModal(vehicle)" 
              class="action-btn images"
              :title="$t('vehicle.management.actions.uploadImages')"
            >
              <i class="fas fa-images"></i>
            </button>
            <button 
              @click="confirmDelete(vehicle)" 
              class="action-btn delete"
              :title="$t('vehicle.management.actions.delete')"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Vehicle Form Modal -->
    <VehicleFormModal
      v-if="showFormModal"
      :vehicle="selectedVehicle"
      @save="handleSave"
      @cancel="closeFormModal"
    />

    <!-- Image Upload Modal -->
    <VehicleImageModal
      v-if="showImageModal"
      :vehicle="selectedVehicle"
      @upload="handleImageUpload"
      @cancel="closeImageModal"
    />

    <!-- Confirm Dialog -->
    <ConfirmDialog
      v-if="showConfirmDialog"
      :title="$t('vehicle.management.actions.delete')"
      :message="$t('vehicle.management.messages.deleteConfirm')"
      @confirm="handleDelete"
      @cancel="showConfirmDialog = false"
    />

    <!-- Snackbar -->
    <Snackbar
      v-if="snackbar.show"
      :message="snackbar.message"
      :type="snackbar.type"
      @close="snackbar.show = false"
    />
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { vehicleService } from '../services/vehicle.service.js'
import { VehicleStatus } from '../models/vehicle-status.enum.js'

import ConfirmDialog from '@/shared/components/confirm-dialog.vue'
import Snackbar from '@/shared/components/snackbar.vue'
import VehicleFormModal from '../components/vehicle-form-modal.vue'
import VehicleImageModal from '../components/vehicle-image-modal.vue'

export default {
  name: 'ManageVehicles',
  components: {
    ConfirmDialog,
    Snackbar,
    VehicleFormModal,
    VehicleImageModal
  },
  setup() {
    const { t } = useI18n()
    
    // Reactive state
    const vehicles = ref([])
    const loading = ref(false)
    const viewMode = ref('table')
    const selectedVehicle = ref(null)
    const showFormModal = ref(false)
    const showImageModal = ref(false)
    const showConfirmDialog = ref(false)
    const vehicleToDelete = ref(null)
    
    const filters = reactive({
      status: ''
    })
    
    const snackbar = reactive({
      show: false,
      message: '',
      type: 'success'
    })

    // Computed properties
    const vehicleStatuses = computed(() => VehicleStatus.getAllTypes())
    
    const filteredVehicles = computed(() => {
      let filtered = vehicles.value
      
      if (filters.status) {
        filtered = filtered.filter(vehicle => vehicle.status === filters.status)
      }
      
      return filtered
    })

    // Methods
    const loadVehicles = async () => {
      loading.value = true
      try {
        vehicles.value = await vehicleService.getAll()
      } catch (error) {
        showSnackbar(t('vehicle.management.messages.loadError'), 'error')
      } finally {
        loading.value = false
      }
    }

    const openCreateModal = () => {
      selectedVehicle.value = null
      showFormModal.value = true
    }

    const openEditModal = (vehicle) => {
      selectedVehicle.value = vehicle
      showFormModal.value = true
    }

    const closeFormModal = () => {
      showFormModal.value = false
      selectedVehicle.value = null
    }

    const openImageModal = (vehicle) => {
      selectedVehicle.value = vehicle
      showImageModal.value = true
    }

    const closeImageModal = () => {
      showImageModal.value = false
      selectedVehicle.value = null
    }

    const handleSave = async (vehicleData) => {
      try {
        if (selectedVehicle.value) {
          // Update existing vehicle
          await vehicleService.update(selectedVehicle.value.id, vehicleData)
          showSnackbar(t('vehicle.management.messages.updateSuccess'), 'success')
        } else {
          // Create new vehicle
          await vehicleService.create(vehicleData)
          showSnackbar(t('vehicle.management.messages.createSuccess'), 'success')
        }
        
        closeFormModal()
        await loadVehicles()
      } catch (error) {
        showSnackbar(t('vehicle.management.messages.saveError'), 'error')
      }
    }

    const handleImageUpload = async (images) => {
      try {
        await vehicleService.uploadImages(selectedVehicle.value.id, images)
        showSnackbar(t('vehicle.management.messages.imagesUploadSuccess'), 'success')
        closeImageModal()
        await loadVehicles()
      } catch (error) {
        showSnackbar(t('vehicle.management.messages.uploadError'), 'error')
      }
    }

    const confirmDelete = (vehicle) => {
      vehicleToDelete.value = vehicle
      showConfirmDialog.value = true
    }

    const handleDelete = async () => {
      try {
        await vehicleService.delete(vehicleToDelete.value.id)
        showSnackbar(t('vehicle.management.messages.deleteSuccess'), 'success')
        await loadVehicles()
      } catch (error) {
        showSnackbar(t('vehicle.management.messages.deleteError'), 'error')
      } finally {
        showConfirmDialog.value = false
        vehicleToDelete.value = null
      }
    }

    const applyFilters = () => {
      // Filters are applied automatically via computed property
    }

    const getStatusClass = (status) => {
      const statusMap = {
        'Available': 'available',
        'NotAvailable': 'not-available',
        'InUse': 'in-use',
        'Maintenance': 'maintenance',
        'OutOfService': 'out-of-service'
      }
      return statusMap[status] || 'default'
    }

    const handleImageError = (event) => {
      event.target.style.display = 'none'
      event.target.parentElement.classList.add('error')
    }

    const showSnackbar = (message, type = 'success') => {
      snackbar.message = message
      snackbar.type = type
      snackbar.show = true
    }

    // Lifecycle
    onMounted(() => {
      loadVehicles()
    })

    return {
      vehicles,
      loading,
      viewMode,
      selectedVehicle,
      showFormModal,
      showImageModal,
      showConfirmDialog,
      filters,
      snackbar,
      vehicleStatuses,
      filteredVehicles,
      loadVehicles,
      openCreateModal,
      openEditModal,
      closeFormModal,
      openImageModal,
      closeImageModal,
      handleSave,
      handleImageUpload,
      confirmDelete,
      handleDelete,
      applyFilters,
      getStatusClass,
      handleImageError
    }
  }
}
</script>

<style lang="scss" scoped>
.vehicle-management {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;

    h1 {
      color: var(--color-heading);
      margin: 0;
    }
  }

  .create-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: #4FC3F7;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(79, 195, 247, 0.3);
    
    &:hover {
      background: #29B6F6;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(79, 195, 247, 0.4);
    }
    
    &:active {
      transform: translateY(0);
    }
    
    i {
      font-size: 1rem;
    }
  }

  .filters {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    gap: 1rem;

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      label {
        font-weight: 600;
        color: #333;
      }

      select {
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: #fff;
        color: #333;
      }
    }

    .view-toggle {
      display: flex;
      gap: 0.25rem;
      background: #f8f9fa;
      border-radius: 8px;
      padding: 0.25rem;
      border: 1px solid #e9ecef;

      .view-btn {
        padding: 0.5rem 0.75rem;
        border: none;
        background: transparent;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        color: #6c757d;
        font-size: 1rem;

        &:hover {
          background: #e9ecef;
          color: #495057;
        }

        &.active {
          background: #4FC3F7;
          color: white;
          box-shadow: 0 2px 4px rgba(79, 195, 247, 0.3);
        }

        i {
          font-size: 1rem;
        }
      }
    }
  }

  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 4rem;
    gap: 1rem;
    color: var(--color-text-soft);

    i {
      font-size: 1.5rem;
    }
  }

  .empty-state {
    text-align: center;
    padding: 4rem;
    color: var(--color-text-soft);

    i {
      font-size: 4rem;
      margin-bottom: 1rem;
      color: var(--color-border);
    }

    h3 {
      margin-bottom: 2rem;
      color: var(--color-text);
    }
  }

  .table-container {
    overflow-x: auto;
    border-radius: 8px;
    border: 1px solid var(--color-border);
  }

  .vehicles-table {
    width: 100%;
    border-collapse: collapse;
    background: var(--color-background);

    th {
      background: var(--color-background-soft);
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: var(--color-text);
      border-bottom: 1px solid var(--color-border);
    }

    td {
      padding: 1rem;
      border-bottom: 1px solid var(--color-border);
      color: var(--color-text);
    }

    .vehicle-image {
      width: 60px;
      height: 60px;
      border-radius: 4px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-background-soft);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .no-image {
        color: var(--color-text-soft);
        font-size: 1.5rem;
      }
    }

    .license-plate {
      font-weight: 600;
      color: var(--color-primary);
    }

    .location {
      font-family: monospace;
      font-size: 0.9rem;
    }

    .no-location {
      color: var(--color-text-soft);
    }

    .actions {
      display: flex;
      gap: 0.5rem;
    }
  }

  .vehicles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .vehicle-card {
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .card-image {
      position: relative;
      height: 200px;
      background: var(--color-background-soft);
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .no-image {
        color: var(--color-text-soft);
        font-size: 3rem;
      }
    }

    .card-content {
      padding: 1.5rem;

      h3 {
        margin: 0 0 1rem 0;
        color: var(--color-primary);
        font-size: 1.25rem;
      }

      .vehicle-specs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 1rem;

        .spec-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 0.75rem;
          background: var(--color-background-soft);
          border-radius: 6px;
          
          i {
            font-size: 1.25rem;
            color: var(--color-primary);
            margin-bottom: 0.5rem;
          }
          
          span {
            font-weight: 600;
            color: var(--color-text);
            margin-bottom: 0.25rem;
          }
          
          small {
            color: var(--color-text-soft);
            font-size: 0.75rem;
          }
        }
      }

      .location-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
        padding: 0.5rem;
        background: var(--color-background-soft);
        border-radius: 4px;
        font-size: 0.875rem;
        color: var(--color-text-soft);
        
        i {
          color: var(--color-primary);
        }
        
        span {
          font-family: monospace;
        }
      }

      .card-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
      }
    }
  }

  .status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;

    &.available {
      background: var(--color-success-soft);
      color: var(--color-success);
    }

    &.not-available {
      background: var(--color-warning-soft);
      color: var(--color-warning);
    }

    &.in-use {
      background: var(--color-info-soft);
      color: var(--color-info);
    }

    &.maintenance {
      background: var(--color-warning-soft);
      color: var(--color-warning);
    }

    &.out-of-service {
      background: var(--color-danger-soft);
      color: var(--color-danger);
    }
  }

  .action-btn {
    padding: 0.5rem;
    border: 1px solid var(--color-border);
    background: var(--color-background);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: var(--color-background-soft);
    }

    &.edit {
      color: var(--color-info);
      &:hover {
        background: var(--color-info-soft);
      }
    }

    &.images {
      color: var(--color-success);
      &:hover {
        background: var(--color-success-soft);
      }
    }

    &.delete {
      color: var(--color-danger);
      &:hover {
        background: var(--color-danger-soft);
      }
    }
  }
}

@media (max-width: 768px) {
  .vehicle-management {
    padding: 1rem;

    .header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .filters {
      flex-direction: column;
      gap: 1rem;
    }

    .vehicles-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
