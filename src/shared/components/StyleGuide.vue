<script setup>
import { useThemeStore } from '@/stores/theme'
import SubscriptionPlanComponent from '@/core/guards/views/subscription-plan.component.vue'
import InputField from '@/shared/components/input.component.vue'
import { ref } from 'vue'

const themeStore = useThemeStore()
const userInput = ref('');

</script>

<template>
  <div class="style-guide">
    <header class="style-guide-header">
      <div class="header-content">
        <h1>TrackLab Design System</h1>
        <button class="theme-toggle" @click="themeStore.toggleTheme">
          {{ themeStore.isDark ? '🌞' : '🌙' }}
        </button>
      </div>
    </header>

    <main class="style-guide-content">
      <!-- Colors Section -->
      <section class="style-guide-section">
        <h2>Color Palette</h2>
        <div class="color-grid">
          <div class="color-box primary">
            <span class="color-name">Primary</span>
            <span class="color-value">var(--primary)</span>
          </div>
          <div class="color-box accent">
            <span class="color-name">Accent</span>
            <span class="color-value">var(--accent)</span>
          </div>
          <div class="color-box secondary">
            <span class="color-name">Secondary</span>
            <span class="color-value">var(--secondary)</span>
          </div>
          <div class="color-box success">
            <span class="color-name">Success</span>
            <span class="color-value">var(--success)</span>
          </div>
          <div class="color-box error">
            <span class="color-name">Error</span>
            <span class="color-value">var(--error)</span>
          </div>
          <div class="color-box warning">
            <span class="color-name">Warning</span>
            <span class="color-value">var(--warning)</span>
          </div>
          <div class="color-box info">
            <span class="color-name">Info</span>
            <span class="color-value">var(--info)</span>
          </div>
        </div>
      </section>

      <!-- Typography Section -->
      <section class="style-guide-section">
        <h2>Typography</h2>
        <div class="typography-examples">
          <div class="text-example">
            <h1>Heading 1</h1>
            <p class="text-details">font-size: 2.5rem, font-weight: bold</p>
          </div>
          <div class="text-example">
            <h2>Heading 2</h2>
            <p class="text-details">font-size: 2rem, font-weight: bold</p>
          </div>
          <div class="text-example">
            <h3>Heading 3</h3>
            <p class="text-details">font-size: 1.75rem, font-weight: bold</p>
          </div>
          <div class="text-example">
            <p class="text-primary">Primary Text</p>
            <p class="text-details">color: var(--text-primary)</p>
          </div>
          <div class="text-example">
            <p class="text-secondary">Secondary Text</p>
            <p class="text-details">color: var(--text-secondary)</p>
          </div>
        </div>
      </section>

      <!-- Spacing Section -->
      <section class="style-guide-section">
        <h2>Spacing System</h2>
        <div class="spacing-examples">
          <div class="spacing-box small">
            <span class="spacing-label">Small</span>
            <span class="spacing-value">var(--spacing-sm)</span>
          </div>
          <div class="spacing-box medium">
            <span class="spacing-label">Medium</span>
            <span class="spacing-value">var(--spacing-md)</span>
          </div>
          <div class="spacing-box large">
            <span class="spacing-label">Large</span>
            <span class="spacing-value">var(--spacing-lg)</span>
          </div>
        </div>
      </section>

      <!-- Surface Colors Section -->
      <section class="style-guide-section">
        <h2>Surface Colors</h2>
        <div class="surface-examples">
          <div class="surface-box background">
            <span class="surface-label">Background</span>
            <span class="surface-value">var(--background)</span>
          </div>
          <div class="surface-box surface">
            <span class="surface-label">Surface</span>
            <span class="surface-value">var(--surface)</span>
          </div>
          <div class="surface-box overlay">
            <span class="surface-label">Overlay</span>
            <span class="surface-value">var(--overlay)</span>
          </div>
        </div>
      </section>
    </main>
  </div>
  <subscription-plan-component></subscription-plan-component>
  <InputField
    v-model="userInput"
    placeholder="Escribe algo aquí..."
  />
</template>

<style scoped>
.style-guide {
  min-height: 100vh;
  background-color: var(--background);
  color: var(--text-primary);
}

.style-guide-header {
  background-color: var(--surface);
  border-bottom: 1px solid var(--secondary);
  padding: var(--spacing-lg) 0;
  margin-bottom: var(--spacing-xl);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1 {
  font-size: 2.5rem;
  margin: 0;
  color: var(--text-primary);
}

.theme-toggle {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: 50%;
  transition: background-color 0.3s;
}

.theme-toggle:hover {
  background-color: var(--overlay);
}

.style-guide-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.style-guide-section {
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background-color: var(--surface);
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  font-size: 2rem;
  margin-bottom: var(--spacing-lg);
  color: var(--text-primary);
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--secondary);
}

/* Color Grid */
.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}

.color-box {
  padding: var(--spacing-lg);
  border-radius: 8px;
  color: var(--text-inverted);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  transition: transform 0.2s;
}

.color-box:hover {
  transform: translateY(-2px);
}

.color-name {
  font-weight: var(--font-weight-bold);
  font-size: 1.25rem;
}

.color-value {
  font-size: var(--font-size-sm);
  opacity: 0.8;
  font-family: monospace;
}

/* Typography Examples */
.typography-examples {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.text-example {
  padding: var(--spacing-lg);
  background-color: var(--background);
  border-radius: 8px;
  border: 1px solid var(--secondary);
}

.text-example h1,
.text-example h2,
.text-example h3 {
  margin: 0 0 var(--spacing-sm) 0;
}

.text-details {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: var(--spacing-sm) 0 0 0;
  font-family: monospace;
}

/* Spacing Examples */
.spacing-examples {
  display: flex;
  gap: var(--spacing-lg);
}

.spacing-box {
  flex: 1;
  padding: var(--spacing-md);
  background-color: var(--background);
  border: 1px solid var(--secondary);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  align-items: center;
  justify-content: center;
  min-height: 120px;
}

.spacing-box.small { padding: var(--spacing-sm); }
.spacing-box.medium { padding: var(--spacing-md); }
.spacing-box.large { padding: var(--spacing-lg); }

.spacing-label {
  font-weight: var(--font-weight-bold);
  font-size: 1.25rem;
}

.spacing-value {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-family: monospace;
}

/* Surface Examples */
.surface-examples {
  display: flex;
  gap: var(--spacing-lg);
}

.surface-box {
  flex: 1;
  padding: var(--spacing-lg);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  align-items: center;
  justify-content: center;
  min-height: 120px;
  border: 1px solid var(--secondary);
}

.surface-label {
  font-weight: var(--font-weight-bold);
  font-size: 1.25rem;
  color: var(--text-primary);
}

.surface-value {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-family: monospace;
}

/* Color Classes */
.color-box.primary { background-color: var(--primary); }
.color-box.accent { background-color: var(--accent); }
.color-box.secondary { background-color: var(--secondary); }
.color-box.success { background-color: var(--success); }
.color-box.error { background-color: var(--error); }
.color-box.warning { background-color: var(--warning); }
.color-box.info { background-color: var(--info); }

/* Responsive adjustments */
@media (max-width: 768px) {
  .style-guide-content {
    padding: 0 var(--spacing-md);
  }

  .style-guide-section {
    padding: var(--spacing-md);
  }

  .color-grid {
    grid-template-columns: 1fr;
  }

  .spacing-examples,
  .surface-examples {
    flex-direction: column;
  }

  h1 {
    font-size: 2rem;
  }

  h2 {
    font-size: 1.75rem;
  }
}
</style>
