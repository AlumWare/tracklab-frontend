<script>
import InputField from '@/shared/components/input.component.vue'

  export default {
    name: "Register-User",
    components: {
      InputField
    },
    data() {
      return {
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
      }
    }
  }
</script>

<template>
  <div class="register-container">
    <div>
      <image src="" alt="tdv no hay"></image>
    </div>
    <div class="info-container">
      <h2>Ingrese sus datos</h2>
      <div class="inputs-container">
        <div class="field">
          <p>Ingrese su nombre</p>
          <InputField v-model="name" placeholder="Ingrese su nombre"></InputField>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
