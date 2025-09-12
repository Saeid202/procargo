import React, { useState } from 'react';
import { TranslationFilters, TranslationGroup } from '../../services/translationService';

interface TranslationFiltersProps {
  filters: TranslationFilters;
  groups: TranslationGroup[];
  onFiltersChange: (filters: TranslationFilters) => void;
}

const TranslationFiltersComponent: React.FC<TranslationFiltersProps> = ({
  filters,
  groups,
  onFiltersChange
}) => {
  const [localFilters, setLocalFilters] = useState<TranslationFilters>(filters);

  const handleFilterChange = (field: keyof TranslationFilters, value: string) => {
    const newFilters = {
      ...localFilters,
      [field]: value || undefined
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: TranslationFilters = {};
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(localFilters).some(value => value !== undefined && value !== '');

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-64">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            id="search"
            value={localFilters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search by key or value..."
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div className="min-w-32">
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
          <select
            id="language"
            value={localFilters.language || ''}
            onChange={(e) => handleFilterChange('language', e.target.value)}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">All Languages</option>
            <option value="en">English</option>
            <option value="fa">فارسی (Persian)</option>
          </select>
        </div>

        <div className="min-w-40">
          <label htmlFor="group" className="block text-sm font-medium text-gray-700 mb-1">
            Group
          </label>
          <select
            id="group"
            value={localFilters.group_id || ''}
            onChange={(e) => handleFilterChange('group_id', e.target.value)}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">All Groups</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          {localFilters.search && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Search: {localFilters.search}
              <button
                onClick={() => handleFilterChange('search', '')}
                className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-500 focus:text-white"
              >
                <span className="sr-only">Remove</span>
                <svg className="w-2 h-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                  <path strokeLinecap="round" strokeWidth="1.5" d="m1 1 6 6m0-6-6 6" />
                </svg>
              </button>
            </span>
          )}
          {localFilters.language && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Language: {localFilters.language.toUpperCase()}
              <button
                onClick={() => handleFilterChange('language', '')}
                className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-500 focus:outline-none focus:bg-green-500 focus:text-white"
              >
                <span className="sr-only">Remove</span>
                <svg className="w-2 h-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                  <path strokeLinecap="round" strokeWidth="1.5" d="m1 1 6 6m0-6-6 6" />
                </svg>
              </button>
            </span>
          )}
          {localFilters.group_id && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Group: {groups.find(g => g.id === localFilters.group_id)?.name || 'Unknown'}
              <button
                onClick={() => handleFilterChange('group_id', '')}
                className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-400 hover:bg-purple-200 hover:text-purple-500 focus:outline-none focus:bg-purple-500 focus:text-white"
              >
                <span className="sr-only">Remove</span>
                <svg className="w-2 h-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                  <path strokeLinecap="round" strokeWidth="1.5" d="m1 1 6 6m0-6-6 6" />
                </svg>
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default TranslationFiltersComponent;
