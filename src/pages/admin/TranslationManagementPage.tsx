import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TranslationService, Translation, TranslationGroup, TranslationFilters } from '../../services/translationService';
import TranslationEditor from '../../components/admin/TranslationEditor';
import TranslationList from '../../components/admin/TranslationList';
import TranslationFiltersComponent from '../../components/admin/TranslationFilters';
import TranslationImportExport from '../../components/admin/TranslationImportExport';
import { toast } from 'react-hot-toast';

const TranslationManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [groups, setGroups] = useState<TranslationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTranslation, setSelectedTranslation] = useState<Translation | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [filters, setFilters] = useState<TranslationFilters>({});
  const [activeTab, setActiveTab] = useState<'list' | 'editor' | 'import-export'>('list');

  useEffect(() => {
    loadTranslations();
    loadGroups();
  }, []);

  useEffect(() => {
    loadTranslations();
  }, [filters]);

  const loadTranslations = async () => {
    setLoading(true);
    const { translations: data, error } = await TranslationService.getTranslations(filters);
    if (error) {
      toast.error(error);
    } else {
      setTranslations(data || []);
    }
    setLoading(false);
  };

  const loadGroups = async () => {
    const { groups: data, error } = await TranslationService.getTranslationGroups();
    if (error) {
      toast.error(error);
    } else {
      setGroups(data || []);
    }
  };

  const handleEditTranslation = (translation: Translation) => {
    setSelectedTranslation(translation);
    setShowEditor(true);
    setActiveTab('editor');
  };

  const handleCreateTranslation = () => {
    setSelectedTranslation(null);
    setShowEditor(true);
    setActiveTab('editor');
  };

  const handleSaveTranslation = async (key: string, language: string, value: string, group_id?: string) => {
    const { translation, error } = await TranslationService.upsertTranslation(key, language, value, group_id);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Translation saved successfully');
      loadTranslations();
      setShowEditor(false);
      setSelectedTranslation(null);
    }
  };

  const handleDeleteTranslation = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this translation?')) {
      const { error } = await TranslationService.deleteTranslation(id);
      if (error) {
        toast.error(error);
      } else {
        toast.success('Translation deleted successfully');
        loadTranslations();
      }
    }
  };

  const handleFiltersChange = (newFilters: TranslationFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('list')}
              className={`py-2 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                activeTab === 'list'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('translations_list')}
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`py-2 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 sm:me-8 sm:ms-8 ${
                activeTab === 'editor'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('translation_editor')}
            </button>
            <button
              onClick={() => setActiveTab('import-export')}
              className={`py-2 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                activeTab === 'import-export'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('import_export')}
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'list' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex-1">
                <TranslationFiltersComponent
                  filters={filters}
                  groups={groups}
                  onFiltersChange={handleFiltersChange}
                />
              </div>
              <button
                onClick={handleCreateTranslation}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full sm:w-auto flex-shrink-0"
              >
                {t('add_new_translation')}
              </button>
            </div>

            <TranslationList
              translations={translations}
              loading={loading}
              onEdit={handleEditTranslation}
              onDelete={handleDeleteTranslation}
            />
          </div>
        )}

        {activeTab === 'editor' && (
          <TranslationEditor
            translation={selectedTranslation}
            groups={groups}
            onSave={handleSaveTranslation}
            onCancel={() => {
              setShowEditor(false);
              setSelectedTranslation(null);
            }}
          />
        )}

        {activeTab === 'import-export' && (
          <TranslationImportExport
            onImportComplete={loadTranslations}
            groups={groups}
          />
        )}
      </div>
    </div>
  );
};

export default TranslationManagementPage;
