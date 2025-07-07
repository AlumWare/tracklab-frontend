<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { onMounted } from 'vue'
import Snackbar from '@/shared/components/snackbar.vue'
import { uxStore } from '@/core/services/ux.service.js'

const themeStore = useThemeStore()

onMounted(() => {
  document.documentElement.setAttribute('data-theme', themeStore.isDark ? 'dark' : 'light')
})
</script>

<template>
  <RouterView />
  <Snackbar
    v-model="uxStore.snackbar.visible"
    :message="uxStore.snackbar.message"
    :type="uxStore.snackbar.type"
    :duration="uxStore.snackbar.duration"
  />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--primary);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--secondary);
  color: var(--text-primary);
  text-decoration: none;
  transition: color 0.3s;
}

nav a:hover {
  color: var(--primary);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;
    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
