<template>
  <transition name="dialog-fade">
    <div v-if="modelValue" class="confirm-dialog__overlay">
      <div class="confirm-dialog">
        <h3 v-if="title" class="confirm-dialog__title">{{ title }}</h3>
        <div class="confirm-dialog__message">
          <slot>{{ message }}</slot>
        </div>
        <div class="confirm-dialog__actions">
          <button class="btn btn-cancel" @click="$emit('cancel')">{{ cancelText }}</button>
          <button class="btn btn-confirm" @click="$emit('confirm')">{{ confirmText }}</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'ConfirmDialog',
  props: {
    modelValue: Boolean,
    title: String,
    message: String,
    confirmText: {
      type: String,
      default: 'Aceptar'
    },
    cancelText: {
      type: String,
      default: 'Cancelar'
    }
  }
}
</script>

<style scoped>
.confirm-dialog__overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.25);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.confirm-dialog {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  padding: 2rem 2.5rem 1.5rem 2.5rem;
  min-width: 320px;
  max-width: 90vw;
  text-align: center;
}
.confirm-dialog__title {
  margin-bottom: 1rem;
  font-size: 1.25rem;
  font-weight: 700;
}
.confirm-dialog__message {
  margin-bottom: 1.5rem;
  font-size: 1rem;
}
.confirm-dialog__actions {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}
.btn {
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-cancel {
  background: #e0e7ef;
  color: #222b45;
}
.btn-cancel:hover {
  background: #cfd8e3;
}
.btn-confirm {
  background: #4f8cff;
  color: #fff;
}
.btn-confirm:hover {
  background: #3a3d5c;
}
.dialog-fade-enter-active, .dialog-fade-leave-active {
  transition: opacity 0.3s;
}
.dialog-fade-enter-from, .dialog-fade-leave-to {
  opacity: 0;
}
</style> 