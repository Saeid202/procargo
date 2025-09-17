import React, { useState, useMemo } from 'react';
import { Translation } from '../../services/translationService';
import { useTranslation } from 'react-i18next';

interface TranslationListProps {
  translations: Translation[];
  loading: boolean;
  onEdit: (translation: Translation) => void;
  onDelete: (id: string) => void;
  itemsPerPage?: number;
}

const TranslationList: React.FC<TranslationListProps> = ({
  translations,
  loading,
  onEdit,
  onDelete,
  itemsPerPage = 10
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const { t } = useTranslation();

  // Calculate pagination
  const totalPages = Math.ceil(translations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const paginatedTranslations = useMemo(() => {
    return translations.slice(startIndex, endIndex);
  }, [translations, startIndex, endIndex]);

  // Reset to first page when translations change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [translations.length]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="animate-pulse">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (translations.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6 text-center">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 8h6m-6 4h6m-6 4h6" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No translations found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new translation.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('key')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('language')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('value')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('actions')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('group')}
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('updated')}
                </th> */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedTranslations.map((translation) => (
                <tr key={translation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {`${translation.key?.length > 20 ? translation.key?.slice(0, 20) + '...' : translation.key}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {translation.language.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={translation.value}>
                      {translation.value}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => onEdit(translation)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {t('edit')}
                      </button>
                      <button
                        onClick={() => onDelete(translation.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        {t('delete')}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {(translation as any).translation_groups?.name || 'No Group'}
                    </div>
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(translation.updated_at).toLocaleDateString()}
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="sm:hidden space-y-4">
          {paginatedTranslations.map((translation) => (
            <div key={translation.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {translation.key}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {translation.language.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(translation.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2 ml-2">
                  <button
                    onClick={() => onEdit(translation)}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    {t('edit')}
                  </button>
                  <button
                    onClick={() => onDelete(translation.id)}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    {t('delete')}
                  </button>
                </div>
              </div>

              <div className="mb-2">
                <p className="text-sm text-gray-900 break-words">
                  {translation.value}
                </p>
              </div>

              <div className="text-xs text-gray-500">
                <span className="font-medium">{t('group')}:</span> {(translation as any).translation_groups?.name || 'No Group'}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-white px-3 py-3 sm:px-4 sm:py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('previous')}
              </button>
              <span className="flex items-center text-xs text-gray-500">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('next')}
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  {t('showing')} <span className="font-medium">{startIndex + 1}</span> {t('to')} <span className="font-medium">{Math.min(endIndex, translations.length)}</span> {t('of')} <span className="font-medium">{translations.length}</span> {t('results')}
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">{t('previous')}</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current page
                    const shouldShow = page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1);

                    if (!shouldShow) {
                      // Show ellipsis for gaps
                      if (page === 2 && currentPage > 4) {
                        return (
                          <span key={`ellipsis-${page}`} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                            ...
                          </span>
                        );
                      }
                      if (page === totalPages - 1 && currentPage < totalPages - 3) {
                        return (
                          <span key={`ellipsis-${page}`} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">{t('next')}</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationList;
