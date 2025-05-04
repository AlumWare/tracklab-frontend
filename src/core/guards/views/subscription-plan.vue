<script>
  import PaymentCard from '@/features/billing/components/payment-card.vue'

  export default {
    name: 'SubscriptionPlan',
    components: { PaymentCard },
    methods: {
      handleTypeSaved(title) {
        console.log(`El título del tipo seleccionado es: ${title}`);
      }
    }
  }
</script>

<template>
  <div class="general container">
    <h1>Escoge tu plan</h1>
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
  </div>
</template>

<style scoped>

</style>
