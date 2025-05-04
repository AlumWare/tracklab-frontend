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
      <img src="" alt="tdv no hay"/>
    </div>
    <div class="info-container">
      <h2>Ingrese sus datos</h2>
      <div class="inputs-container">
        <div class="field">
          <p>Nombre</p>
          <InputField v-model="name" placeholder="Ingrese su nombre"></InputField>
        </div>
        <div class="field">
          <p>Email</p>
          <InputField v-model="email" placeholder="Ingrese su email"></InputField>
        </div>
        <div class="field">
          <p>Password</p>
          <InputField v-model="password" placeholder="Ingrese su password"></InputField>
        </div>
        <div class="field">
          <p>Repeat password</p>
          <InputField v-model="password_confirmation" placeholder="Repita su password"></InputField>
        </div>
      </div>
      <div class="button">
        <a :href="''" target="_blank">Enviar</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 10rem;
}

.info-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  margin: 25px;
  gap: 10px;
  align-items: center;
}

.inputs-container {
  width: 100%;
}

.button {
  padding: 10px 20px;
  width: 80%;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  text-align: center;
  background-color: var(--info);
  color: white;
}

.button:hover {
  background-color: var(--primary);
  color: black;
}
</style>
