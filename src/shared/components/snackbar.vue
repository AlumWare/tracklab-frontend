<template>
  <transition name="snackbar-fade">
    <div v-if="visible" :class="['snackbar', type]">
      <span class="snackbar__icon" v-html="icon"></span>
      <span class="snackbar__message">{{ message }}</span>
      <button class="snackbar__close" @click="close">&times;</button>
      <div class="snackbar__progress" :style="progressStyle"></div>
    </div>
  </transition>
</template>

<script>
const ICONS = {
  info: `<svg width='20' height='20' fill='none' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' fill='#2196f3'/><text x='12' y='16' text-anchor='middle' fill='#fff' font-size='12' font-family='Arial' dy='.3em'>i</text></svg>`,
  success: `<svg width='20' height='20' fill='none' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' fill='#4caf50'/><polyline points='8,13 11,16 16,9' stroke='#fff' stroke-width='2' fill='none'/></svg>`,
  error: `<svg width='20' height='20' fill='none' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' fill='#f44336'/><line x1='9' y1='9' x2='15' y2='15' stroke='#fff' stroke-width='2'/><line x1='15' y1='9' x2='9' y2='15' stroke='#fff' stroke-width='2'/></svg>`,
  warning: `<svg width='20' height='20' fill='none' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' fill='#ff9800'/><text x='12' y='16' text-anchor='middle' fill='#fff' font-size='14' font-family='Arial' dy='.3em'>!</text></svg>`
};

export default {
  name: 'Snackbar',
  props: {
    message: String,
    type: {
      type: String,
      default: 'info' // info, success, error, warning
    },
    duration: {
      type: Number,
      default: 3000
    },
    modelValue: Boolean
  },
  data() {
    return {
      visible: this.modelValue,
      progress: 100,
      interval: null
    }
  },
  computed: {
    icon() {
      return ICONS[this.type] || ICONS.info;
    },
    progressStyle() {
      return {
        width: this.progress + '%',
        transition: 'width 0.1s linear',
        background: this.progressColor
      };
    },
    progressColor() {
      switch (this.type) {
        case 'success': return '#4caf50';
        case 'error': return '#f44336';
        case 'warning': return '#ff9800';
        default: return '#2196f3';
      }
    }
  },
  watch: {
    modelValue(val) {
      this.visible = val;
      if (val) this.startProgress();
    }
  },
  methods: {
    close() {
      this.visible = false;
      this.$emit('update:modelValue', false);
      this.clearProgress();
    },
    startProgress() {
      this.progress = 100;
      this.clearProgress();
      if (this.duration > 0) {
        const step = 100 / (this.duration / 100);
        this.interval = setInterval(() => {
          this.progress -= step;
          if (this.progress <= 0) {
            this.progress = 0;
            this.close();
          }
        }, 100);
      }
    },
    clearProgress() {
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
    }
  },
  mounted() {
    if (this.visible) this.startProgress();
  },
  beforeUnmount() {
    this.clearProgress();
  }
}
</script>

<style scoped>
.snackbar {
  position: fixed;
  left: 50%;
  bottom: 32px;
  transform: translateX(-50%);
  min-width: 240px;
  max-width: 400px;
  padding: 16px 32px 16px 16px;
  border-radius: 10px;
  color: #fff;
  font-weight: 500;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  z-index: 2000;
  display: flex;
  align-items: center;
  gap: 14px;
  background: #2196f3;
  flex-direction: row;
  overflow: hidden;
}
.snackbar.info { background: #2196f3; }
.snackbar.success { background: #4caf50; }
.snackbar.error { background: #f44336; }
.snackbar.warning { background: #ff9800; }
.snackbar__icon {
  display: flex;
  align-items: center;
  justify-content: center;
}
.snackbar__message {
  flex: 1;
}
.snackbar__close {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
  margin-left: 8px;
}
.snackbar__progress {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 4px;
  border-radius: 0 0 10px 10px;
  background: red;
  opacity: 0.7;
  transition: width 0.1s linear;
}
.snackbar-fade-enter-active, .snackbar-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.snackbar-fade-enter-from, .snackbar-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style> 