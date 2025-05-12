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
          <label for="latitude">Latitud</label>
          <input
            id="latitude"
            v-model.number="formData.latitude"
            type="number"
            step="any"
            required
            class="form-input"
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
          >
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
import { ref, computed, onMounted } from 'vue'

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

    onMounted(() => {
      if (props.warehouse) {
        formData.value = { ...props.warehouse }
      }
    })

    const handleSubmit = () => {
      emit('save', { ...formData.value })
    }

    return {
      formData,
      isEditing,
      handleSubmit
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
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}

.modal-title {
  color: #000000;
  margin-bottom: 20px;
  font-size: 24px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #000000;
  font-weight: 500;
}

.form-input {
  padding: 8px;
  border: 1px solid #8E8E8E;
  border-radius: 4px;
  color: #000000;
  background-color: white;
}

.form-input::placeholder {
  color: #8E8E8E;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

.cancel-button {
  padding: 8px 16px;
  border: 1px solid #8E8E8E;
  border-radius: 4px;
  background-color: white;
  color: #000000;
  cursor: pointer;
}

.save-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #42A5F5;
  color: #000000;
  cursor: pointer;
}

.save-button:hover {
  background-color: #1E88E5;
}
</style>
