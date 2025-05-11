<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="['btn', color]"
    @click="handleClick"
  >
    <template v-if="!loading">
      <slot name="icon-left" />
      <span>{{ label }}</span>
      <slot name="icon-right" />
    </template>
    <span v-else class="loader"></span>
  </button>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  label: { type: String, default: 'Click me' },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  color: {
    type: String,
    default: 'primary',
    validator: value =>
      ['primary', 'accent', 'secondary', 'success', 'error', 'warning', 'info'].includes(value)
  }
})

const emit = defineEmits(['click'])

function handleClick() {
  if (!props.disabled && !props.loading) {
    emit('click')
  }
}
</script>

<style scoped lang="scss">
.btn {
  padding: 12px 28px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
    filter: brightness(1.05);
  }

  &:active {
    animation: pulse 0.2s ease-in-out;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
  }

  .loader {
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top: 3px solid white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
}

.primary    { background-color: #e6f236; color: #000; }
.accent     { background-color: #ff2f86; color: #fff; }
.secondary  { background-color: #e1e1e1; color: #000; }
.success    { background-color: #4CAF50; color: #fff; }
.error      { background-color: #f44336; color: #fff; }
.warning    { background-color: #ff9800; color: #000; }
.info       { background-color: #2196f3; color: #fff; }

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%   { transform: scale(1); }
  50%  { transform: scale(0.96); }
  100% { transform: scale(1); }
}
</style>
