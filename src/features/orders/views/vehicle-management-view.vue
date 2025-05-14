<template>
  <div class="vehicle-management">
    <div class="header">
      <h1>Gestión de Vehículos</h1>
      <div class="actions">
        <button class="btn-primary" @click="showAddVehicleModal = true">
          <i class="fas fa-plus"></i> Agregar Vehículo
        </button>
        <div class="filters">
          <select v-model="statusFilter" class="filter-select">
            <option value="all">Todos</option>
            <option value="AVAILABLE">Disponible</option>
            <option value="MAINTENANCE">Mantenimiento</option>
          </select>
        </div>
      </div>
    </div>

    <div class="view-toggle">
      <button
        :class="{ active: viewMode === 'grid' }"
        @click="viewMode = 'grid'"
      >
        <i class="fas fa-th"></i>
      </button>
      <button
        :class="{ active: viewMode === 'table' }"
        @click="viewMode = 'table'"
      >
        <i class="fas fa-list"></i>
      </button>
    </div>

    <!-- Vista en Grid -->
    <div v-if="viewMode === 'grid'" class="vehicle-grid">
      <div v-for="vehicle in filteredVehicles" :key="vehicle.id" class="vehicle-card">
        <div class="vehicle-image">
          <img :src="vehicle.thumbnail" :alt="vehicle.plateNumber">
          <span :class="['status-badge', vehicle.status]">{{ vehicle.status }}</span>
        </div>
        <div class="vehicle-info">
          <h3>{{ vehicle.plateNumber }}</h3>
          <p>{{ vehicle.type }}</p>
          <div class="vehicle-actions">
            <button @click="editVehicle(vehicle)" class="btn-icon">
              <i class="fas fa-edit"></i>Editar
            </button>
            <button @click="uploadPhotos(vehicle)" class="btn-icon">
              <i class="fas fa-camera"></i>Subir Foto
            </button>
            <button @click="toggleStatus(vehicle)" class="btn-icon">
              <i :class="vehicle.status === 'available' ? 'fas fa-tools' : 'fas fa-check'"></i>Estado
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Vista en Tabla -->
    <div v-else class="vehicle-table">
      <table>
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Placa</th>
            <th>Modelo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="vehicle in filteredVehicles" :key="vehicle.id">
            <td>
              <img :src="vehicle.thumbnail" :alt="vehicle.plate" class="table-thumbnail">
            </td>
            <td>{{ vehicle.plate }}</td>
            <td>{{ vehicle.model }}</td>
            <td>
              <span :class="['status-badge', vehicle.status]">{{ vehicle.status }}</span>
            </td>
            <td class="actions">
              <button @click="editVehicle(vehicle)" class="btn-icon">
                <i class="fas fa-edit"></i> Editar
              </button>
              <button @click="uploadPhotos(vehicle)" class="btn-icon">
                <i class="fas fa-camera"></i> Subir Foto
              </button>
              <button @click="toggleStatus(vehicle)" class="btn-icon">
                <i :class="vehicle.status === 'available' ? 'fas fa-tools' : 'fas fa-check'"></i>Estado
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para Agregar/Editar Vehículo -->
    <div v-if="showAddVehicleModal" class="modal">
      <div class="modal-content">
        <h2>{{ editingVehicle ? 'Editar Vehículo' : 'Agregar Vehículo' }}</h2>
        <form @submit.prevent="UpdateVehicle">
          <div class="form-group">
            <label>Placa</label>
            <input v-model="vehicleForm.plateNumber" type="text" required>
          </div>
          <div class="form-group">
            <label>Modelo</label>
            <input v-model="vehicleForm.type" type="text" required>
          </div>
          <div class="form-group">
            <label>Estado</label>
            <select v-model="vehicleForm.status">
              <option value="AVAILABLE">Disponible</option>
              <option value="MAINTENANCE">Mantenimiento</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" @click="showAddVehicleModal = false" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'VehicleManagementView',
  data() {
    return {
      viewMode: 'grid',
      statusFilter: 'all',
      showAddVehicleModal: false,
      editingVehicle: null,
      vehicleForm: {
        plate: '',
        model: '',
        status: 'available'
      },
      vehicles: [

      ]
    }
  },
  computed: {
    filteredVehicles() {
      if (this.statusFilter === 'all') return this.vehicles
      return this.vehicles.filter(v => v.status === this.statusFilter)
    }
  },
  methods: {
    InvocaVehicle(){
      axios.get('http://localhost:3000/vehicle')
        .then(res=>{this.vehicles = res.data})
    },
    editVehicle(vehicle) {

      this.editingVehicle = vehicle
      this.vehicleForm = { ...vehicle }
      this.showAddVehicleModal = true
      console.log(vehicle)
      console.log(this.editingVehicle)
    },
    UpdateVehicle() {
      if (this.editingVehicle) {
        axios.put(`http://localhost:3000/vehicle/${this.editingVehicle.id}`, this.vehicleForm)
          .then(res=>{this.vehicles = res.data})
        this.InvocaVehicle()
      }
      else {
        axios.post('http://localhost:3000/vehicle', this.vehicleForm)
          .then(res=>{this.vehicles = res.data})
        this.InvocaVehicle()
      }
    },
    uploadPhotos(vehicle) {
  console.log('Subiendo fotos del vehículo:', vehicle.plate)
  // Aquí se implementará la lógica para subir fotos
  },
    toggleStatus(vehicle) {
      vehicle.status = vehicle.status === 'AVAILABLE' ? 'maintenance' : 'available'
    },
    saveVehicle() {
      if (this.editingVehicle) {
        // Actualizar vehículo existente
        const index = this.vehicles.findIndex(v => v.id === this.editingVehicle.id)
        this.vehicles[index] = { ...this.editingVehicle, ...this.vehicleForm }
      } else {
        // Agregar nuevo vehículo
        this.vehicles.push({
          id: Date.now(),
          ...this.vehicleForm,
          thumbnail: '/path/to/default-thumbnail.jpg'
        })
      }
      this.showAddVehicleModal = false
      this.editingVehicle = null
      this.vehicleForm = {
        plate: '',
        model: '',
        status: 'available'
      }
    }
  },
  mounted() {
    this.InvocaVehicle();
  }
}
</script>

