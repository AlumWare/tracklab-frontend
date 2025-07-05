<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'btn',
      `btn--${color}`,
      `btn--${size}`,
      {
        'btn--loading': loading,
        'btn--disabled': disabled,
        'btn--outline': outline,
        'btn--rounded': rounded,
        'btn--full-width': fullWidth
      }
    ]"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space="handleClick"
  >
    <div class="btn__content" :class="{ 'btn__content--loading': loading }">
      <slot name="icon-left" />
      <span v-if="label" class="btn__label">{{ label }}</span>
      <slot name="icon-right" />
    </div>
    
    <div v-if="loading" class="btn__loader">
      <div class="spinner"></div>
      <span v-if="loadingText" class="btn__loading-text">{{ loadingText }}</span>
    </div>
  </button>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  label: { type: String, default: '' },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  loadingText: { type: String, default: '' },
  color: {
    type: String,
    default: 'primary',
    validator: value =>
      ['primary', 'accent', 'secondary', 'success', 'error', 'warning', 'info', 'ghost'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: value => ['small', 'medium', 'large'].includes(value)
  },
  outline: { type: Boolean, default: false },
  rounded: { type: Boolean, default: false },
  fullWidth: { type: Boolean, default: false }
})

const emit = defineEmits(['click'])

function handleClick(event) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped lang="scss">
.btn {
  position: relative;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  overflow: hidden;
  user-select: none;
  gap: 8px;
  font-family: inherit;
  
  // Focus styles for accessibility
  &:focus-visible {
    outline: 2px solid var(--primary, #4bb0fa);
    outline-offset: 2px;
  }
  
  // Disabled state
  &:disabled,
  &.btn--disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
    transform: none !important;
  }
  
  // Loading state
  &.btn--loading {
    cursor: wait;
    pointer-events: none;
  }
  
  // Full width
  &.btn--full-width {
    width: 100%;
  }
  
  // Rounded variant
  &.btn--rounded {
    border-radius: 50px;
  }
  
  // Outline variant
  &.btn--outline {
    background: transparent;
    border: 2px solid currentColor;
    
    &:hover {
      background: currentColor;
      color: white;
    }
  }
}

// Size variants
.btn--small {
  padding: 8px 16px;
  font-size: 14px;
  min-height: 36px;
}

.btn--medium {
  padding: 12px 24px;
  font-size: 15px;
  min-height: 44px;
}

.btn--large {
  padding: 16px 32px;
  font-size: 16px;
  min-height: 52px;
}

// Color variants
.btn--primary {
  background: linear-gradient(135deg, #4bb0fa 0%, #3a8fd9 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(75, 176, 250, 0.3);
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(75, 176, 250, 0.4);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(75, 176, 250, 0.3);
  }
}

.btn--accent {
  background: linear-gradient(135deg, #ff2f86 0%, #e91e63 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(255, 47, 134, 0.3);
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 47, 134, 0.4);
  }
}

.btn--secondary {
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  color: #333;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
}

.btn--success {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
  }
}

.btn--error {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(244, 67, 54, 0.4);
  }
}

.btn--warning {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 152, 0, 0.4);
  }
}

.btn--info {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
  }
}

.btn--ghost {
  background: transparent;
  color: #666;
  border: 1px solid #e0e0e0;
  
  &:hover:not(:disabled) {
    background: #f5f5f5;
    border-color: #ccc;
  }
}

// Content and loader
.btn__content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.3s ease;
  
  &--loading {
    opacity: 0;
  }
}

.btn__label {
  white-space: nowrap;
}

.btn__loader {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.btn__loading-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
}

// Animations
@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

// Responsive
@media (max-width: 768px) {
  .btn--large {
    padding: 14px 28px;
    font-size: 15px;
    min-height: 48px;
  }
  
  .btn--medium {
    padding: 10px 20px;
    font-size: 14px;
    min-height: 40px;
  }
  
  .btn--small {
    padding: 6px 12px;
    font-size: 13px;
    min-height: 32px;
  }
}
</style>
