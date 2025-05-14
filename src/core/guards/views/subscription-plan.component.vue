<script>
  import PaymentCard from '@/features/billing/components/payment-card.vue'

  export default {
    name: 'SubscriptionPlan',
    components: { PaymentCard },
    methods: {
      handleTypeSaved(title) {
        console.log(`El título del tipo seleccionado es: ${title}`);
        this.$router.push('/register-company');
      }
    }
  }
</script>

<template>
  <div class="general-container">
    <h1 class="title">Escoge tu plan</h1>
    <div class="cards-container">
      <payment-card
        title="Básico"
        :items="['✔ 1 empresa cliente y 1 proveedora', '✔ Hasta 50 pedidos/mes', '✔ Soporte dedicado', '✔ Dashboard básico']"
        price="S/ 100"
        @typeSaved="handleTypeSaved"
      ></payment-card>
      <payment-card
        title="Premium"
        :items="['✔ Hasta 5 empresas conectadas', '✔ 500 pedidos/mes7', '✔ Dashboard avanzado', '✔ Soporte preferencial']"
        price=" S/ 250"
        @typeSaved="handleTypeSaved"
      ></payment-card>
      <payment-card
        title="Enterprise"
        :items="['✔ Empresas ilimitadas', '✔ Envíos ilimitados', '✔ Soporte dedicado', '✔ Integraciones personalizadas']"
        price="S/ 500"
        @typeSaved="handleTypeSaved"
      ></payment-card>
    </div>
    <button type="submit" class="login-btn" @click="$router.push('/register-company')">Ninguno, soy cliente</button>
  </div>
</template>

<style scoped>
.general-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.title {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 40px;
}

.cards-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 50px;
}

.login-btn {
  width: 50%;
  padding: 10px 0;
  background: #4bb0fa;
  color: #111;
  font-weight: 600;
  border: 1.5px solid #222;
  border-radius: 6px;
  font-size: 1.1rem;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background 0.2s, color 0.2s;
}

.login-btn:hover {
  background: #2196f3;
  color: #fff;
}
</style>
