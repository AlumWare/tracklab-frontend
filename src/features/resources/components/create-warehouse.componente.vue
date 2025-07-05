<template>
  <BaseForm
    :visible="visible"
    :title="isEditing ? t('warehouse.management.edit') : t('warehouse.management.create')"
    :submit-text="t('warehouse.form.save')"
    :cancel-text="t('warehouse.form.cancel')"
    :loading="loading"
    @close="$emit('close')"
    @submit="handleSubmit"
  >
    <template #form-fields>
      <BaseFormField
        v-model="formData.name"
        :label="t('warehouse.form.name')"
        :placeholder="t('warehouse.form.namePlaceholder')"
        :required="true"
        :error-message="errors.name"
        id="warehouse-name"
      />

      <BaseFormField
        v-model="formData.type"
        :label="t('warehouse.form.type')"
        :placeholder="t('warehouse.form.typePlaceholder')"
        type="select"
        :required="true"
        :error-message="errors.type"
        :options="typeOptions"
        id="warehouse-type"
      />

      <BaseFormField
        v-model="formData.address"
        :label="t('warehouse.form.address')"
        :placeholder="t('warehouse.form.addressPlaceholder')"
        type="textarea"
        :required="true"
        :error-message="errors.address"
        :rows="3"
        id="warehouse-address"
      />

      <div class="coordinates-group">
        <BaseFormField
          v-model="formData.latitude"
          :label="t('warehouse.form.latitude')"
          :placeholder="t('warehouse.form.latitudePlaceholder')"
          type="number"
          :required="true"
          :error-message="errors.latitude"
          id="warehouse-latitude"
          @input="updateMapMarker"
        />

        <BaseFormField
          v-model="formData.longitude"
          :label="t('warehouse.form.longitude')"
          :placeholder="t('warehouse.form.longitudePlaceholder')"
          type="number"
          :required="true"
          :error-message="errors.longitude"
          id="warehouse-longitude"
          @input="updateMapMarker"
        />
      </div>

      <!-- Mapa para seleccionar ubicación -->
      <div class="map-container">
        <label>{{ t('warehouse.form.selectLocation') }}</label>
        <div id="warehouse-form-map" class="map"></div>
        <small class="map-help">{{ t('warehouse.form.mapHelp') }}</small>
      </div>
    </template>
  </BaseForm>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseForm from '@/shared/components/base-form.component.vue'
import BaseFormField from '@/shared/components/base-form-field.component.vue'
import { WarehouseResource } from '../models/warehouse.resource.js'
import { warehouseService } from '../services/warehouse.service.js'
import { UxService } from '@/core/services/ux.service.js'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  warehouse: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['close', 'saved'])

// Composables
const { t } = useI18n()

console.log('CreateWarehouseComponent setup started')

// Reactive data
const loading = ref(false)
const map = ref(null)
const marker = ref(null)
const formData = ref({
  name: '',
  type: '',
  address: '',
  latitude: '',
  longitude: ''
})

const errors = ref({
  name: '',
  type: '',
  address: '',
  latitude: '',
  longitude: ''
})

// Computed
const isEditing = computed(() => !!props.warehouse)

const typeOptions = computed(() => {
  return WarehouseResource.getTypeOptions()
})

// Methods
const resetForm = () => {
  formData.value = {
    name: '',
    type: '',
    address: '',
    latitude: '',
    longitude: ''
  }
  errors.value = {
    name: '',
    type: '',
    address: '',
    latitude: '',
    longitude: ''
  }
}

