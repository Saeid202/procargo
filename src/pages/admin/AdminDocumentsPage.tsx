import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BookOpenIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  UserGroupIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
  TruckIcon,
  CogIcon,
  ArrowPathIcon,
  QuestionMarkCircleIcon,
  PhotoIcon,
  PencilSquareIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  LightBulbIcon,
  CommandLineIcon,
  ShieldCheckIcon,
  ClockIcon,
  StarIcon,
  AcademicCapIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

interface DocumentSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
  subsections: DocumentSubsection[];
  color: string;
  priority: 'high' | 'medium' | 'low';
}

interface DocumentSubsection {
  id: string;
  title: string;
  content: string;
  steps?: string[];
  tips?: string[];
  warnings?: string[];
  examples?: string[];
}

const AdminDocumentsPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [selectedSubsection, setSelectedSubsection] = useState<string | null>(null);

  const documentSections: DocumentSection[] = [
    {
      id: 'overview',
      title: t('admin_dashboard_overview'),
      icon: BookOpenIcon,
      description: t('admin_dashboard_overview_description'),
      color: 'text-blue-600',
      priority: 'high',
      subsections: [
        {
          id: 'getting-started',
          title: t('getting_started'),
          content: t('getting_started_content'),
          steps: [
            t('step_1_login'),
            t('step_2_navigate'),
            t('step_3_explore'),
            t('step_4_customize')
          ],
          tips: [
            t('tip_bookmark'),
            t('tip_notifications'),
            t('tip_shortcuts')
          ]
        },
        {
          id: 'dashboard-navigation',
          title: t('dashboard_navigation'),
          content: t('dashboard_navigation_content'),
          steps: [
            t('nav_step_1'),
            t('nav_step_2'),
            t('nav_step_3')
          ]
        }
      ]
    },
    {
      id: 'user-management',
      title: t('users_management'),
      icon: UserGroupIcon,
      description: t('user_management_description'),
      color: 'text-green-600',
      priority: 'high',
      subsections: [
        {
          id: 'user-overview',
          title: t('user_overview'),
          content: t('user_overview_content'),
          steps: [
            t('user_step_1'),
            t('user_step_2'),
            t('user_step_3'),
            t('user_step_4')
          ],
          tips: [
            t('user_tip_1'),
            t('user_tip_2')
          ],
          warnings: [
            t('user_warning_1')
          ]
        },
        {
          id: 'user-roles',
          title: t('user_roles'),
          content: t('user_roles_content'),
          examples: [
            t('role_admin_example'),
            t('role_agent_example'),
            t('role_lawyer_example'),
            t('role_user_example')
          ]
        }
      ]
    },
    {
      id: 'content-management',
      title: t('content_management'),
      icon: DocumentTextIcon,
      description: t('content_management_description'),
      color: 'text-purple-600',
      priority: 'high',
      subsections: [
        {
          id: 'pages-management',
          title: t('pages_management'),
          content: t('pages_management_content'),
          steps: [
            t('page_step_1'),
            t('page_step_2'),
            t('page_step_3'),
            t('page_step_4')
          ],
          tips: [
            t('page_tip_1'),
            t('page_tip_2')
          ]
        },
        {
          id: 'media-library',
          title: t('media_library'),
          content: t('media_library_content'),
          steps: [
            t('media_step_1'),
            t('media_step_2'),
            t('media_step_3')
          ]
        }
      ]
    },
    {
      id: 'translations',
      title: t('translations'),
      icon: GlobeAltIcon,
      description: t('translations_description'),
      color: 'text-indigo-600',
      priority: 'medium',
      subsections: [
        {
          id: 'translation-basics',
          title: t('translation_basics'),
          content: t('translation_basics_content'),
          steps: [
            t('trans_step_1'),
            t('trans_step_2'),
            t('trans_step_3')
          ]
        },
        {
          id: 'translation-migration',
          title: t('translation_migration'),
          content: t('translation_migration_content'),
          warnings: [
            t('trans_warning_1')
          ]
        }
      ]
    },
    {
      id: 'support-management',
      title: t('support_management'),
      icon: ChatBubbleLeftRightIcon,
      description: t('support_management_description'),
      color: 'text-orange-600',
      priority: 'high',
      subsections: [
        {
          id: 'ticket-management',
          title: t('ticket_management'),
          content: t('ticket_management_content'),
          steps: [
            t('ticket_step_1'),
            t('ticket_step_2'),
            t('ticket_step_3'),
            t('ticket_step_4')
          ],
          tips: [
            t('ticket_tip_1'),
            t('ticket_tip_2')
          ]
        }
      ]
    },
    {
      id: 'quotation-management',
      title: t('quotation_management'),
      icon: DocumentTextIcon,
      description: t('quotation_management_description'),
      color: 'text-blue-600',
      priority: 'medium',
      subsections: [
        {
          id: 'quotation-process',
          title: t('quotation_process'),
          content: t('quotation_process_content'),
          steps: [
            t('quote_step_1'),
            t('quote_step_2'),
            t('quote_step_3')
          ]
        }
      ]
    },
    {
      id: 'orders-management',
      title: t('orders_management'),
      icon: TruckIcon,
      description: t('orders_management_description'),
      color: 'text-green-600',
      priority: 'high',
      subsections: [
        {
          id: 'order-tracking',
          title: t('order_tracking'),
          content: t('order_tracking_content'),
          steps: [
            t('order_step_1'),
            t('order_step_2'),
            t('order_step_3')
          ]
        }
      ]
    },
    {
      id: 'system-settings',
      title: t('system_settings'),
      icon: CogIcon,
      description: t('system_settings_description'),
      color: 'text-gray-600',
      priority: 'medium',
      subsections: [
        {
          id: 'general-settings',
          title: t('general_settings'),
          content: t('general_settings_content'),
          warnings: [
            t('settings_warning_1')
          ]
        }
      ]
    }
  ];

  const filteredSections = documentSections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.subsections.some(sub => 
      sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
    setSelectedSubsection(null);
  };

  const selectSubsection = (subsectionId: string) => {
    setSelectedSubsection(subsectionId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return ExclamationTriangleIcon;
      case 'medium': return ClockIcon;
      case 'low': return CheckCircleIcon;
      default: return InformationCircleIcon;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('admin_documentation')}</h1>
            <p className="text-blue-100 text-lg">{t('admin_documentation_subtitle')}</p>
          </div>
          <div className="hidden md:block">
            <AcademicCapIcon className="h-16 w-16 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('search_documentation')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Quick Start Guide */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center mb-4">
          <RocketLaunchIcon className="h-6 w-6 text-green-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">{t('quick_start_guide')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center p-4 bg-blue-50 rounded-lg">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">1</div>
            <div>
              <h3 className="font-medium text-gray-900">{t('step_1_title')}</h3>
              <p className="text-sm text-gray-600">{t('step_1_description')}</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-green-50 rounded-lg">
            <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">2</div>
            <div>
              <h3 className="font-medium text-gray-900">{t('step_2_title')}</h3>
              <p className="text-sm text-gray-600">{t('step_2_description')}</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-purple-50 rounded-lg">
            <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">3</div>
            <div>
              <h3 className="font-medium text-gray-900">{t('step_3_title')}</h3>
              <p className="text-sm text-gray-600">{t('step_3_description')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Section List */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('documentation_sections')}</h3>
            <div className="space-y-2">
              {filteredSections.map((section) => {
                const PriorityIcon = getPriorityIcon(section.priority);
                const SectionIcon = section.icon;
                const isExpanded = expandedSection === section.id;
                
                return (
                  <div key={section.id} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <SectionIcon className={`h-5 w-5 mr-3 ${section.color}`} />
                        <div>
                          <div className="font-medium text-gray-900">{section.title}</div>
                          <div className="text-sm text-gray-500">{section.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isExpanded ? (
                          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className="border-t border-gray-200 bg-gray-50">
                        {section.subsections.map((subsection) => (
                          <button
                            key={subsection.id}
                            onClick={() => selectSubsection(subsection.id)}
                            className={`w-full text-left p-3 hover:bg-gray-100 transition-colors ${
                              selectedSubsection === subsection.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                            }`}
                          >
                            <div className="font-medium text-gray-900">{subsection.title}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-2">
          {selectedSubsection ? (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              {(() => {
                const section = filteredSections.find(s => s.subsections.some(sub => sub.id === selectedSubsection));
                const subsection = section?.subsections.find(sub => sub.id === selectedSubsection);
                
                if (!subsection) return null;
                
                return (
                  <div>
                    <div className="flex items-center mb-6">
                      {section?.icon && <section.icon className={`h-6 w-6 mr-3 ${section?.color}`} />}
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{subsection.title}</h2>
                        <p className="text-gray-600">{section?.title}</p>
                      </div>
                    </div>
                    
                    <div className="prose max-w-none">
                      <p className="text-gray-700 mb-6">{subsection.content}</p>
                      
                      {subsection.steps && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <CommandLineIcon className="h-5 w-5 mr-2 text-blue-600" />
                            {t('step_by_step_guide')}
                          </h3>
                          <ol className="space-y-3">
                            {subsection.steps.map((step, index) => (
                              <li key={index} className="flex items-start">
                                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                                  {index + 1}
                                </span>
                                <span className="text-gray-700">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                      
                      {subsection.tips && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <LightBulbIcon className="h-5 w-5 mr-2 text-yellow-600" />
                            {t('pro_tips')}
                          </h3>
                          <ul className="space-y-2">
                            {subsection.tips.map((tip, index) => (
                              <li key={index} className="flex items-start">
                                <StarIcon className="h-4 w-4 text-yellow-500 mr-2 mt-1" />
                                <span className="text-gray-700">{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {subsection.warnings && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-600" />
                            {t('important_warnings')}
                          </h3>
                          <ul className="space-y-2">
                            {subsection.warnings.map((warning, index) => (
                              <li key={index} className="flex items-start">
                                <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-2 mt-1" />
                                <span className="text-gray-700">{warning}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {subsection.examples && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <DocumentTextIcon className="h-5 w-5 mr-2 text-green-600" />
                            {t('examples')}
                          </h3>
                          <ul className="space-y-2">
                            {subsection.examples.map((example, index) => (
                              <li key={index} className="flex items-start">
                                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-1" />
                                <span className="text-gray-700">{example}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 text-center">
              <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('select_a_topic')}</h3>
              <p className="text-gray-600">{t('select_topic_description')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <h3 className="font-semibold text-gray-900">{t('need_help')}</h3>
              <p className="text-sm text-gray-600">{t('contact_support_description')}</p>
            </div>
          </div>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            {t('contact_support')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDocumentsPage;