<script>
  export default {
    name: "PaymentCard",
    props: {
      title: String,
      items: Array,
      price: String,
    },
    methods: {
      onSaveType() {
        this.$emit('typeSaved', this.title);
      },
    },
  }
</script>

<template>
  <pv-card :header="title" class="card">
    <template #content>
      <p>Beneficios:</p>
      <ul>
        <li v-for="(item, index) in items" :key="index">{{ item }}</li>
      </ul>
    </template>
    <template #footer>
      <div class="card-footer">
        <span class="price">{{ 'Precio: ' + price }}</span>
        <pv-select-button label="Seleccionar" icon="pi pi-check" class="button" @click="onSaveType"></pv-select-button>
      </div>
    </template>
  </pv-card>
</template>

<style scoped>
.card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-width: 300px;
  margin: 20px;
  font-family: 'Arial', sans-serif;
  display: flex;
  flex-direction: column;
}

.card-footer {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.price {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #ff7f2a;
  margin-bottom: 10px;
}

.button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-weight: bold;
}

.button:hover {
  background-color: #f5f5f5;
}
</style>