const initializeMap = () => {
  console.log('Initializing map...')
  
  // Verificar que Google Maps esté disponible
  if (typeof window.google === 'undefined') {
    console.log('Google Maps not available')
    return
  }

  // Verificar que no esté ya inicializado
  if (map.value) {
    console.log('Map already initialized')
    return
  }

  // Buscar el elemento del mapa
  const mapElement = document.getElementById('warehouse-form-map')
  console.log('Map element found:', !!mapElement)
  
  if (!mapElement) {
    console.log('Map element not found in DOM')
    return
  }

  // Verificar dimensiones del elemento
  const rect = mapElement.getBoundingClientRect()
  console.log('Map element dimensions:', rect.width, 'x', rect.height)
  
  if (rect.width === 0 || rect.height === 0) {
    console.log('Map element has no dimensions')
    return
  }

  try {
    console.log('Creating Google Maps instance...')
    map.value = new window.google.maps.Map(mapElement, {
      center: { lat: -12.0464, lng: -77.0428 }, // Lima, Perú
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false
    })

    // Agregar listener para clicks en el mapa
    map.value.addListener('click', (event) => {
      const lat = event.latLng.lat()
      const lng = event.latLng.lng()
      
      console.log('Map clicked at:', lat, lng)
      formData.value.latitude = lat.toFixed(6)
      formData.value.longitude = lng.toFixed(6)
      
      updateMapMarker()
    })

    console.log('Map created successfully, updating marker...')
    updateMapMarker()
    console.log('Map initialization complete')
  } catch (error) {
    console.error('Error creating map:', error)
  }
}

const loadGoogleMapsAPI = () => {
  console.log('Loading Google Maps API...')
  
  // Verificar si ya está cargada
  if (typeof window.google !== 'undefined') {
    console.log('Google Maps already loaded')
    nextTick(() => {
      initializeMap()
    })
    return
  }

  // Verificar si ya se está cargando
  if (document.querySelector('script[src*="maps.googleapis.com"]')) {
    console.log('Google Maps script already loading...')
    const checkInterval = setInterval(() => {
      if (typeof window.google !== 'undefined') {
        clearInterval(checkInterval)
        console.log('Google Maps loaded from existing script')
        nextTick(() => {
          initializeMap()
        })
      }
    }, 100)
    return
  }

  // Cargar la API
  console.log('Creating new Google Maps script...')
  const script = document.createElement('script')
  script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
  script.async = true
  script.defer = true
  script.onload = () => {
    console.log('Google Maps script loaded successfully')
    // Esperar un poco más para que el DOM esté completamente listo
    setTimeout(() => {
      nextTick(() => {
        initializeMap()
      })
    }, 200)
  }
  script.onerror = () => {
    console.error('Error loading Google Maps API')
  }
  document.head.appendChild(script)
}

const updateMapMarker = () => {
  if (!map.value || typeof window.google === 'undefined') return

  const lat = parseFloat(formData.value.latitude)
  const lng = parseFloat(formData.value.longitude)

  // Solo crear marcador si hay coordenadas válidas
  if (!isNaN(lat) && !isNaN(lng)) {
    console.log('Updating marker at:', lat, lng)
    
    // Si no existe marcador, crearlo
    if (!marker.value) {
      marker.value = new window.google.maps.Marker({
        position: { lat, lng },
        map: map.value,
        draggable: true,
        title: formData.value.name || 'Ubicación del almacén'
      })

      // Listener para cuando se arrastra el marcador (solo una vez)
      marker.value.addListener('dragend', (event) => {
        const newLat = event.latLng.lat()
        const newLng = event.latLng.lng()
        
        console.log('Marker dragged to:', newLat, newLng)
        formData.value.latitude = newLat.toFixed(6)
        formData.value.longitude = newLng.toFixed(6)
      })
    } else {
      // Si ya existe, solo actualizar la posición
      marker.value.setPosition({ lat, lng })
    }

    // Centrar mapa en la nueva posición
    map.value.setCenter({ lat, lng })
  } else {
    console.log('No valid coordinates, removing marker')
    // Remover marcador si no hay coordenadas válidas
    if (marker.value) {
      marker.value.setMap(null)
      marker.value = null
    }
  }
}

const loadWarehouseData = () => {
  if (props.warehouse) {
    formData.value = {
      name: props.warehouse.name,
      type: props.warehouse.type,
      address: props.warehouse.address,
      latitude: props.warehouse.latitude,
      longitude: props.warehouse.longitude
    }
    // Actualizar marcador en el mapa
    nextTick(() => {
      updateMapMarker()
    })
  }
}

