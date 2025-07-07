<template>
    <button @click="open = true">Escanear QR</button>
    <qr-scanner v-model:open="open" @scanned="handleScanned" />
  </template>
  <script setup>
  import { ref } from 'vue'
  import QrScanner from '@/components/qr-scanner.component.vue'
  const open = ref(false)
  function handleScanned(id) {
    // Aquí recibes el id numérico del QR
    console.log('QR escaneado:', id)
  }
  </script>