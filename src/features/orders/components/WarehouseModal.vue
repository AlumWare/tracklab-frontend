<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h2 class="modal-title">{{ isEditing ? 'Editar Almacén' : 'Crear Almacén' }}</h2>

      <form @submit.prevent="handleSubmit" class="form">
        <div class="form-group">
          <label for="name">Nombre del Almacén</label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            required
            class="form-input"
          >
        </div>

        <div class="form-group">
          <label for="type">Tipo de Almacén</label>
          <select
            id="type"
            v-model="formData.type"
            required
            class="form-input"
          >
            <option value="own">Propio</option>
            <option value="provider">Proveedor</option>
            <option value="client">Cliente</option>
          </select>
        </div>

        <div class="form-group">
          <label for="zone">Zona</label>
          <select
            id="zone"
            v-model="formData.zone"
            required
            class="form-input"
          >
            <option value="norte">Norte</option>
            <option value="sur">Sur</option>
            <option value="este">Este</option>
            <option value="oeste">Oeste</option>
          </select>
        </div>

        <div class="form-group">
          <label for="occupation">Ocupación (%)</label>
          <input
            id="occupation"
            v-model.number="formData.occupation"
            type="number"
            min="0"
            max="100"
            required
            class="form-input"
          >
        </div>

        <div class="form-group">
          <label for="address">Dirección</label>
          <input
            id="address"
            v-model="formData.address"
            type="text"
            required
            class="form-input"
          >
        </div>

        <div class="form-group">
          <label>Ubicación</label>
          <div class="map-container">
            <div id="location-map" class="map"></div>
          </div>
          <div class="coordinates">
            <div class="form-group">
              <label for="latitude">Latitud</label>
              <input
                id="latitude"
                v-model.number="formData.latitude"
                type="number"
                step="any"
                required
                class="form-input"
                readonly
              >
            </div>
            <div class="form-group">
              <label for="longitude">Longitud</label>
              <input
                id="longitude"
                v-model.number="formData.longitude"
                type="number"
                step="any"
                required
                class="form-input"
                readonly
              >
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="cancel-button" @click="$emit('close')">
            Cancelar
          </button>
          <button type="submit" class="save-button">
            {{ isEditing ? 'Guardar Cambios' : 'Crear Almacén' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useTheme } from '@/shared/composables/useTheme'

export default {
  name: 'WarehouseModal',
  props: {
    warehouse: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    const { theme } = useTheme()
    const formData = ref({
      name: '',
      type: 'own',
      zone: 'norte',
      occupation: 0,
      address: '',
      latitude: null,
      longitude: null
    })

    const isEditing = computed(() => !!props.warehouse)
    const map = ref(null)
    const marker = ref(null)

    const initializeMap = () => {
      if (typeof window.google === 'undefined') {
        console.error('Google Maps no está disponible')
        return
      }

      const mapElement = document.getElementById('location-map')
      if (!mapElement) return

      const initialPosition = {
        lat: formData.value.latitude || -12.0464,
        lng: formData.value.longitude || -77.0428
      }

      map.value = new window.google.maps.Map(mapElement, {
        center: initialPosition,
        zoom: 12
      })

      // Add click listener to map
      map.value.addListener('click', (event) => {
        const position = event.latLng
        formData.value.latitude = position.lat()
        formData.value.longitude = position.lng()
        updateMarker(position)
      })

      // Add initial marker if editing
      if (props.warehouse) {
        const position = new window.google.maps.LatLng(
          formData.value.latitude,
          formData.value.longitude
        )
        updateMarker(position)
      }
    }

    const updateMarker = (position) => {
      if (marker.value) {
        marker.value.setMap(null)
      }

      marker.value = new window.google.maps.Marker({
        position: position,
        map: map.value,
        draggable: true
      })

      // Add drag listener to marker
      marker.value.addListener('dragend', (event) => {
        const position = event.latLng
        formData.value.latitude = position.lat()
        formData.value.longitude = position.lng()
      })
    }

    onMounted(() => {
      if (props.warehouse) {
        formData.value = { ...props.warehouse }
      }

      // Initialize map after component is mounted
      if (typeof window.google !== 'undefined') {
        initializeMap()
      } else {
        // If Google Maps is not loaded yet, wait for it
        const checkGoogleMaps = setInterval(() => {
          if (typeof window.google !== 'undefined') {
            clearInterval(checkGoogleMaps)
            initializeMap()
          }
        }, 100)
      }
    })

    const handleSubmit = () => {
      emit('save', { ...formData.value })
    }

    return {
      formData,
      isEditing,
      handleSubmit,
      theme
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: v-bind('theme.colors.overlay');
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: v-bind('theme.colors.surface');
  padding: v-bind('theme.spacing.lg');
  border-radius: v-bind('theme.borderRadius.base');
  width: 100%;
  max-width: 500px;
  box-shadow: v-bind('theme.boxShadow');
}

.modal-title {
  color: v-bind('theme.textColors.primary');
  margin-bottom: v-bind('theme.spacing.md');
  font-size: v-bind('theme.fontSize.lg');
  font-weight: v-bind('theme.fontWeight.bold');
}

.form {
  display: flex;
  flex-direction: column;
  gap: v-bind('theme.spacing.md');
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: v-bind('theme.spacing.xs');
}

.form-group label {
  color: v-bind('theme.textColors.primary');
  font-weight: v-bind('theme.fontWeight.bold');
  font-size: v-bind('theme.fontSize.sm');
}

.form-input {
  padding: v-bind('theme.spacing.sm');
  border: 1px solid v-bind('theme.borderColor');
  border-radius: v-bind('theme.borderRadius.sm');
  color: v-bind('theme.textColors.primary');
  background-color: v-bind('theme.colors.surface');
  transition: v-bind('theme.transition');

  &:focus {
    outline: none;
    border-color: v-bind('theme.colors.primary');
    box-shadow: 0 0 0 2px v-bind('theme.colors.primaryLight');
  }

  &::placeholder {
    color: v-bind('theme.textColors.secondary');
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: v-bind('theme.spacing.sm');
  margin-top: v-bind('theme.spacing.md');
}

.cancel-button {
  padding: v-bind('theme.spacing.sm') v-bind('theme.spacing.md');
  border: 1px solid v-bind('theme.borderColor');
  border-radius: v-bind('theme.borderRadius.sm');
  background-color: v-bind('theme.colors.surface');
  color: v-bind('theme.textColors.primary');
  cursor: pointer;
  transition: v-bind('theme.transition');

  &:hover {
    background-color: v-bind('theme.colors.backgroundSecondary');
  }
}

.save-button {
  padding: v-bind('theme.spacing.sm') v-bind('theme.spacing.md');
  border: none;
  border-radius: v-bind('theme.borderRadius.sm');
  background-color: v-bind('theme.colors.primary');
  color: v-bind('theme.textColors.inverted');
  cursor: pointer;
  transition: v-bind('theme.transition');

  &:hover {
    background-color: v-bind('theme.colors.primaryDark');
  }
}

.map-container {
  width: 100%;
  height: 300px;
  margin-bottom: v-bind('theme.spacing.md');
  border: 1px solid v-bind('theme.borderColor');
  border-radius: v-bind('theme.borderRadius.sm');
  overflow: hidden;
  box-shadow: v-bind('theme.boxShadow');
}

.map {
  width: 100%;
  height: 100%;
}

.coordinates {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: v-bind('theme.spacing.md');
}

:deep(.marker-info) {
  padding: v-bind('theme.spacing.sm');
  max-width: 200px;

  h3 {
    margin: 0 0 v-bind('theme.spacing.xs') 0;
    color: v-bind('theme.colors.primary');
    font-size: v-bind('theme.fontSize.sm');
    font-weight: v-bind('theme.fontWeight.bold');
  }

  p {
    margin: v-bind('theme.spacing.xs') 0;
    color: v-bind('theme.textColors.secondary');
    font-size: v-bind('theme.fontSize.sm');
  }

  .marker-actions {
    display: flex;
    gap: v-bind('theme.spacing.xs');
    margin-top: v-bind('theme.spacing.xs');

    button {
      padding: v-bind('theme.spacing.xs') v-bind('theme.spacing.sm');
      border: none;
      border-radius: v-bind('theme.borderRadius.sm');
      cursor: pointer;
      font-size: v-bind('theme.fontSize.sm');
      transition: v-bind('theme.transition');

      &:first-child {
        background-color: v-bind('theme.colors.primary');
        color: v-bind('theme.textColors.inverted');

        &:hover {
          background-color: v-bind('theme.colors.primaryDark');
        }
      }

      &:last-child {
        background-color: v-bind('theme.colors.error');
        color: v-bind('theme.textColors.inverted');

        &:hover {
          background-color: darken(v-bind('theme.colors.error'), 10%);
        }
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
}
</style>
