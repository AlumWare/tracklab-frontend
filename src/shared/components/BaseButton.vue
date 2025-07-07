<template>
  <button
    :class="[
      'base-button',
      variant,
      size,
      { 'is-loading': loading, 'is-disabled': disabled }
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="loading-spinner"></span>
    <i v-if="icon && !loading" :class="icon + ' button-icon'"></i>
    <span v-if="$slots.default" class="button-content">
      <slot></slot>
    </span>
  </button>
</template>

<script>
export default {
  name: 'BaseButton',
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: value => ['primary', 'secondary', 'outline', 'text'].includes(value)
    },
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large'].includes(value)
    },
    icon: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 2px solid transparent;

  &.primary {
    background-color: var(--color-button-primary);
    color: var(--color-button-text);

    &:hover:not(:disabled) {
      background-color: var(--color-primary-dark);
    }
  }

  &.secondary {
    background-color: var(--color-button-secondary);
    color: var(--color-button-text);

    &:hover:not(:disabled) {
      background-color: var(--color-secondary-dark);
    }
  }

  &.outline {
    background-color: transparent;
    border-color: var(--color-button-primary);
    color: var(--color-button-primary);

    &:hover:not(:disabled) {
      background-color: var(--color-background-hover);
    }
  }

  &.text {
    background-color: transparent;
    color: var(--color-button-primary);
    padding: 0.25rem 0.5rem;

    &:hover:not(:disabled) {
      background-color: var(--color-background-hover);
    }
  }

  &.small {
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
  }

  &.medium {
    padding: 0.5rem 1rem;
    font-size: 1rem;
  }

  &.large {
    padding: 0.75rem 1.5rem;
    font-size: 1.125rem;
  }

  &:disabled {
    background-color: var(--color-background-disabled);
    color: var(--color-text-disabled);
    cursor: not-allowed;
  }

  .button-icon {
    width: 1.25em;
    height: 1.25em;
  }

  .button-content {
    line-height: 1.25;
  }

  .loading-spinner {
    width: 1.25em;
    height: 1.25em;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: spin 0.75s linear infinite;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
