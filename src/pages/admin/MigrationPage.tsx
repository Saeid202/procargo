import React, { useState } from 'react';
import { runMigration } from '../../utils/migrateTranslations';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const MigrationPage: React.FC = () => {
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean;
    imported: { en: number; fa: number };
    errors: string[];
  } | null>(null);

  const {t} = useTranslation();

  const handleMigration = async () => {
    if (window.confirm('This will migrate all existing translations to the database. Continue?')) {
      setMigrating(true);
      setMigrationResult(null);

      try {
        const result = await runMigration();
        setMigrationResult(result as any);

        if ((result as any).success) {
          toast.success('Migration completed successfully!');
        } else {
          toast.error('Migration completed with errors');
        }
      } catch (error: any) {
        toast.error(`Migration failed: ${error.message}`);
        setMigrationResult({
          success: false,
          imported: { en: 0, fa: 0 },
          errors: [error.message]
        });
      } finally {
        setMigrating(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-3 py-4 sm:px-4 sm:py-5 lg:p-6">
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">{t('migration_overview')}</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <h4 className="text-xs sm:text-sm font-medium text-blue-900 mb-2">{t('what_this_migration_does')}:</h4>
                <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                  <li className="break-words">• {t('imports_all_translations_from')} <code className="bg-blue-100 px-1 py-0.5 rounded text-xs">src/locales/en/translation.json</code></li>
                  <li className="break-words">• {t('imports_all_translations_from')} <code className="bg-blue-100 px-1 py-0.5 rounded text-xs">src/locales/fa/translation.json</code></li>
                  <li className="break-words">• {t('flattens_nested_translation_objects')} (e.g., <code className="bg-blue-100 px-1 py-0.5 rounded text-xs">stats.shipments</code>)</li>
                  <li>• {t('assigns_translations_to_appropriate_groups_for_better_organization')}</li>
                  <li>• {t('enables_dynamic_translation_management_through_the_admin_panel')}</li>
                </ul>
              </div>
            </div>

            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">{t('before_you_start')}</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                <h4 className="text-xs sm:text-sm font-medium text-yellow-900 mb-2">{t('important_notes')}:</h4>
                <ul className="text-xs sm:text-sm text-yellow-800 space-y-1">
                  <li>• {t('make_sure_you_have_admin_privileges_in_your_supabase_database')}</li>
                  <li>• {t('the_migration_will_create_new_translations_or_update_existing_ones')}</li>
                  <li>• {t('this_is_a_one_time_operation_you_dont_need_to_run_it_multiple_times')}</li>
                  <li>• {t('after_migration_translations_will_be_managed_through_the_admin_panel')}</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleMigration}
                disabled={migrating}
                className="w-full sm:w-auto bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-lg font-medium transition-colors"
              >
                {migrating ? 'Migrating...' : 'Start Migration'}
              </button>
            </div>

            {migrationResult && (
              <div className="mt-6 sm:mt-8">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Migration Results</h3>
                
                <div className={`border rounded-lg p-3 sm:p-4 ${
                  migrationResult.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center mb-2">
                    <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full mr-2 flex-shrink-0 ${
                      migrationResult.success ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className={`font-medium text-sm sm:text-base ${
                      migrationResult.success ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {migrationResult.success ? 'Migration Successful' : 'Migration Failed'}
                    </span>
                  </div>
                  
                  <div className="text-xs sm:text-sm text-gray-700 space-y-1">
                    <p className="break-words">English translations imported: <strong>{migrationResult.imported.en}</strong></p>
                    <p className="break-words">Persian translations imported: <strong>{migrationResult.imported.fa}</strong></p>
                  </div>

                  {migrationResult.errors.length > 0 && (
                    <div className="mt-3 sm:mt-4">
                      <h4 className="font-medium text-red-900 mb-2 text-sm sm:text-base">Errors:</h4>
                      <ul className="text-xs sm:text-sm text-red-800 space-y-1">
                        {migrationResult.errors.map((error, index) => (
                          <li key={index} className="break-words">• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {migrationResult.success && (
                  <div className="mt-3 sm:mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <h4 className="text-xs sm:text-sm font-medium text-blue-900 mb-2">Next Steps:</h4>
                    <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                      <li className="break-words">• Go to <a href="/admin/translations" className="text-blue-600 hover:text-blue-800 underline">Translation Management</a> to manage your translations</li>
                      <li>• Your application will now load translations dynamically from the database</li>
                      <li>• You can update translations without code changes</li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MigrationPage;
