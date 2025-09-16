import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { AIConfigService, AIConfiguration } from '../../services/aiConfigService';
import { toast } from 'react-hot-toast';
import {
  CogIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

const AdminAIPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [configs, setConfigs] = useState<AIConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AIConfiguration | null>(null);
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    systemRole: 'You are an expert Canadian customs compliance analyst with 15+ years of experience in international trade, customs regulations, and HS code classification.',
    analysisDepth: 'detailed' as 'basic' | 'detailed' | 'expert',
    temperature: 0.3,
    maxTokens: 2000,
    customInstructions: '',
    responseFormat: 'json' as 'json' | 'text' | 'structured',
    fallbackBehavior: 'retry' as 'retry' | 'simplify' | 'error'
  });

  const [categoryInstructions, setCategoryInstructions] = useState<Record<string, string>>({
    'Electronics': 'Focus on electronic components, safety certifications (CSA, FCC), and potential ITAR restrictions.',
    'Textiles & Apparel': 'Consider textile quotas, labeling requirements, and country of origin marking.',
    'Machinery & Equipment': 'Check for safety standards, electrical certifications, and potential dual-use restrictions.',
    'Chemicals': 'Emphasize chemical safety data sheets, environmental regulations, and controlled substances.',
    'Food & Beverages': 'Focus on food safety regulations, labeling requirements, and import permits.',
    'Automotive': 'Consider automotive safety standards, emissions requirements, and recall information.',
    'Pharmaceuticals': 'Emphasize Health Canada approvals, controlled substances, and prescription requirements.',
    'Construction Materials': 'Check building codes, safety standards, and environmental impact.',
    'Agricultural Products': 'Consider plant health certificates, organic certifications, and seasonal restrictions.',
    'Other': 'Apply general customs principles and recommend specific research areas.'
  });

  const [focusAreas, setFocusAreas] = useState<string[]>([
    'Canadian customs regulations and procedures',
    'HS code classification accuracy',
    'Tariff optimization opportunities',
    'Documentation requirements',
    'Potential compliance risks',
    'Cost-saving recommendations'
  ]);

  const [validationRules, setValidationRules] = useState<string[]>([
    'HS code must be 6-10 digits',
    'Tariff rate must be between 0-100%',
    'Confidence must be between 0-1',
    'All required fields must be present'
  ]);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    const { configs: data, error } = await AIConfigService.getAllConfigs();
    if (error) {
      toast.error(error);
    } else {
      setConfigs(data);
      const activeConfig = data.find(config => config.isActive);
      setActiveConfigId(activeConfig?.id || null);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    const configData: Omit<AIConfiguration, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.name,
      description: formData.description,
      isActive: false, // New configs are inactive by default
      systemRole: formData.systemRole,
      analysisDepth: formData.analysisDepth,
      temperature: formData.temperature,
      maxTokens: formData.maxTokens,
      categoryInstructions,
      focusAreas,
      customInstructions: formData.customInstructions,
      responseFormat: formData.responseFormat,
      validationRules,
      fallbackBehavior: formData.fallbackBehavior,
      createdBy: user.id
    };

    const result = editingConfig 
      ? await AIConfigService.updateConfig(editingConfig.id, configData)
      : await AIConfigService.createConfig(configData);

    if (result.error) {
      toast.error(result.error || 'An error occurred');
    } else {
      toast.success(editingConfig ? 'AI Configuration updated successfully' : 'AI Configuration created successfully');
      loadConfigs();
      handleCloseModal();
    }
  };

  const handleEdit = (config: AIConfiguration) => {
    setEditingConfig(config);
    setFormData({
      name: config.name,
      description: config.description,
      systemRole: config.systemRole,
      analysisDepth: config.analysisDepth,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      customInstructions: config.customInstructions,
      responseFormat: config.responseFormat,
      fallbackBehavior: config.fallbackBehavior
    });
    setCategoryInstructions(config.categoryInstructions);
    setFocusAreas(config.focusAreas);
    setValidationRules(config.validationRules);
    setShowModal(true);
  };

  const handleSetActive = async (id: string) => {
    const { success, error } = await AIConfigService.setActiveConfig(id);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Active AI configuration updated');
      setActiveConfigId(id);
      loadConfigs();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this AI configuration?')) {
      const { success, error } = await AIConfigService.deleteConfig(id);
      if (error) {
        toast.error(error);
      } else {
        toast.success('AI Configuration deleted successfully');
        loadConfigs();
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingConfig(null);
    setFormData({
      name: '',
      description: '',
      systemRole: 'You are an expert Canadian customs compliance analyst with 15+ years of experience in international trade, customs regulations, and HS code classification.',
      analysisDepth: 'detailed',
      temperature: 0.3,
      maxTokens: 2000,
      customInstructions: '',
      responseFormat: 'json',
      fallbackBehavior: 'retry'
    });
    setCategoryInstructions({
      'Electronics': 'Focus on electronic components, safety certifications (CSA, FCC), and potential ITAR restrictions.',
      'Textiles & Apparel': 'Consider textile quotas, labeling requirements, and country of origin marking.',
      'Machinery & Equipment': 'Check for safety standards, electrical certifications, and potential dual-use restrictions.',
      'Chemicals': 'Emphasize chemical safety data sheets, environmental regulations, and controlled substances.',
      'Food & Beverages': 'Focus on food safety regulations, labeling requirements, and import permits.',
      'Automotive': 'Consider automotive safety standards, emissions requirements, and recall information.',
      'Pharmaceuticals': 'Emphasize Health Canada approvals, controlled substances, and prescription requirements.',
      'Construction Materials': 'Check building codes, safety standards, and environmental impact.',
      'Agricultural Products': 'Consider plant health certificates, organic certifications, and seasonal restrictions.',
      'Other': 'Apply general customs principles and recommend specific research areas.'
    });
    setFocusAreas([
      'Canadian customs regulations and procedures',
      'HS code classification accuracy',
      'Tariff optimization opportunities',
      'Documentation requirements',
      'Potential compliance risks',
      'Cost-saving recommendations'
    ]);
    setValidationRules([
      'HS code must be 6-10 digits',
      'Tariff rate must be between 0-100%',
      'Confidence must be between 0-1',
      'All required fields must be present'
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Configuration Management</h1>
          <p className="text-gray-600">Manage AI behavior and analysis settings for compliance analysis</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-cargo-600 hover:bg-cargo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>New Configuration</span>
        </button>
      </div>

      {/* Configurations List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cargo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI configurations...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {configs.map((config) => (
            <div key={config.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{config.name}</h3>
                  <p className="text-sm text-gray-600">{config.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {config.isActive && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      Active
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Analysis Depth:</span>
                  <span className="font-medium capitalize">{config.analysisDepth}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Temperature:</span>
                  <span className="font-medium">{config.temperature}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Max Tokens:</span>
                  <span className="font-medium">{config.maxTokens}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Response Format:</span>
                  <span className="font-medium capitalize">{config.responseFormat}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(config)}
                    className="text-blue-600 hover:text-blue-700 p-1"
                    title="Edit"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(config.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                    title="Delete"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                {!config.isActive && (
                  <button
                    onClick={() => handleSetActive(config.id)}
                    className="bg-cargo-600 hover:bg-cargo-700 text-white px-3 py-1 rounded text-sm font-medium"
                  >
                    Set Active
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Configuration Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingConfig ? 'Edit AI Configuration' : 'Create AI Configuration'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Analysis Depth</label>
                    <select
                      value={formData.analysisDepth}
                      onChange={(e) => setFormData(prev => ({ ...prev, analysisDepth: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                    >
                      <option value="basic">Basic</option>
                      <option value="detailed">Detailed</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                  />
                </div>

                {/* System Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">System Role</label>
                  <textarea
                    value={formData.systemRole}
                    onChange={(e) => setFormData(prev => ({ ...prev, systemRole: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                    placeholder="Define the AI's role and expertise..."
                  />
                </div>

                {/* Custom Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom Instructions</label>
                  <textarea
                    value={formData.customInstructions}
                    onChange={(e) => setFormData(prev => ({ ...prev, customInstructions: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                    placeholder="Additional instructions for the AI analysis..."
                  />
                </div>

                {/* Technical Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Temperature</label>
                    <input
                      type="number"
                      min="0"
                      max="2"
                      step="0.1"
                      value={formData.temperature}
                      onChange={(e) => setFormData(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Tokens</label>
                    <input
                      type="number"
                      min="100"
                      max="4000"
                      value={formData.maxTokens}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Response Format</label>
                    <select
                      value={formData.responseFormat}
                      onChange={(e) => setFormData(prev => ({ ...prev, responseFormat: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                    >
                      <option value="json">JSON</option>
                      <option value="text">Text</option>
                      <option value="structured">Structured</option>
                    </select>
                  </div>
                </div>

                {/* Category Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category Instructions</label>
                  <div className="space-y-2">
                    {Object.entries(categoryInstructions).map(([category, instruction]) => (
                      <div key={category} className="flex space-x-2">
                        <label className="w-32 text-sm text-gray-600 flex-shrink-0 mt-2">{category}:</label>
                        <textarea
                          value={instruction}
                          onChange={(e) => setCategoryInstructions(prev => ({ ...prev, [category]: e.target.value }))}
                          rows={2}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Focus Areas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Focus Areas</label>
                  <div className="space-y-2">
                    {focusAreas.map((area, index) => (
                      <div key={index} className="flex space-x-2">
                        <input
                          type="text"
                          value={area}
                          onChange={(e) => {
                            const newAreas = [...focusAreas];
                            newAreas[index] = e.target.value;
                            setFocusAreas(newAreas);
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                        />
                        <button
                          type="button"
                          onClick={() => setFocusAreas(prev => prev.filter((_, i) => i !== index))}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setFocusAreas(prev => [...prev, ''])}
                      className="text-cargo-600 hover:text-cargo-700 text-sm font-medium"
                    >
                      + Add Focus Area
                    </button>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cargo-600 hover:bg-cargo-700 text-white rounded-lg font-medium transition-colors"
                  >
                    {editingConfig ? 'Update Configuration' : 'Create Configuration'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAIPage;
