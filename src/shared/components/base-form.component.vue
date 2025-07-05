<template>
  <div v-if="visible" class="modal-overlay" @click="closeModal">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button class="close-btn" @click="closeModal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="form-content">
        <slot name="form-fields"></slot>
        
        <div class="modal-actions">
          <button type="button" @click="closeModal" class="cancel-btn">
            {{ cancelText }}
          </button>
          <button type="submit" class="save-btn" :disabled="loading">
            <span v-if="loading" class="loading-spinner"></span>
            {{ submitText }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    required: true
  },
  submitText: {
    type: String,
    default: 'Guardar'
  },
  cancelText: {
    type: String,
    default: 'Cancelar'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'submit'])

// Methods
const closeModal = () => {
  emit('close')
}

const handleSubmit = () => {
  emit('submit')
}
</script>

<style scoped>
/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  min-width: 500px;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.close-btn:hover {
  background-color: #f5f5f5;
  color: #333;
}

.close-btn svg {
  width: 1.5rem;
  height: 1.5rem;
}

.form-content {
  padding: 1.5rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f0f0f0;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.cancel-btn:hover {
  background-color: #e0e0e0;
}

.save-btn {
  padding: 0.75rem 1.5rem;
  background-color: #4FC3F7;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.save-btn:hover:not(:disabled) {
  background-color: #039BE5;
}

.save-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive design */
@media (max-width: 768px) {
  .modal {
    min-width: 90vw;
    margin: 1rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .cancel-btn,
  .save-btn {
    width: 100%;
  }
}
</style>