<style scoped>
.vehicle-management {
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f9fafa;
  color: #000;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 2rem;
}

@media (min-width: 768px) {
  .header {
    flex-direction: row;
    align-items: center;
  }
}

.actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-primary {
  background-color: #00bcd4;
  color: #000;
  border: 1px solid black;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-secondary {
  background-color: #f44336;
  color: white;
  border: 1px solid black;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid black;
  border-radius: 6px;
  font-size: 1rem;
  color: #000;
  background-color: white;
}

.view-toggle {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.view-toggle button {
  padding: 0.5rem 1rem;
  border: 1px solid black;
  background: white;
  cursor: pointer;
  border-radius: 6px;
  font-weight: bold;
  color: #000;
}

.view-toggle button.active {
  background: #b2ebf2;
}

.vehicle-table {
  width: 100%;
  overflow-x: auto;
  border: 2px solid black;
  border-radius: 8px;
  margin-top: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  text-align: left;
  color: #000;
}

th {
  background-color: #e0f7fa;
  font-weight: bold;
}

.table-thumbnail {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #333;
}

.status-badge {
  padding: 0.3rem 0.6rem;
  border-radius: 5px;
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
}

.status-badge.available {
  background-color: #4caf50;
}

.status-badge.maintenance {
  background-color: #f44336;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  padding: 0.4rem;
  border: 1px solid black;
  background: #e0f7fa;
  cursor: pointer;
  border-radius: 6px;
  color: #000;
}

.btn-icon:hover {
  background: #b2ebf2;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  z-index: 10;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  width: 100%;
  max-width: 500px;
  border: 2px solid black;
  color: #000;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #000;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid black;
  border-radius: 6px;
  font-size: 1rem;
  color: #000;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}
.vehicle-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.vehicle-card {
  background-color: #ffffff;
  border: 2px solid #000;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
}

.vehicle-card:hover {
  transform: translateY(-4px);
}

.vehicle-image {
  position: relative;
  height: 160px;
  background-color: #f1f1f1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vehicle-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-bottom: 1px solid #000;
}

.vehicle-info {
  padding: 1rem;
  color: #000;
}

.vehicle-info h3 {
  margin: 0 0 0.4rem 0;
  font-size: 1.2rem;
  font-weight: bold;
}

.vehicle-info p {
  margin: 0;
  font-size: 0.95rem;
  color: #444;
}

.vehicle-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 1rem 1rem;
}
.vehicle-info {
  padding: 1rem;
  color: #000;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.vehicle-info .status-badge {
  align-self: flex-start; /* O center / flex-end si quieres alinearlo diferente */
  margin-top: 0.5rem;
}

</style>
