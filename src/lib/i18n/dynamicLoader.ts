import i18n from 'i18next';
import { TranslationService } from '../../services/translationService';

class DynamicTranslationLoader {
  private static instance: DynamicTranslationLoader;
  private loadedLanguages: Set<string> = new Set();
  private loadingPromises: Map<string, Promise<void>> = new Map();

  static getInstance(): DynamicTranslationLoader {
    if (!DynamicTranslationLoader.instance) {
      DynamicTranslationLoader.instance = new DynamicTranslationLoader();
    }
    return DynamicTranslationLoader.instance;
  }

  async loadLanguage(language: string): Promise<void> {
    // If already loaded, return immediately
    if (this.loadedLanguages.has(language)) {
      return;
    }

    // If currently loading, wait for the existing promise
    if (this.loadingPromises.has(language)) {
      return this.loadingPromises.get(language);
    }

    // Start loading
    const loadingPromise = this.loadLanguageFromDatabase(language);
    this.loadingPromises.set(language, loadingPromise);

    try {
      await loadingPromise;
      this.loadedLanguages.add(language);
    } finally {
      this.loadingPromises.delete(language);
    }
  }

  private async loadLanguageFromDatabase(language: string): Promise<void> {
    try {
      const { translations, error } = await TranslationService.getTranslations({
        language
      });

      if (error) {
        console.error(`Failed to load translations for ${language}:`, error);
        return;
      }

      if (translations && translations.length > 0) {
        // Convert translations array to key-value object
        const translationObject: Record<string, string> = {};
        translations.forEach(translation => {
          translationObject[translation.key] = translation.value;
        });

        // Add to i18n resources
        i18n.addResourceBundle(language, 'translation', translationObject, true, true);
        
        console.log(`Loaded ${translations.length} translations for ${language}`);
      }
    } catch (error) {
      console.error(`Error loading translations for ${language}:`, error);
    }
  }

  async reloadLanguage(language: string): Promise<void> {
    this.loadedLanguages.delete(language);
    await this.loadLanguage(language);
  }

  async reloadAllLanguages(): Promise<void> {
    const languages = Array.from(this.loadedLanguages);
    this.loadedLanguages.clear();
    
    await Promise.all(
      languages.map(language => this.loadLanguage(language))
    );
  }

  isLanguageLoaded(language: string): boolean {
    return this.loadedLanguages.has(language);
  }

  getLoadedLanguages(): string[] {
    return Array.from(this.loadedLanguages);
  }
}

export default DynamicTranslationLoader;
