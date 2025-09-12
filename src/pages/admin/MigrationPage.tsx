import React, { useState } from 'react';
import { runMigration } from '../../utils/migrateTranslations';
import { toast } from 'react-hot-toast';

const MigrationPage: React.FC = () => {
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean;
    imported: { en: number; fa: number };
    errors: string[];
  } | null>(null);

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Translation Migration</h1>
          <p className="mt-2 text-gray-600">Migrate existing translations from JSON files to the database</p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Migration Overview</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">What this migration does:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Imports all translations from <code>src/locales/en/translation.json</code></li>
                  <li>• Imports all translations from <code>src/locales/fa/translation.json</code></li>
                  <li>• Flattens nested translation objects (e.g., <code>stats.shipments</code>)</li>
                  <li>• Assigns translations to appropriate groups for better organization</li>
                  <li>• Enables dynamic translation management through the admin panel</li>
                </ul>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Before You Start</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-yellow-900 mb-2">Important Notes:</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Make sure you have admin privileges in your Supabase database</li>
                  <li>• The migration will create new translations or update existing ones</li>
                  <li>• This is a one-time operation - you don't need to run it multiple times</li>
                  <li>• After migration, translations will be managed through the admin panel</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleMigration}
                disabled={migrating}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
              >
                {migrating ? 'Migrating...' : 'Start Migration'}
              </button>
            </div>

            {migrationResult && (
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Migration Results</h3>
                
                <div className={`border rounded-lg p-4 ${
                  migrationResult.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center mb-2">
                    <div className={`w-4 h-4 rounded-full mr-2 ${
                      migrationResult.success ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className={`font-medium ${
                      migrationResult.success ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {migrationResult.success ? 'Migration Successful' : 'Migration Failed'}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-700">
                    <p>English translations imported: <strong>{migrationResult.imported.en}</strong></p>
                    <p>Persian translations imported: <strong>{migrationResult.imported.fa}</strong></p>
                  </div>

                  {migrationResult.errors.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-red-900 mb-2">Errors:</h4>
                      <ul className="text-sm text-red-800 space-y-1">
                        {migrationResult.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {migrationResult.success && (
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Next Steps:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Go to <a href="/admin/translations" className="text-blue-600 hover:text-blue-800 underline">Translation Management</a> to manage your translations</li>
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
