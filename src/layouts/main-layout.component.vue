<script>
import Header from '../shared/components/header.component.vue'
import Sidebar from '../shared/components/sidebar.component.vue'

export default {
  name: 'MainLayout',
  components: {
    Header,
    Sidebar
  },
  data() {
    return {
      isSidebarOpen: true,
      isMobile: false
    }
  },
  methods: {
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen
    },
    checkMobile() {
      this.isMobile = window.innerWidth <= 768
    }
  },
  mounted() {
    this.checkMobile()
    window.addEventListener('resize', this.checkMobile)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile)
  }
}
</script>

<template>
  <div class="main-layout" :class="{ 'sidebar-open': isSidebarOpen }">
    <Sidebar class="main-layout__sidebar" :isOpen="isSidebarOpen"></Sidebar>
    
    <div class="main-layout__content">
      <Header class="main-layout__header" :title="'title'" @toggle-sidebar="toggleSidebar"></Header>
      
      <main class="main-layout__main">
        <router-view></router-view>
      </main>
    </div>
    
    <div class="sidebar-overlay" v-if="isSidebarOpen && isMobile" @click="toggleSidebar"></div>
  </div>
</template>

<style scoped>
:host {
  display: block;
  height: 100vh;
  width: 100%;
}

.main-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  position: relative;
}

.main-layout__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: margin-left 0.3s ease;
  height: 100vh;
  margin-left: 64px; /* Ancho del sidebar colapsado */
}

.sidebar-open .main-layout__content {
  margin-left: 240px; /* Ancho del sidebar expandido */
}

.main-layout__header {
  flex-shrink: 0; /* Evita que el header se comprima */
}

.main-layout__main {
  flex: 1;
  padding: var(--spacing-md);
  overflow-y: auto; /* Scroll independiente */
  background-color: var(--background);
  height: calc(100vh - 64px); /* Altura total menos el header */
}

.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--overlay);
  z-index: 900; /* Justo debajo del sidebar */
}

@media (max-width: 768px) {
  .main-layout__content {
    margin-left: 0; /* En móvil, el contenido ocupa todo el ancho */
  }
  
  .sidebar-open .main-layout__content {
    margin-left: 0; /* En móvil, el contenido sigue ocupando todo el ancho */
  }
  
  .sidebar-open .sidebar-overlay {
    display: block;
  }
}
</style>


