import en from "./locales/en.json";
import es from "./locales/es.json";
import { createI18n } from "vue-i18n";
import { LocalStorageService } from '@/core/services/local-storage.service';

const STORAGE_KEY = 'preferredLanguage';
const DEFAULT_LANGUAGE = 'en';

const i18n = createI18n({
  legacy: false,
  locale: LocalStorageService.getItem(STORAGE_KEY) || DEFAULT_LANGUAGE,
  fallbackLocale: DEFAULT_LANGUAGE,
  globalInjection: true,
  messages: { en, es }
});

export default i18n;
