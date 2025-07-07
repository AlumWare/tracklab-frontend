<template>
    <div>
      <p>Componente de prueba</p>
    </div>
  </template>
  <script setup>
  import { ref } from 'vue'
  
  const open = ref(false)
  
  function handleScanned(id) {
    // Aquí recibes el id numérico del QR
    console.log('QR escaneado:', id)
  }
  </script>