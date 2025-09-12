import { supabase } from '../lib/supabase';

export interface Translation {
  id: string;
  key: string;
  language: string;
  value: string;
  group_id?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface TranslationGroup {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface TranslationFilters {
  language?: string;
  group_id?: string;
  search?: string;
}

export class TranslationService {
  // Get all translations with optional filters
  static async getTranslations(filters: TranslationFilters = {}): Promise<{ translations: Translation[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('translations')
        .select(`
          *,
          translation_groups (
            id,
            name,
            description
          )
        `)
        .order('key', { ascending: true });

      if (filters.language) {
        query = query.eq('language', filters.language);
      }

      if (filters.group_id) {
        query = query.eq('group_id', filters.group_id);
      }

      if (filters.search) {
        query = query.or(`key.ilike.%${filters.search}%,value.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        return { translations: null, error: error.message };
      }

      return { translations: data, error: null };
    } catch (error: any) {
      return { translations: null, error: error.message || 'Failed to fetch translations' };
    }
  }

  // Get translation by key and language
  static async getTranslation(key: string, language: string): Promise<{ translation: Translation | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .eq('key', key)
        .eq('language', language)
        .single();

      if (error) {
        return { translation: null, error: error.message };
      }

      return { translation: data, error: null };
    } catch (error: any) {
      return { translation: null, error: error.message || 'Failed to fetch translation' };
    }
  }

  // Create or update translation
  static async upsertTranslation(
    key: string,
    language: string,
    value: string,
    group_id?: string
  ): Promise<{ translation: Translation | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { translation: null, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('translations')
        .upsert({
          key,
          language,
          value,
          group_id,
          updated_by: user.id,
          created_by: user.id
        }, {
          onConflict: 'key,language'
        })
        .select()
        .single();

      if (error) {
        return { translation: null, error: error.message };
      }

      return { translation: data, error: null };
    } catch (error: any) {
      return { translation: null, error: error.message || 'Failed to save translation' };
    }
  }

  // Update translation
  static async updateTranslation(
    id: string,
    updates: Partial<Pick<Translation, 'value' | 'group_id'>>
  ): Promise<{ translation: Translation | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { translation: null, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('translations')
        .update({
          ...updates,
          updated_by: user.id
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { translation: null, error: error.message };
      }

      return { translation: data, error: null };
    } catch (error: any) {
      return { translation: null, error: error.message || 'Failed to update translation' };
    }
  }

  // Delete translation
  static async deleteTranslation(id: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('translations')
        .delete()
        .eq('id', id);

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Failed to delete translation' };
    }
  }

  // Get all translation groups
  static async getTranslationGroups(): Promise<{ groups: TranslationGroup[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('translation_groups')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        return { groups: null, error: error.message };
      }

      return { groups: data, error: null };
    } catch (error: any) {
      return { groups: null, error: error.message || 'Failed to fetch translation groups' };
    }
  }

  // Create translation group
  static async createTranslationGroup(
    name: string,
    description?: string
  ): Promise<{ group: TranslationGroup | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('translation_groups')
        .insert({
          name,
          description
        })
        .select()
        .single();

      if (error) {
        return { group: null, error: error.message };
      }

      return { group: data, error: null };
    } catch (error: any) {
      return { group: null, error: error.message || 'Failed to create translation group' };
    }
  }

  // Bulk import translations from JSON
  static async importTranslations(
    language: string,
    translations: Record<string, string>,
    group_id?: string
  ): Promise<{ imported: number; errors: string[] }> {
    const errors: string[] = [];
    let imported = 0;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        errors.push('User not authenticated');
        return { imported, errors };
      }

      const translationEntries = Object.entries(translations).map(([key, value]) => ({
        key,
        language,
        value,
        group_id,
        created_by: user.id,
        updated_by: user.id
      }));

      const { error } = await supabase
        .from('translations')
        .upsert(translationEntries, {
          onConflict: 'key,language'
        });

      if (error) {
        errors.push(error.message);
      } else {
        imported = translationEntries.length;
      }
    } catch (error: any) {
      errors.push(error.message || 'Failed to import translations');
    }

    return { imported, errors };
  }

  // Export translations to JSON format
  static async exportTranslations(language: string): Promise<{ translations: Record<string, string> | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('translations')
        .select('key, value')
        .eq('language', language);

      if (error) {
        return { translations: null, error: error.message };
      }

      const translations: Record<string, string> = {};
      data.forEach(item => {
        translations[item.key] = item.value;
      });

      return { translations, error: null };
    } catch (error: any) {
      return { translations: null, error: error.message || 'Failed to export translations' };
    }
  }

  // Check if user has admin role
  static async isAdmin(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      return profile?.role === 'ADMIN';
    } catch {
      return false;
    }
  }
}
