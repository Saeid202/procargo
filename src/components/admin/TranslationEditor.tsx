import React, { useState, useEffect } from 'react';
import { Translation, TranslationGroup } from '../../services/translationService';

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
      newErrors.key = 'Key is required';
    }

    if (!formData.language.trim()) {
      newErrors.language = 'Language is required';
    }

    if (!formData.value.trim()) {
      newErrors.value = 'Value is required';
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
          {translation ? 'Edit Translation' : 'Create New Translation'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="key" className="block text-sm font-medium text-gray-700">
                Translation Key
              </label>
              <input
                type="text"
                id="key"
                value={formData.key}
                onChange={(e) => handleInputChange('key', e.target.value)}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.key ? 'border-red-300' : ''
                }`}
                placeholder="e.g., welcome_message"
                disabled={!!translation} // Don't allow editing key for existing translations
              />
              {errors.key && (
                <p className="mt-1 text-sm text-red-600">{errors.key}</p>
              )}
            </div>

            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                Language
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
              Translation Group (Optional)
            </label>
            <select
              id="group_id"
              value={formData.group_id}
              onChange={(e) => handleInputChange('group_id', e.target.value)}
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

          <div>
            <label htmlFor="value" className="block text-sm font-medium text-gray-700">
              Translation Value
            </label>
            <textarea
              id="value"
              rows={4}
              value={formData.value}
              onChange={(e) => handleInputChange('value', e.target.value)}
              className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.value ? 'border-red-300' : ''
              }`}
              placeholder="Enter the translation text..."
            />
            {errors.value && (
              <p className="mt-1 text-sm text-red-600">{errors.value}</p>
            )}
          </div>

          {/* Preview */}
          {formData.value && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
              <div className="text-sm text-gray-900 whitespace-pre-wrap">
                {formData.value}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {translation ? 'Update Translation' : 'Create Translation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TranslationEditor;
