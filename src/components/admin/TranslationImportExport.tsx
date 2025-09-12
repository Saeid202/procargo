import React, { useState } from 'react';
import { TranslationService, TranslationGroup } from '../../services/translationService';
import { toast } from 'react-hot-toast';

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
    <div className="space-y-8">
      {/* Import Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Import Translations</h3>
          <p className="text-sm text-gray-600 mb-6">
            Import translations from a JSON file. The file should contain key-value pairs.
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="import-language" className="block text-sm font-medium text-gray-700">
                  Language
                </label>
                <select
                  id="import-language"
                  value={importLanguage}
                  onChange={(e) => setImportLanguage(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="en">English</option>
                  <option value="fa">فارسی (Persian)</option>
                </select>
              </div>

              <div>
                <label htmlFor="import-group" className="block text-sm font-medium text-gray-700">
                  Group (Optional)
                </label>
                <select
                  id="import-group"
                  value={importGroupId}
                  onChange={(e) => setImportGroupId(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">No Group</option>
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
                JSON File
              </label>
              <input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleImport}
                disabled={!importFile || importing}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? 'Importing...' : 'Import Translations'}
              </button>
              <button
                onClick={downloadTemplate}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
              >
                Download Template
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Export Translations</h3>
          <p className="text-sm text-gray-600 mb-6">
            Export translations to a JSON file for backup or migration purposes.
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="export-language" className="block text-sm font-medium text-gray-700">
                Language
              </label>
              <select
                id="export-language"
                value={exportLanguage}
                onChange={(e) => setExportLanguage(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="en">English</option>
                <option value="fa">فارسی (Persian)</option>
              </select>
            </div>

            <button
              onClick={handleExport}
              disabled={exporting}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? 'Exporting...' : 'Export Translations'}
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Import/Export Instructions</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Import files must be valid JSON format with key-value pairs</li>
          <li>• Existing translations with the same key and language will be updated</li>
          <li>• Export creates a clean JSON file with all translations for the selected language</li>
          <li>• Use the template file as a reference for the correct format</li>
        </ul>
      </div>
    </div>
  );
};

export default TranslationImportExport;
