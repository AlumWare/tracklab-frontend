<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="home-view">
    <div class="welcome-section">
      <h1>Bienvenido a TrackLab</h1>
      <p class="subtitle">Gestiona tu flota, almacenes y operaciones de entrega en un solo lugar</p>
    </div>

    <div class="features-grid">
      <div class="feature-card">
        <div class="icon-container">
          <i class="pi pi-truck"></i>
        </div>
        <h3>Gestión de Flota</h3>
        <p>Administra tus vehículos y conductores eficientemente</p>
      </div>

      <div class="feature-card">
        <div class="icon-container">
          <i class="pi pi-building"></i>
        </div>
        <h3>Operaciones de Almacén</h3>
        <p>Controla el inventario y gestiona espacios de almacenamiento</p>
      </div>

      <div class="feature-card">
        <div class="icon-container">
          <i class="pi pi-map"></i>
        </div>
        <h3>Planificación de Rutas</h3>
        <p>Optimiza rutas y horarios de entrega</p>
      </div>
    </div>

    <div class="quick-actions">
      <h2>Acciones Rápidas</h2>
      <div class="actions-grid">
        <button class="action-button" @click="$router.push('/tracklab/vehiculos')">
          <i class="pi pi-truck"></i>
          Gestionar Vehículos
        </button>
        <button class="action-button" @click="$router.push('/tracklab/ware-house-management-view')">
          <i class="pi pi-building"></i>
          Gestionar Almacén
        </button>
        <button class="action-button" @click="$router.push('/tracklab/route-planing-view')">
          <i class="pi pi-map"></i>
          Planificar Ruta
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  text-align: center;
  margin-bottom: 3rem;
}

h1 {
  font-size: 2.5rem;
  color: var(--text-color);
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.2rem;
  color: var(--text-color-secondary);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.feature-card {
  border-radius: 16px;
  background: #42A5F5;
  padding: 2rem;
  text-align: center;
  transition: transform 0.2s ease;
  box-shadow: var(--card-shadow);
  color: white;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.feature-card h3 {
  color: white;
  margin: 1rem 0;
}

.feature-card p {
  color: rgba(255, 255, 255, 0.9);
}

.icon-container {
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-container i {
  font-size: 2rem;
  color: white;
}

.quick-actions {
  background: var(--surface-card);
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--card-shadow);
}

.quick-actions h2 {
  margin-bottom: 1.5rem;
  color: var(--text-color);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--surface-ground);
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius);
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  background: var(--primary-color);
  color: var(--primary-color-text);
  border-color: var(--primary-color);
}

@media (max-width: 768px) {
  .home-view {
    padding: 1rem;
  }

  h1 {
    font-size: 2rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
