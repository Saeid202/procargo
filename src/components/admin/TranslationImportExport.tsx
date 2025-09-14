import React, { useState } from 'react';
import { TranslationService, TranslationGroup } from '../../services/translationService';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface TranslationImportExportProps {
  onImportComplete: () => void;
  groups: TranslationGroup[];
}

const TranslationImportExport: React.FC<TranslationImportExportProps> = ({
  onImportComplete,
  groups
}) => {
  const [importLanguage, setImportLanguage] = useState('en');
  const [importGroupId, setImportGroupId] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [exportLanguage, setExportLanguage] = useState('en');
  const [exporting, setExporting] = useState(false);

  const {t} = useTranslation();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      setImportFile(file);
    } else {
      toast.error('Please select a valid JSON file');
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error('Please select a file to import');
      return;
    }

    setImporting(true);
    try {
      const text = await importFile.text();
      const translations = JSON.parse(text);

      if (typeof translations !== 'object' || translations === null) {
        throw new Error('Invalid JSON format');
      }

      const { imported, errors } = await TranslationService.importTranslations(
        importLanguage,
        translations,
        importGroupId || undefined
      );

      if (errors.length > 0) {
        toast.error(`Import completed with errors: ${errors.join(', ')}`);
      } else {
        toast.success(`Successfully imported ${imported} translations`);
      }

      onImportComplete();
      setImportFile(null);
      (document.getElementById('import-file') as HTMLInputElement).value = '';
    } catch (error: any) {
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const { translations, error } = await TranslationService.exportTranslations(exportLanguage);
      
      if (error) {
        toast.error(`Export failed: ${error}`);
        return;
      }

      if (!translations) {
        toast.error('No translations found to export');
        return;
      }

      // Create and download the file
      const dataStr = JSON.stringify(translations, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `translations_${exportLanguage}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Translations exported successfully');
    } catch (error: any) {
      toast.error(`Export failed: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = {
      "welcome": "Welcome",
      "hero_title": "Bridge Your Cargo",
      "example_key": "Example translation value"
    };

    const dataStr = JSON.stringify(template, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'translation_template.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Import Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('import_translations')}</h3>
          <p className="text-sm text-gray-600 mb-6">
            {t('import_translations_description')}
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="import-language" className="block text-sm font-medium text-gray-700">
                  {t('language')}
                </label>
                <select
                  id="import-language"
                  value={importLanguage}
                  onChange={(e) => setImportLanguage(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="en">English</option>
                  <option value="fa">فارسی (Persian)</option>
                </select>
              </div>

              <div>
                <label htmlFor="import-group" className="block text-sm font-medium text-gray-700">
                  {t('translation_group_optional')}
                </label>
                <select
                  id="import-group"
                  value={importGroupId}
                  onChange={(e) => setImportGroupId(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">{t('no_group')}</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="import-file" className="block text-sm font-medium text-gray-700">
                {t('json_file')}
              </label>
              <input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-0">
              <button
                onClick={handleImport}
                disabled={!importFile || importing}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {importing ? t('importing') : t('import_translations')}
              </button>
              <button
                onClick={downloadTemplate}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 w-full sm:w-auto sm:ms-4"
              >
                {t('download_template')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('export_translations')}</h3>
          <p className="text-sm text-gray-600 mb-6">
            {t('export_translations_description')}
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="export-language" className="block text-sm font-medium text-gray-700">
                {t('language')}
              </label>
              <select
                id="export-language"
                value={exportLanguage}
                onChange={(e) => setExportLanguage(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="en">English</option>
                <option value="fa">فارسی (Persian)</option>
              </select>
            </div>

            <button
              onClick={handleExport}
              disabled={exporting}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {exporting ? t('exporting') : t('export_translations')}
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">{t('import_export_instructions')}</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• {t('import_files_must_be_valid_json_format_with_key_value_pairs')}</li>
          <li>• {t('existing_translations_with_the_same_key_and_language_will_be_updated')}</li>
          <li>• {t('export_creates_a_clean_json_file_with_all_translations_for_the_selected_language')}</li>
          <li>• {t('use_the_template_file_as_a_reference_for_the_correct_format')}</li>
        </ul>
      </div>
    </div>
  );
};

export default TranslationImportExport;
