<script>
import { LanguageService } from '@/core/services/language.service';
import { UxService } from '@/core/services/ux.service.js';

export default {
  name: "language-switcher",
  data() {
    return {
      languages: LanguageService.getAvailableLanguages(),
      currentLanguage: LanguageService.getCurrentLanguage()
    }
  },
  methods: {
    setLanguage(lang) {
      if (LanguageService.setLanguage(lang)) {
        this.currentLanguage = lang;
        UxService.showSnackbar({ message: `Idioma cambiado a ${lang.toUpperCase()}`, type: 'success' });
      }
    }
  }
}
</script>

<template>
  <div class="custom-language-switcher">
    <button
      v-for="lang in languages"
      :key="lang"
      :class="['lang-btn', { active: lang === currentLanguage }]"
      @click="setLanguage(lang)"
      :aria-pressed="lang === currentLanguage"
    >
      {{ lang }}
    </button>
  </div>
</template>

<style scoped>
.custom-language-switcher {
  display: flex;
  gap: 8px;
  background: rgba(255,255,255,0.7);
  border-radius: 8px;
  padding: 2px 10px;
  margin-right: 12px;
  margin-top: 2px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
  align-items: center;
}
.lang-btn {
  border: none;
  outline: none;
  background: transparent;
  color: var(--primary, #4f8cff);
  font-weight: 500;
  padding: 4px 16px;
  border-radius: 6px;
  cursor: pointer;
  text-transform: uppercase;
  font-size: 1rem;
  transition: background 0.2s, color 0.2s;
}
.lang-btn.active {
  background: var(--primary, #4f8cff);
  color: #fff;
}
.lang-btn:not(.active):hover {
  background: rgba(79, 140, 255, 0.12);
  color: var(--primary-dark, #3a3d5c);
}
</style>
