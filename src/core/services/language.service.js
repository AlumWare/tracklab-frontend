import { LocalStorageService } from './local-storage.service';

const STORAGE_KEY = 'preferredLanguage';
const DEFAULT_LANGUAGE = 'en';
const AVAILABLE_LANGUAGES = ['en', 'es'];

export class LanguageService {
  static STORAGE_KEY = STORAGE_KEY;
  static DEFAULT_LANGUAGE = DEFAULT_LANGUAGE;
  static AVAILABLE_LANGUAGES = AVAILABLE_LANGUAGES;
  static i18n = null;

  static initialize(i18nInstance) {
    this.i18n = i18nInstance;
  }

  static getCurrentLanguage() {
    return LocalStorageService.getItem(this.STORAGE_KEY) || this.DEFAULT_LANGUAGE;
  }

  static setLanguage(language) {
    if (this.AVAILABLE_LANGUAGES.includes(language)) {
      LocalStorageService.setItem(this.STORAGE_KEY, language);
      if (this.i18n) {
        this.i18n.global.locale.value = language;
      }
      return true;
    }
    return false;
  }

  static getAvailableLanguages() {
    return this.AVAILABLE_LANGUAGES;
  }
}
