/**
 * Service for loading i18n translations from feature modules
 */
export class I18nLoaderService {
  static async loadFeatureTranslations(i18n, locale) {
    try {
    await this.loadDefaultTranslation(i18n, locale)
      // Load shared translations
      await this.loadSharedTranslations(i18n, locale);
      
      // Load feature translations
      await this.loadFeatureTranslation(i18n, 'iam', locale);
      
      // Add more features as needed
      // await this.loadFeatureTranslation(i18n, 'orders', locale)
      // await this.loadFeatureTranslation(i18n, 'home', locale)
      
    } catch (error) {
      console.error('Error loading translations:', error)
    }
  }

  static async loadSharedTranslations(i18n, locale) {
    try {
      const sharedTranslations = await import(`@/shared/locales/${locale}.json`)
      i18n.global.mergeLocaleMessage(locale, sharedTranslations.default)
    } catch (error) {
      console.warn(`Shared translations for ${locale} not found`)
    }
  }

  static async loadFeatureTranslation(i18n, featureName, locale) {
    try {
      const featureTranslations = await import(`@/features/${featureName}/locales/${locale}.json`)
      i18n.global.mergeLocaleMessage(locale, featureTranslations.default)
    } catch (error) {
      console.warn(`Feature translations for ${featureName}/${locale} not found`)
    }
  }

  static async loadDefaultTranslation(i18n, locale){
    try {
        const defaultTranslations = await import(`@/locales/${locale}.json`)
        i18n.global.mergeLocaleMessage(locale, defaultTranslations.default)
      } catch (error) {
        console.warn(`Default translations for ${locale} not found`)
      }
  }

  static async loadAllTranslations(i18n) {
    const locales = ['es', 'en']
    
    for (const locale of locales) {
      await this.loadFeatureTranslations(i18n, locale)
    }
  }
} 