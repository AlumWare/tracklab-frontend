<template>
  <div class="client-order-creation">
    <template v-if="!orderSent">
      <div class="stepper-container">
        <div class="stepper">
          <div
            v-for="(step, index) in steps"
            :key="index"
            :class="['step', { active: currentStep === index, completed: currentStep > index }]"
          >
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-title">{{ step.title }}</div>
          </div>
        </div>
      </div>

      <div class="step-content">
        <!-- Paso 1: Selección de empresa logística -->
        <div v-if="currentStep === 0" class="logistics-company-selection">
          <h2>Selecciona tu empresa logística</h2>
          <div class="company-dropdown">
            <select v-model="selectedCompany" class="company-select">
              <option value="" disabled>Selecciona una empresa</option>
              <option v-for="company in logisticsCompanies" :key="company.id" :value="company">
                {{ company.name }}
              </option>
            </select>
            <div v-if="selectedCompany" class="selected-company-preview">
              <img :src="'/assets/log.svg'" :alt="selectedCompany.name" class="company-logo">
              <span>{{ selectedCompany.name }}</span>
            </div>
          </div>
        </div>

        <!-- Paso 2: Agregar ítems -->
        <div v-if="currentStep === 1" class="items-selection">
          <h2>Agregar ítems a la orden</h2>
          <div class="delivery-info">
            <div class="form-group">
              <label for="delivery-address">Dirección de entrega</label>
              <input
                id="delivery-address"
                v-model="deliveryAddress"
                type="text"
                placeholder="Ingresa la dirección de entrega"
                class="form-input"
              >
            </div>
            <div class="form-group">
              <label for="delivery-date">Fecha de entrega</label>
              <input
                id="delivery-date"
                v-model="deliveryDate"
                type="date"
                class="form-input"
              >
            </div>
          </div>
          <div class="items-table">
            <table>
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Cantidad</th>
                  <th>Peso (kg)</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in orderItems" :key="index">
                  <td>
                    <input v-model="item.description" type="text" placeholder="Descripción del ítem">
                  </td>
                  <td>
                    <input v-model.number="item.quantity" type="number" min="1">
                  </td>
                  <td>
                    <input v-model.number="item.weight" type="number" step="0.1" min="0">
                  </td>
                  <td>
                    <button @click="removeItem(index)" class="remove-btn">Eliminar</button>
                  </td>
                </tr>
              </tbody>
            </table>
            <button @click="addItem" class="add-item-btn">Agregar ítem</button>
          </div>
        </div>

        <!-- Paso 3: Resumen -->
        <div v-if="currentStep === 2" class="order-summary">
          <h2>Resumen de la orden</h2>
          <div class="summary-cards">
            <div class="summary-card">
              <h3>Empresa Logística</h3>
              <div class="company-info">
                <img :src="selectedCompany?.logo" :alt="selectedCompany?.name" class="company-logo">
                <span>{{ selectedCompany?.name }}</span>
              </div>
            </div>
            <div class="summary-card">
              <h3>Total de ítems</h3>
              <p>{{ totalItems }}</p>
            </div>
            <div class="summary-card">
              <h3>Peso total</h3>
              <p>{{ totalWeight }} kg</p>
            </div>
          </div>
          <div class="items-list">
            <h3>Ítems incluidos</h3>
            <ul>
              <li v-for="(item, index) in orderItems" :key="index">
                {{ item.description }} - {{ item.quantity }} unidades - {{ item.weight }} kg
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="navigation-buttons">
        <button
          v-if="currentStep > 0"
          @click="previousStep"
          class="nav-btn"
        >
          Anterior
        </button>
        <button
          v-if="currentStep < steps.length - 1"
          @click="nextStep"
          class="submit-btn"
          :disabled="!canProceed"
        >
          Siguiente
        </button>
        <button
          v-if="currentStep === steps.length - 1"
          @click="submitOrder"
          class="submit-btn"
          :disabled="!canSubmit"
        >
          Enviar Orden
        </button>
      </div>
    </template>
    <template v-else>
      <div class="success-message">
        <h2>¡Orden enviada con éxito!</h2>
        <p>¿Qué deseas hacer ahora?</p>
        <div class="success-actions">
          <button @click="resetForm" class="nav-btn">Crear otra orden</button>
          <button @click="goToOrderList" class="submit-btn">Ir a la lista de órdenes</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ClientOrderCreationView',
  data() {
    return {
      currentStep: 0,
      steps: [
        { title: 'Empresa Logística' },
        { title: 'Agregar Ítems' },
        { title: 'Resumen' }
      ],
      logisticsCompanies: [
        { id: 1, name: 'Logística Express' },
        { id: 2, name: 'Transportes Rápidos' },
        { id: 3, name: 'Envíos Seguros' },
        { id: 4, name: 'Delivery Plus' },
        { id: 5, name: 'Mensajería Nacional' }
      ],
      selectedCompany: null,
      deliveryAddress: '',
      deliveryDate: '',
      orderItems: [],
      orderSent: false
    }
  },
  computed: {
    totalItems() {
      return this.orderItems.reduce((sum, item) => sum + item.quantity, 0)
    },
    totalWeight() {
      return this.orderItems.reduce((sum, item) => sum + (item.weight * item.quantity), 0)
    },
    deliveredItems() {
      return this.orderItems.reduce((sum, item) => sum + item.delivered, 0)
    },
    canProceed() {
      if (this.currentStep === 0) {
        return this.selectedCompany !== null
      }
      if (this.currentStep === 1) {
        return this.orderItems.length > 0 &&
               this.orderItems.every(item =>
                 item.description && item.quantity > 0 && item.weight > 0
               ) &&
               this.deliveryAddress &&
               this.deliveryDate
      }
      return true
    },
    canSubmit() {
      return this.selectedCompany &&
             this.orderItems.length > 0 &&
             this.deliveryAddress &&
             this.deliveryDate
    }
  },
  methods: {
    selectCompany(company) {
      this.selectedCompany = company
    },
    addItem() {
      this.orderItems.push({
        description: '',
        quantity: 1,
        weight: 0,
        delivered: 0
      })
    },
    removeItem(index) {
      this.orderItems.splice(index, 1)
    },
    nextStep() {
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++
      }
    },
    previousStep() {
      if (this.currentStep > 0) {
        this.currentStep--
      }
    },
    async submitOrder() {
      try {
        const orderData = {
          logisticsCompany: this.selectedCompany,
          deliveryAddress: this.deliveryAddress,
          deliveryDate: this.deliveryDate,
          status: 'pending',
          items: this.orderItems,
          totalItems: this.totalItems,
          totalWeight: this.totalWeight,
          deliveredItems: this.deliveredItems,
        }
        console.log('Enviando orden:', orderData)
        // await this.$store.dispatch('orders/createOrder', orderData)
        this.orderSent = true
        await axios.post('http://localhost:3000/order', orderData)
      } catch (error) {
        console.error('Error al crear la orden:', error)
      }
    },
    resetForm() {
      this.currentStep = 0
      this.selectedCompany = null
      this.deliveryAddress = ''
      this.deliveryDate = ''
      this.orderItems = []
      this.orderSent = false
    },
    goToOrderList() {
      this.$router.push('/tracklab/orders')
    }
  }
}
</script>

