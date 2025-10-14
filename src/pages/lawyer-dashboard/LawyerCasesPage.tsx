import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

import { CaseData, SupabaseService } from '../../services/supabaseService';
import { cn } from '../../utils/cn';
import { useTranslation } from 'react-i18next';


const LawyerCasesPage: React.FC = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState<CaseData[]>([]);

  const { t } = useTranslation();

  const loadCases = async () => {
    const { cases, error } = await SupabaseService.getCases();

    if (error) {
      console.error('Exception loading cases:', error);
    } else {
      setCases(cases || []);
    }

  };

  const toggleCaseDetails = (caseId: string) => {
    const isMobile = window.innerWidth < 1024;
    const caseDetails = document.getElementById(`${caseId}-details${isMobile ? '-mobile' : ''}`);

    if (caseDetails) {
      caseDetails.classList.toggle('hidden');
    }
  };

  useEffect(() => {
    if (user) {
      loadCases();
    }
  }, [user]);



  return (
    <div id="orders" className="tab-content">
      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('subject')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('plaintiff')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('defendant')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('created')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200" id="orderTableBody">
            {
              cases.map((caseData, index) => (
                <>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{caseData.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{caseData.plaintiff_type}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{caseData.defendant_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn("capitalize inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", caseData.status === 'SUBMITTED' ? 'bg-red-100 text-red-800' : caseData.status === 'IN_REVIEW' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800')}>
                        {caseData.status?.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{caseData.created_at ? new Date(caseData.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => toggleCaseDetails(`caseData${index}`)}
                        className="text-blue-600 hover:text-blue-900 mr-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <button
                        // onclick="downloadOrder('ORD-001')"
                        className="text-green-600 hover:text-green-900">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                  <tr id={`caseData${index}-details`} className={cn("hidden", caseData.status === 'SUBMITTED' ? 'bg-blue-50' : caseData.status === 'IN_REVIEW' ? 'bg-yellow-50' : 'bg-green-50')}>
                    <td className="px-6 py-4" colSpan={7}>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                              {t('case_information')}
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div><span className="font-medium">{t('plaintiff_type')}:</span> {caseData.plaintiff_type}</div>
                              <div><span className="font-medium">{t('defendant_name')}:</span> {caseData.defendant_name}</div>
                              <div><span className="font-medium">{t('subject')}:</span> {caseData.subject}</div>
                              <div><span className="font-medium">{t('description')}:</span> {caseData.description}</div>
                            </div>
                          </div>

                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                              <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              {t('attachments')}
                            </h4>
                            {
                              caseData?.case_documents?.map((caseDocument, docIndex) => (
                                <div key={docIndex} className="flex gap-3">
                                  <a
                                    href={caseDocument.file_url}
                                    target='_blank'
                                    rel="noreferrer"
                                    className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                    </svg>
                                    {caseDocument.file_name}
                                  </a>
                                </div>
                              ))
                            }
                          </div>

                        </div>

                        <div className="space-y-4">
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                              <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {t('current_status')}
                            </h4>
                            <div className="text-center">
                              <span className={cn("capitalize inline-flex items-center px-3 py-1 rounded-full text-sm font-medium", caseData.status === 'SUBMITTED' ? 'bg-red-100 text-red-800' : caseData.status === 'IN_REVIEW' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800')}>
                                {caseData.status?.replace('-', ' ')}
                              </span>
                              <p className="text-xs text-gray-600 mt-1">{t('waiting_for_response')}</p>
                            </div>
                          </div>

                          {
                            caseData.status === 'COMPLETED' ? (
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                  </svg>
                                  {t('lawyer_notes')}
                                </h4>
                                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                  {t('case_successfully_completed')}
                                </div>
                              </div>
                            ) : (
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                  </svg>
                                  {t('quick_response')}
                                </h4>
                                <form className="space-y-3">
                                  <textarea
                                    placeholder={t('type_your_response')}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                                  ></textarea>
                                  <div className="grid grid-cols-2 gap-2">
                                    <input
                                      type="number"
                                      placeholder={t('price_dollar')}
                                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    />
                                    <input
                                      type="date"
                                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <button type="submit" className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
                                      {t('send_reply')}
                                    </button>
                                    <button
                                      // onclick="updateOrderStatus('ORD-001', 'in-progress')"
                                      type="button" className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm font-medium">
                                      {t('in_progress')}
                                    </button>
                                  </div>
                                </form>
                              </div>
                            )
                          }
                        </div>
                      </div>
                    </td>
                  </tr>
                </>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {
          cases.map((caseData, index) => (
            <div key={index} className="bg-white rounded-lg shadow border border-gray-200">
              {/* Case Card Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{caseData.subject}</h3>
                  <div className="flex gap-2 ml-3">
                    <button
                      onClick={() => toggleCaseDetails(`caseData${index}`)}
                      className="text-blue-600 hover:text-blue-900 p-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button className="text-green-600 hover:text-green-900 p-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('plaintiff')}:</span>
                    <span className="font-medium text-gray-900">{caseData.plaintiff_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('defendant')}:</span>
                    <span className="font-medium text-gray-900">{caseData.defendant_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{t('created')}:</span>
                    <span className="font-medium text-gray-900">{caseData.created_at ? new Date(caseData.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}</span>
                  </div>
                </div>

                <div className="mt-3 flex justify-center">
                  <span className={cn("capitalize inline-flex items-center px-3 py-1 rounded-full text-sm font-medium", caseData.status === 'SUBMITTED' ? 'bg-red-100 text-red-800' : caseData.status === 'IN_REVIEW' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800')}>
                    {caseData.status?.replace('-', ' ')}
                  </span>
                </div>
              </div>

              {/* Case Details (Expandable) */}
              <div id={`caseData${index}-details-mobile`} className={cn("hidden", caseData.status === 'SUBMITTED' ? 'bg-blue-50' : caseData.status === 'IN_REVIEW' ? 'bg-yellow-50' : 'bg-green-50')}>
                <div className="p-4 space-y-4">
                  {/* Case Information */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      {t('case_information')}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium text-gray-700">{t('plaintiff_type')}:</span> <span className="text-gray-600">{caseData.plaintiff_type}</span></div>
                      <div><span className="font-medium text-gray-700">{t('defendant_name')}:</span> <span className="text-gray-600">{caseData.defendant_name}</span></div>
                      <div><span className="font-medium text-gray-700">{t('subject')}:</span> <span className="text-gray-600">{caseData.subject}</span></div>
                      <div><span className="font-medium text-gray-700">{t('description')}:</span> <span className="text-gray-600">{caseData.description}</span></div>
                    </div>
                  </div>

                  {/* Attachments */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      {t('attachments')}
                    </h4>
                    <div className="space-y-2">
                      {
                        caseData?.case_documents?.map((caseDocument, docIndex) => (
                          <a
                            key={docIndex}
                            href={caseDocument.file_url}
                            target='_blank'
                            rel="noreferrer"
                            className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                            {caseDocument.file_name}
                          </a>
                        ))
                      }
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t('current_status')}
                    </h4>
                    <div className="text-center mb-4">
                      <span className={cn("capitalize inline-flex items-center px-3 py-1 rounded-full text-sm font-medium", caseData.status === 'SUBMITTED' ? 'bg-red-100 text-red-800' : caseData.status === 'IN_REVIEW' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800')}>
                        {caseData.status?.replace('-', ' ')}
                      </span>
                      <p className="text-xs text-gray-600 mt-1">{t('waiting_for_response')}</p>
                    </div>

                    {
                      caseData.status === 'COMPLETED' ? (
                        <div>
                          <h5 className="font-semibold text-gray-800 mb-2 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {t('lawyer_notes')}
                          </h5>
                          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            {t('case_successfully_completed')}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {t('quick_response')}
                          </h5>
                          <form className="space-y-3">
                            <textarea
                              placeholder={t('type_your_response')}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                            ></textarea>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="number"
                                placeholder={t('price_dollar')}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              />
                              <input
                                type="date"
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <button type="submit" className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
                                {t('send_reply')}
                              </button>
                              <button
                                type="button"
                                className="w-full px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm font-medium">
                                {t('in_progress')}
                              </button>
                            </div>
                          </form>
                        </div>
                      )
                    }
                  </div>
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default LawyerCasesPage;

