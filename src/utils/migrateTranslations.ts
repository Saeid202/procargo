import { TranslationService } from '../services/translationService';
import enTranslations from '../locales/en/translation.json';
import faTranslations from '../locales/fa/translation.json';

// Helper function to flatten nested objects
function flattenObject(obj: any, prefix = ''): Record<string, string> {
  const flattened: Record<string, string> = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(flattened, flattenObject(obj[key], newKey));
      } else {
        flattened[newKey] = String(obj[key]);
      }
    }
  }
  
  return flattened;
}

// Helper function to assign translations to groups based on key patterns
function getGroupIdForKey(key: string): string {
  if (key.startsWith('login_') || key.startsWith('sign_up') || key.startsWith('auth_')) {
    return '00000000-0000-0000-0000-000000000001'; // General
  }
  if (key.startsWith('footer_') || key.startsWith('nav_') || key.includes('navigation')) {
    return '00000000-0000-0000-0000-000000000002'; // Navigation
  }
  if (key.includes('form') || key.includes('input') || key.includes('validation') || key.includes('required')) {
    return '00000000-0000-0000-0000-000000000003'; // Forms
  }
  if (key.includes('dashboard') || key.includes('overview') || key.includes('stats')) {
    return '00000000-0000-0000-0000-000000000004'; // Dashboard
  }
  if (key.includes('legal') || key.includes('case') || key.includes('lawyer') || key.includes('plaintiff') || key.includes('defendant')) {
    return '00000000-0000-0000-0000-000000000005'; // Legal
  }
  if (key.includes('order') || key.includes('supplier') || key.includes('logistics') || key.includes('shipping')) {
    return '00000000-0000-0000-0000-000000000006'; // Orders
  }
  
  return '00000000-0000-0000-0000-000000000001'; // Default to General
}

export async function migrateTranslationsToDatabase(): Promise<{
  success: boolean;
  imported: { en: number; fa: number };
  errors: string[];
}> {
  const errors: string[] = [];
  let importedEn = 0;
  let importedFa = 0;

  try {
    // Flatten the nested translation objects
    const flattenedEn = flattenObject(enTranslations);
    const flattenedFa = flattenObject(faTranslations);

    // Import English translations
    console.log('Importing English translations...');
    const enResult = await TranslationService.importTranslations('en', flattenedEn);
    if (enResult.errors.length > 0) {
      errors.push(...enResult.errors);
    } else {
      importedEn = enResult.imported;
    }

    // Import Persian translations
    console.log('Importing Persian translations...');
    const faResult = await TranslationService.importTranslations('fa', flattenedFa);
    if (faResult.errors.length > 0) {
      errors.push(...faResult.errors);
    } else {
      importedFa = faResult.imported;
    }

    // Update group assignments for better organization
    console.log('Updating group assignments...');
    await updateGroupAssignments();

    console.log(`Migration completed: ${importedEn} EN, ${importedFa} FA translations imported`);
    
    return {
      success: errors.length === 0,
      imported: { en: importedEn, fa: importedFa },
      errors
    };
  } catch (error: any) {
    errors.push(`Migration failed: ${error.message}`);
    return {
      success: false,
      imported: { en: importedEn, fa: importedFa },
      errors
    };
  }
}

async function updateGroupAssignments(): Promise<void> {
  try {
    // Get all translations
    const { translations, error } = await TranslationService.getTranslations();
    if (error || !translations) {
      console.error('Failed to fetch translations for group assignment:', error);
      return;
    }

    // Update group assignments
    for (const translation of translations) {
      const groupId = getGroupIdForKey(translation.key);
      if (translation.group_id !== groupId) {
        await TranslationService.updateTranslation(translation.id, { group_id: groupId });
      }
    }
  } catch (error) {
    console.error('Failed to update group assignments:', error);
  }
}

// Function to run migration (call this once to migrate existing translations)
export async function runMigration(): Promise<any> {
  console.log('Starting translation migration...');
  const result = await migrateTranslationsToDatabase();
  
  if (result.success) {
    console.log('✅ Migration completed successfully!');
    console.log(`📊 Imported ${result.imported.en} English and ${result.imported.fa} Persian translations`);
    return result;
  } else {
    console.error('❌ Migration failed with errors:');
    result.errors.forEach(error => console.error(`  - ${error}`));
    return result;
  }
}
