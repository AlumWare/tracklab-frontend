<template>
  <div class="form-group">
    <label v-if="label" :for="id" class="form-label">{{ label }}</label>
    <div class="input-wrapper">
      <input
        v-if="type !== 'select' && type !== 'textarea'"
        :id="id"
        :type="type"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :class="{ 'error': hasError }"
        class="form-input"
      />
      
      <select
        v-else-if="type === 'select'"
        :id="id"
        :value="modelValue"
        @change="$emit('update:modelValue', $event.target.value)"
        :required="required"
        :disabled="disabled"
        :class="{ 'error': hasError }"
        class="form-input"
      >
        <option v-if="placeholder" value="">{{ placeholder }}</option>
        <option 
          v-for="option in options" 
          :key="option.value" 
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
      
      <textarea
        v-else-if="type === 'textarea'"
        :id="id"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :rows="rows"
        :class="{ 'error': hasError }"
        class="form-input"
      ></textarea>
    </div>
    
    <small v-if="errorMessage" class="error-message">{{ errorMessage }}</small>
    <small v-else-if="helpText" class="help-text">{{ helpText }}</small>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  id: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ''
  },
  helpText: {
    type: String,
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  rows: {
    type: Number,
    default: 3
  }
})

// Emits
defineEmits(['update:modelValue'])

// Computed
const hasError = computed(() => !!props.errorMessage)
</script>

<style scoped>
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  background-color: white;
  color: #333;
}

.form-input:focus {
  outline: none;
  border-color: #4FC3F7;
  box-shadow: 0 0 0 3px rgba(79, 195, 247, 0.1);
}

.form-input::placeholder {
  color: #999;
}

.form-input.error {
  border-color: #e74c3c;
}

.form-input.error:focus {
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
}

.form-input:disabled {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.form-input[type="textarea"] {
  resize: vertical;
  min-height: 100px;
}

.error-message {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
}

.help-text {
  color: #666;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
}

/* Responsive design */
@media (max-width: 768px) {
  .form-input {
    font-size: 16px; /* Prevents zoom on iOS */
  }
}
</style> 