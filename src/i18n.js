import { createI18n } from "vue-i18n";
import { LocalStorageService } from '@/core/services/local-storage.service';
import { I18nLoaderService } from '@/shared/services/i18n-loader.service';
import { LanguageService } from '@/core/services/language.service';

const STORAGE_KEY = 'preferredLanguage';
const DEFAULT_LANGUAGE = 'en';

const i18n = createI18n({
  legacy: false,
  locale: LocalStorageService.getItem(STORAGE_KEY) || DEFAULT_LANGUAGE,
  fallbackLocale: DEFAULT_LANGUAGE,
  globalInjection: true,
  messages: {}
});

// Initialize LanguageService with i18n instance
LanguageService.initialize(i18n);

// Load translations asynchronously
I18nLoaderService.loadAllTranslations(i18n);

export default i18n;
