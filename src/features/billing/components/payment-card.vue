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
  <pv-card class="card">
    <template #header>
      <h3 class="card-title">{{ title }}</h3>
    </template>
    <template #content>
      <p class="content-title">Beneficios:</p>
      <ul class="card-list">
        <li v-for="(item, index) in items" :key="index">{{ item }}</li>
      </ul>
    </template>
    <template #footer>
      <div class="card-footer">
        <span class="price">{{ 'Precio: ' + price }}</span>
        <div class="button">
          <a :href="''" target="_blank">Seleccionar</a>
        </div>
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

.card-title {
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  color: var(--info);
  margin: 10px;
}

.content-title {
  padding: 0;
  margin: 0;
  margin-top: -15px;
}

.card-list {
  color: var(--text-secondary);
  padding: 4px 16px;
  margin: 4px;
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
  color: var(--info);
  margin-bottom: 10px;
}

.button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  text-align: center;
  background-color: var(--info);
}

.button:hover {
  background-color: var(--primary);
}
</style>