const validateForm = () => {
  const validation = isEditing.value 
    ? WarehouseResource.validateUpdateData(formData.value)
    : WarehouseResource.validateCreateData(formData.value)

  if (!validation.isValid) {
    // Mapear errores a los campos correspondientes
    validation.errors.forEach(error => {
      if (error.includes('nombre')) {
        errors.value.name = t('warehouse.form.validation.nameRequired')
      } else if (error.includes('tipo')) {
        errors.value.type = t('warehouse.form.validation.typeRequired')
      } else if (error.includes('dirección')) {
        errors.value.address = t('warehouse.form.validation.addressRequired')
      } else if (error.includes('latitud')) {
        errors.value.latitude = t('warehouse.form.validation.latitudeRequired')
      } else if (error.includes('longitud')) {
        errors.value.longitude = t('warehouse.form.validation.longitudeRequired')
      }
    })
    return false
  }

  // Limpiar errores si la validación es exitosa
  errors.value = {
    name: '',
    type: '',
    address: '',
    latitude: '',
    longitude: ''
  }
  return true
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    const warehouseData = {
      name: formData.value.name,
      type: formData.value.type,
      address: formData.value.address,
      latitude: parseFloat(formData.value.latitude),
      longitude: parseFloat(formData.value.longitude)
    }

    if (isEditing.value) {
      await warehouseService.updateWarehouse(props.warehouse.id, warehouseData)
    } else {
      await warehouseService.createWarehouse(warehouseData)
    }

    emit('saved')
    resetForm()
  } catch (error) {
    console.error('Error saving warehouse:', error)
    UxService.showSnackbar({
      message: t('warehouse.management.messages.saveError'),
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Watchers
watch(() => props.visible, (newValue) => {
  console.log('Modal visibility changed:', newValue)
  if (newValue) {
    if (props.warehouse) {
      loadWarehouseData()
    } else {
      resetForm()
    }
    // Esperar a que el modal esté completamente renderizado
    setTimeout(() => {
      console.log('Attempting to load Google Maps API...')
      loadGoogleMapsAPI()
    }, 300)
  }
})

watch(() => props.warehouse, (newValue) => {
  if (newValue && props.visible) {
    loadWarehouseData()
  }
})

// Log cuando el componente se monte
onMounted(() => {
  console.log('CreateWarehouseComponent mounted')
  // Verificar si el elemento del mapa existe
  setTimeout(() => {
    const mapElement = document.getElementById('warehouse-form-map')
    console.log('Map element on mount:', !!mapElement)
  }, 1000)
})

// Limpiar mapa cuando se cierre el modal
watch(() => props.visible, (newValue) => {
  if (!newValue) {
    // Limpiar marcador
    if (marker.value) {
      marker.value.setMap(null)
      marker.value = null
    }
    // Limpiar mapa
    if (map.value) {
      map.value = null
    }
  }
})

// Intentar inicializar el mapa cuando el modal esté visible
watch(() => props.visible, (newValue) => {
  if (newValue) {
    // Intentar inicializar después de que el modal esté visible
    const checkMap = () => {
      const mapElement = document.getElementById('warehouse-form-map')
      if (mapElement && typeof window.google !== 'undefined') {
        console.log('Map element and Google Maps available, initializing...')
        initializeMap()
      } else {
        console.log('Waiting for map element or Google Maps...')
        setTimeout(checkMap, 100)
      }
    }
    setTimeout(checkMap, 500)
  }
})

// Nota: El marcador se actualiza automáticamente cuando se hace click en el mapa o se arrastra
</script>

<style scoped>
.coordinates-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.map-container {
  margin-top: 1rem;
}

.map-container label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.map {
  width: 100%;
  height: 250px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.map-help {
  color: #666;
  font-size: 0.85rem;
  display: block;
}

@media (max-width: 768px) {
  .coordinates-group {
    grid-template-columns: 1fr;
  }
  
  .map {
    height: 200px;
  }
}
</style>
