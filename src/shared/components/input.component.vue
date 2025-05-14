<template>
  <div class="input-field">
    <input
      type="text"
      :placeholder="placeholder"
      v-model="inputValue"
    />
  </div>
</template>

<script>
export default {
  name: "InputField",
  props: {
    placeholder: {
      type: String,
      default: "Ingresa un valor"
    }
  },
  data() {
    return {
      inputValue: ""
    };
  },
  watch: {
    inputValue(newValue) {
      this.$emit("modelValue", newValue);
      console.log(newValue);
    }
  }
};
</script>

<style scoped>
.input-field input {
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  width: 100%;
  font-size: 16px;
  color: black;
}
</style>
