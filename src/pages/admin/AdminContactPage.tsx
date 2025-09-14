import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ContactService, ContactMessageWithId } from '../../services/contactService';
import { toast } from 'react-hot-toast';
import {
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  ClockIcon,
  EyeIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const AdminContactPage: React.FC = () => {
  const { t } = useTranslation();
  const [contactMessages, setContactMessages] = useState<ContactMessageWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageWithId | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadContactMessages();
  }, []);

  const loadContactMessages = async () => {
    setLoading(true);
    const { contactMessages: data, error } = await ContactService.getContactMessages();
    if (error) {
      toast.error(error);
    } else {
      setContactMessages(data || []);
    }
    setLoading(false);
  };

  const handleViewMessage = (message: ContactMessageWithId) => {
    setSelectedMessage(message);
  };

  const handleCloseModal = () => {
    setSelectedMessage(null);
  };

  // Calculate pagination
  const totalPages = Math.ceil(contactMessages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMessages = contactMessages.slice(startIndex, endIndex);

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

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-8">
        <div className="">
          {contactMessages.length === 0 ? (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6 text-center">
                <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {t('no_contact_messages')}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {t('no_contact_messages_description')}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg">
              <div className="px-3 py-4 sm:px-4 sm:p-6">
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('name')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('email')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('subject')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('date')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedMessages.map((message) => (
                        <tr key={message.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {message.full_name}
                            </div>
                            {message.company && (
                              <div className="text-sm text-gray-500">
                                <BuildingOfficeIcon className="inline h-4 w-4 mr-1" />
                                {message.company}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <EnvelopeIcon className="inline h-4 w-4 mr-1" />
                              {message.email}
                            </div>
                            {message.phone && (
                              <div className="text-sm text-gray-500">
                                <PhoneIcon className="inline h-4 w-4 mr-1" />
                                {message.phone}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {message.subject}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              <ClockIcon className="inline h-4 w-4 mr-1" />
                              {new Date(message.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleViewMessage(message)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {paginatedMessages.map((message) => (
                    <div key={message.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {message.full_name}
                          </h3>
                          {message.company && (
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              <BuildingOfficeIcon className="inline h-3 w-3 mr-1" />
                              {message.company}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleViewMessage(message)}
                          className="ml-2 flex-shrink-0 p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-full transition-colors"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-2 text-xs text-gray-600">
                        <div className="flex items-center">
                          <EnvelopeIcon className="h-3 w-3 mr-2 flex-shrink-0" />
                          <span className="truncate">{message.email}</span>
                        </div>
                        {message.phone && (
                          <div className="flex items-center">
                            <PhoneIcon className="h-3 w-3 mr-2 flex-shrink-0" />
                            <span>{message.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <ClockIcon className="h-3 w-3 mr-2 flex-shrink-0" />
                          <span>{new Date(message.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-900 font-medium line-clamp-2">
                          {message.subject}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-white px-3 py-3 flex items-center justify-between border-t border-gray-200 sm:px-4 lg:px-6">
                    {/* Mobile Pagination */}
                    <div className="flex-1 flex justify-between lg:hidden">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handlePrevious}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {t('previous')}
                        </button>
                        <span className="text-xs text-gray-500">
                          {currentPage} / {totalPages}
                        </span>
                        <button
                          onClick={handleNext}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {t('next')}
                        </button>
                      </div>
                      <div className="text-xs text-gray-500">
                        {startIndex + 1}-{Math.min(endIndex, contactMessages.length)} of {contactMessages.length}
                      </div>
                    </div>
                    
                    {/* Desktop Pagination */}
                    <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          {t('showing')} <span className="font-medium">{startIndex + 1}</span> {t('to')}{' '}
                          <span className="font-medium">{Math.min(endIndex, contactMessages.length)}</span>{' '}
                          {t('of')} <span className="font-medium">{contactMessages.length}</span> {t('results')}
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          <button
                            onClick={handlePrevious}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {t('previous')}
                          </button>
                          {[...Array(totalPages)].map((_, i) => (
                            <button
                              key={i + 1}
                              onClick={() => handlePageChange(i + 1)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === i + 1
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {i + 1}
                            </button>
                          ))}
                          <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {t('next')}
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Message Detail Modal */}
          {selectedMessage && (
            <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-300">
              <div className="relative w-full max-w-4xl bg-white rounded-lg sm:rounded-2xl shadow-2xl transform animate-in zoom-in-95 duration-300 max-h-[95vh] overflow-hidden">
                {/* Header with gradient background */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-lg sm:rounded-t-2xl px-4 py-4 sm:px-8 sm:py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      <div className="bg-white bg-opacity-20 p-2 sm:p-3 rounded-full flex-shrink-0">
                        <EnvelopeIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-white truncate">
                          {t('message_details')}
                        </h3>
                        <p className="text-blue-100 text-xs sm:text-sm">
                          {new Date(selectedMessage.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleCloseModal}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-200 flex-shrink-0 ml-2"
                    >
                      <span className="sr-only">{t('close' as any)}</span>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4 sm:p-8 overflow-y-auto max-h-[calc(95vh-350px)]">
                  {/* Contact Information Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    {/* Name and Company */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200">
                      <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                        <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                          <svg className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{t('name')}</h4>
                          <p className="text-gray-600 text-sm truncate">{selectedMessage.full_name}</p>
                        </div>
                      </div>
                      {selectedMessage.company && (
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <BuildingOfficeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-gray-700 text-xs sm:text-sm">{t('company' as any)}</h4>
                            <p className="text-gray-600 text-sm truncate">{selectedMessage.company}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Email and Phone */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-green-200">
                      <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                        <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                          <EnvelopeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{t('email')}</h4>
                          <p className="text-gray-600 text-sm break-all">{selectedMessage.email}</p>
                        </div>
                      </div>
                      {selectedMessage.phone && (
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <PhoneIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-gray-700 text-xs sm:text-sm">{t('phone')}</h4>
                            <p className="text-gray-600 text-sm">{selectedMessage.phone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="mb-6 sm:mb-8">
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-purple-200">
                      <div className="flex items-center space-x-2 sm:space-x-3 mb-3">
                        <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
                          <svg className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{t('subject')}</h4>
                      </div>
                      <p className="text-gray-700 text-base sm:text-lg font-medium">{selectedMessage.subject}</p>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="mb-6 sm:mb-8">
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-indigo-200">
                      <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                        <div className="bg-indigo-100 p-2 rounded-lg flex-shrink-0">
                          <svg className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{t('message')}</h4>
                      </div>
                      <div className="bg-white rounded-lg p-3 sm:p-4 border border-indigo-200">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">{selectedMessage.message}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                      onClick={() => window.open(`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`, '_blank')}
                      className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 sm:px-6 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base"
                    >
                      <EnvelopeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="truncate">{t('reply_via_email' as any)}</span>
                    </button>
                    {selectedMessage.phone && (
                      <button
                        onClick={() => window.open(`tel:${selectedMessage.phone}`, '_self')}
                        className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 sm:px-6 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base"
                      >
                        <PhoneIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>{t('call' as any)}</span>
                      </button>
                    )}
                    <button
                      onClick={handleCloseModal}
                      className="flex items-center justify-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 sm:px-6 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base sm:ml-auto"
                    >
                      <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>{t('close' as any)}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminContactPage;
