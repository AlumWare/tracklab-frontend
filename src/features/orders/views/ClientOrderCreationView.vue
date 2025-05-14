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
            <div class="step-title">{{ t(`orderCreation.steps.${['logistics', 'items', 'summary'][index]}`) }}</div>
          </div>
        </div>
      </div>

      <div class="step-content">
        <!-- Paso 1: Selección de empresa logística -->
        <div v-if="currentStep === 0" class="logistics-company-selection">
          <h2>{{ t('orderCreation.logistics.title') }}</h2>
          <div class="company-dropdown">
            <select v-model="selectedCompany" class="company-select">
              <option value="" disabled>{{ t('orderCreation.logistics.selectPlaceholder') }}</option>
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
          <h2>{{ t('orderCreation.items.title') }}</h2>
          <div class="delivery-info">
            <div class="form-group">
              <label for="delivery-address">{{ t('orderCreation.items.delivery.address') }}</label>
              <input
                id="delivery-address"
                v-model="deliveryAddress"
                type="text"
                :placeholder="t('orderCreation.items.delivery.addressPlaceholder')"
                class="form-input"
              >
            </div>
            <div class="form-group">
              <label for="delivery-date">{{ t('orderCreation.items.delivery.date') }}</label>
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
                  <th>{{ t('orderCreation.items.table.description') }}</th>
                  <th>{{ t('orderCreation.items.table.quantity') }}</th>
                  <th>{{ t('orderCreation.items.table.weight') }}</th>
                  <th>{{ t('orderCreation.items.table.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in orderItems" :key="index">
                  <td>
                    <input v-model="item.description" type="text" :placeholder="t('orderCreation.items.descriptionPlaceholder')">
                  </td>
                  <td>
                    <input v-model.number="item.quantity" type="number" min="1">
                  </td>
                  <td>
                    <input v-model.number="item.weight" type="number" step="0.1" min="0">
                  </td>
                  <td>
                    <button @click="removeItem(index)" class="remove-btn">{{ t('orderCreation.items.removeItem') }}</button>
                  </td>
                </tr>
              </tbody>
            </table>
            <button @click="addItem" class="add-item-btn">{{ t('orderCreation.items.addItem') }}</button>
          </div>
        </div>

        <!-- Paso 3: Resumen -->
        <div v-if="currentStep === 2" class="order-summary">
          <h2>{{ t('orderCreation.summary.title') }}</h2>
          <div class="summary-cards">
            <div class="summary-card">
              <h3>{{ t('orderCreation.summary.logisticsCompany') }}</h3>
              <div class="company-info">
                <img :src="selectedCompany?.logo" :alt="selectedCompany?.name" class="company-logo">
                <span>{{ selectedCompany?.name }}</span>
              </div>
            </div>
            <div class="summary-card">
              <h3>{{ t('orderCreation.summary.totalItems') }}</h3>
              <p>{{ totalItems }}</p>
            </div>
            <div class="summary-card">
              <h3>{{ t('orderCreation.summary.totalWeight') }}</h3>
              <p>{{ totalWeight }} kg</p>
            </div>
          </div>
          <div class="items-list">
            <h3>{{ t('orderCreation.summary.includedItems') }}</h3>
            <ul>
              <li v-for="(item, index) in orderItems" :key="index">
                {{ item.description }} - {{ item.quantity }} {{ t('orderCreation.items.table.quantity') }} - {{ item.weight }} kg
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
          {{ t('orderCreation.navigation.previous') }}
        </button>
        <button
          v-if="currentStep < steps.length - 1"
          @click="nextStep"
          class="submit-btn"
          :disabled="!canProceed"
        >
          {{ t('orderCreation.navigation.next') }}
        </button>
        <button
          v-if="currentStep === steps.length - 1"
          @click="submitOrder"
          class="submit-btn"
          :disabled="!canSubmit"
        >
          {{ t('orderCreation.navigation.submit') }}
        </button>
      </div>
    </template>
    <template v-else>
      <div class="success-message">
        <h2>{{ t('orderCreation.success.title') }}</h2>
        <p>{{ t('orderCreation.success.message') }}</p>
        <div class="success-actions">
          <button @click="resetForm" class="nav-btn">{{ t('orderCreation.success.createAnother') }}</button>
          <button @click="goToOrderList" class="submit-btn">{{ t('orderCreation.success.viewOrders') }}</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import axios from 'axios'
import { useI18n } from 'vue-i18n'

export default {
  name: 'ClientOrderCreationView',
  setup() {
    const { t } = useI18n()
    return { t }
  },
  data() {
    return {
      currentStep: 0,
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
    steps() {
      return [
        { title: this.t('orderCreation.steps.logistics') },
        { title: this.t('orderCreation.steps.items') },
        { title: this.t('orderCreation.steps.summary') }
      ]
    },
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
        const response = await axios.get('http://localhost:3000/order');
        const lastOrder = response.data[response.data.length - 1];
        const newOperation = {
          type: "pickup",
          date: "2025-05-14",
          node: "Almacén Central",
          container: "CNT-013",
          order: lastOrder,
          photos: []
        }
        await axios.post('http://localhost:3000/operation', newOperation)
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
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: #333;
}

.stepper-container {
  margin-bottom: 2rem;
}

.stepper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  position: relative;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
  z-index: 1;
}

.step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 20px;
  right: -50%;
  width: 100%;
  height: 2px;
  background-color: #e0e0e0;
  z-index: 0;
}

.step.active .step-number {
  background-color: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.step.completed .step-number {
  background-color: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #ffffff;
  border: 2px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  font-weight: bold;
  transition: all 0.3s ease;
}

.step-title {
  font-size: 0.9rem;
  color: #666;
  text-align: center;
  transition: color 0.3s ease;
}

.step.active .step-title {
  color: #4CAF50;
  font-weight: bold;
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
  color: #333;
  background-color: #ffffff;
  transition: border-color 0.3s ease;
}

.company-select:focus {
  border-color: #4CAF50;
  outline: none;
}

.selected-company-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.delivery-info {
  margin-bottom: 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #333;
}

.form-input {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  color: #333;
  background-color: #ffffff;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  border-color: #4CAF50;
  outline: none;
}

.form-input::placeholder {
  color: #999;
}

.items-table {
  margin-top: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background-color: #ffffff;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
  color: #333;
}

th {
  background-color: #f5f5f5;
  font-weight: 600;
  color: #333;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  color: #333;
  background-color: #ffffff;
  transition: border-color 0.3s ease;
}

input:focus {
  border-color: #4CAF50;
  outline: none;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.summary-card {
  background-color: #ffffff;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.summary-card h3 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.summary-card p {
  color: #666;
}

.items-list {
  background-color: #ffffff;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.items-list h3 {
  color: #333;
  margin-bottom: 1rem;
}

.items-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.items-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #e0e0e0;
  color: #666;
}

.items-list li:last-child {
  border-bottom: none;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  gap: 1rem;
}

.nav-btn, .submit-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.nav-btn {
  background-color: #e0e0e0;
  color: #333;
}

.nav-btn:hover {
  background-color: #d0d0d0;
}

.submit-btn {
  background-color: #4CAF50;
  color: white;
}

.submit-btn:hover {
  background-color: #45a049;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.remove-btn {
  background-color: #ff5252;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.remove-btn:hover {
  background-color: #ff1744;
}

.add-item-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1rem;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.add-item-btn:hover {
  background-color: #45a049;
}

.success-message {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 3rem 2rem;
  text-align: center;
  margin: 3rem auto;
  max-width: 500px;
}

.success-message h2 {
  color: #4CAF50;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.success-message p {
  color: #666;
  margin-bottom: 2rem;
}

.success-actions {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .delivery-info {
    grid-template-columns: 1fr;
  }

  .navigation-buttons {
    flex-direction: column;
  }

  .nav-btn, .submit-btn {
    width: 100%;
  }

  .success-actions {
    flex-direction: column;
  }

  .success-actions button {
    width: 100%;
  }
}
</style>
