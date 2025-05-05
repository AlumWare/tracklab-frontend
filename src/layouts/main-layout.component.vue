<script>
import Header from '@/shared/components/header.component.vue'
import Sidebar from '@/shared/components/sidebar.component.vue'

export default {
  name: 'MainLayout',
  components: {
    Header,
    Sidebar
  },
  data() {
    return {
      isSidebarOpen: true
    }
  },
  methods: {
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen
    }
  }
}
</script>

<template>
  <div class="main-layout" :class="{ 'sidebar-open': isSidebarOpen }">
    <sidebar-component class="main-layout__sidebar" :isOpen="isSidebarOpen"></sidebar-component>
    
    <div class="main-layout__content">
      <header-component class="main-layout__header" :title="'title'" @toggle-sidebar="toggleSidebar"></header-component>
      
      <main class="main-layout__main">
        <router-view></router-view>
      </main>
    </div>
    
    <div class="sidebar-overlay" v-if="isSidebarOpen" @click="toggleSidebar"></div>
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
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.main-layout__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: margin-left 0.3s ease;
}

.main-layout__main {
  flex: 1;
  padding: var(--spacing-md);
  overflow: auto;
  background-color: var(--background);
}

.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--overlay);
  z-index: 999;
}

@media (max-width: 768px) {
  .sidebar-open .sidebar-overlay {
    display: block;
  }
}
</style>