<style scoped>
.client-order-creation {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #42A5F5;
  border-radius: 12px;
}

.stepper-container {
  margin-bottom: 2rem;
}

.stepper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
}

.step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 20px;
  right: -50%;
  width: 100%;
  height: 2px;
  background-color: #e0e0e0;
  z-index: 1;
}

.step.active .step-number {
  background-color: #4CAF50;
  color: white;
}

.step.completed .step-number {
  background-color: #4CAF50;
  color: white;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  z-index: 2;
}

.step-title {
  font-size: 0.9rem;
  color: #666;
}

.companies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.company-card {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.company-card:hover {
  border-color: #4CAF50;
}

.company-card.selected {
  border-color: #4CAF50;
  background-color: #f1f8e9;
}

.company-logo {
  max-width: 100px;
  height: auto;
  margin-bottom: 1rem;
}

.items-table {
  margin-top: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.summary-card {
  background-color: #f5f5f5;
  padding: 1.5rem;
  border-radius: 8px;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.nav-btn, .submit-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.nav-btn {
  background-color: #e0e0e0;
}

.submit-btn {
  background-color: #4CAF50;
  color: white;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.remove-btn {
  background-color: #ff5252;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.add-item-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}

.company-dropdown {
  max-width: 400px;
  margin: 2rem auto;
}

.company-select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 1rem;
  color: #000;
}

.selected-company-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.delivery-info {
  margin-bottom: 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: bold;
  color: #333;
}

.form-input {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
}

.form-input:focus {
  border-color: #42A5F5;
  outline: none;
}

.success-message {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  padding: 3rem 2rem;
  text-align: center;
  margin: 3rem auto;
  max-width: 500px;
}
.success-message h2 {
  color: #4CAF50;
  margin-bottom: 1rem;
}
.success-actions {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2rem;
}
</style>
