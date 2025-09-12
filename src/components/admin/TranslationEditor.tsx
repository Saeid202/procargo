import React, { useState, useEffect } from 'react';
import { Translation, TranslationGroup } from '../../services/translationService';
import { useTranslation } from 'react-i18next';

interface TranslationEditorProps {
  translation: Translation | null;
  groups: TranslationGroup[];
  onSave: (key: string, language: string, value: string, group_id?: string) => void;
  onCancel: () => void;
}

const TranslationEditor: React.FC<TranslationEditorProps> = ({
  translation,
  groups,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    key: '',
    language: 'en',
    value: '',
    group_id: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const {t} = useTranslation();

  useEffect(() => {
    if (translation) {
      setFormData({
        key: translation.key,
        language: translation.language,
        value: translation.value,
        group_id: translation.group_id || ''
      });
    } else {
      setFormData({
        key: '',
        language: 'en',
        value: '',
        group_id: ''
      });
    }
    setErrors({});
  }, [translation]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.key.trim()) {
      newErrors.key = t('key_is_required');
    }

    if (!formData.language.trim()) {
      newErrors.language = t('language_is_required');
    }

    if (!formData.value.trim()) {
      newErrors.value = t('value_is_required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSave(
      formData.key,
      formData.language,
      formData.value,
      formData.group_id || undefined
    );
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          {translation ? t('edit_translation') : t('create_new_translation')}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="key" className="block text-sm font-medium text-gray-700">
                {t('translation_key')}
              </label>
              <input
                type="text"
                id="key"
                value={formData.key}
                onChange={(e) => handleInputChange('key', e.target.value)}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.key ? 'border-red-300' : ''
                }`}
                placeholder={t('e_g_welcome_message')}
                disabled={!!translation} // Don't allow editing key for existing translations
              />
              {errors.key && (
                <p className="mt-1 text-sm text-red-600">{errors.key}</p>
              )}
            </div>

            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                {t('language')}
              </label>
              <select
                id="language"
                value={formData.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.language ? 'border-red-300' : ''
                }`}
                disabled={!!translation} // Don't allow editing language for existing translations
              >
                <option value="en">English</option>
                <option value="fa">فارسی (Persian)</option>
              </select>
              {errors.language && (
                <p className="mt-1 text-sm text-red-600">{errors.language}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="group_id" className="block text-sm font-medium text-gray-700">
              {t('translation_group_optional')}
            </label>
            <select
              id="group_id"
              value={formData.group_id}
              onChange={(e) => handleInputChange('group_id', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">{t('no_group')}</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="value" className="block text-sm font-medium text-gray-700">
              {t('translation_value')}
            </label>
            <textarea
              id="value"
              rows={4}
              value={formData.value}
              onChange={(e) => handleInputChange('value', e.target.value)}
              className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.value ? 'border-red-300' : ''
              }`}
              placeholder={t('enter_the_translation_text')}
            />
            {errors.value && (
              <p className="mt-1 text-sm text-red-600">{errors.value}</p>
            )}
          </div>

          {/* Preview */}
          {formData.value && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">{t('preview')}:</h4>
              <div className="text-sm text-gray-900 whitespace-pre-wrap">
                {formData.value}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="bg-blue-600 ms-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {translation ? t('update_translation') : t('create_translation')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TranslationEditor;
