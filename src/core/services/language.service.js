import { LocalStorageService } from './local-storage.service';

export class LanguageService {
  static STORAGE_KEY = 'preferredLanguage';
  static DEFAULT_LANGUAGE = 'en';
  static AVAILABLE_LANGUAGES = ['en', 'es'];

  static getCurrentLanguage() {
    return LocalStorageService.getItem(this.STORAGE_KEY) || this.DEFAULT_LANGUAGE;
  }

  static setLanguage(language) {
    if (this.AVAILABLE_LANGUAGES.includes(language)) {
      LocalStorageService.setItem(this.STORAGE_KEY, language);
      return true;
    }
    return false;
  }

  static getAvailableLanguages() {
    return this.AVAILABLE_LANGUAGES;
  }
}
