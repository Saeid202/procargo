import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { QuotationService, QuotationRequest } from '../../services/quotationService';
import { supabase } from '../../lib/supabase';
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon, 
  CheckIcon, 
  XMarkIcon,
  ClockIcon,
  CurrencyDollarIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

export default function AdminQuotationPage() {
  const { user } = useAuth();
  const [quotations, setQuotations] = useState<QuotationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [formData, setFormData] = useState({
    status: 'pending' as QuotationRequest['status'],
    agent_notes: '',
    quoted_price: '',
    estimated_delivery_days: ''
  });

  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = async () => {
    try {
      setLoading(true);
      // For admin, we need to get all quotations
      // This would require a new method in QuotationService
      const { data, error } = await supabase
        .from('quotation_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading quotations:', error);
        return;
      }

      setQuotations(data || []);
    } catch (error) {
      console.error('Error loading quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewQuotation = (quotation: QuotationRequest) => {
    setSelectedQuotation(quotation);
    setFormData({
      status: quotation.status,
      agent_notes: quotation.agent_notes || '',
      quoted_price: quotation.quoted_price?.toString() || '',
      estimated_delivery_days: quotation.estimated_delivery_days?.toString() || ''
    });
    setShowModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedQuotation) return;

    try {
      const updateData = {
        status: formData.status,
        agent_notes: formData.agent_notes || undefined,
        quoted_price: formData.quoted_price ? parseFloat(formData.quoted_price) : undefined,
        estimated_delivery_days: formData.estimated_delivery_days ? parseInt(formData.estimated_delivery_days) : undefined
      };

      const { success, error } = await QuotationService.updateQuotationStatus(
        selectedQuotation.id,
        updateData.status,
        updateData.agent_notes,
        updateData.quoted_price,
        updateData.estimated_delivery_days
      );

      if (success) {
        await loadQuotations();
        setShowModal(false);
        setSelectedQuotation(null);
        alert('Quotation status updated successfully!');
      } else {
        alert(`Error updating quotation: ${error}`);
      }
    } catch (error) {
      console.error('Error updating quotation:', error);
      alert('Error updating quotation. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'quoted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cargo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quotation Management</h1>
            <p className="text-gray-600 mt-1">Manage customer quotation requests and provide quotes</p>
          </div>
          <div className="text-sm text-gray-500">
            Total Requests: {quotations.length}
          </div>
        </div>
      </div>

      {/* Quotations List */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">All Quotation Requests</h2>
        </div>
        
        {quotations.length === 0 ? (
          <div className="text-center py-12">
            <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No quotation requests</h3>
            <p className="mt-1 text-sm text-gray-500">No quotation requests have been submitted yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quotations.map((quotation) => (
                  <tr key={quotation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {quotation.product_name}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {quotation.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {quotation.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(quotation.status)}`}>
                        {quotation.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(quotation.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewQuotation(quotation)}
                        className="text-cargo-600 hover:text-cargo-900 mr-3"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quotation Details Modal */}
      {showModal && selectedQuotation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Quotation Request Details
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="mt-4 space-y-6">
                {/* Product Information */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Product Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Product Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedQuotation.product_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quantity</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedQuotation.quantity}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedQuotation.description}</p>
                  </div>
                </div>

                {/* Reference Links */}
                {selectedQuotation.reference_links && selectedQuotation.reference_links.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Reference Links</h4>
                    <div className="space-y-2">

                      {selectedQuotation.reference_links.map((link: string, index: number) => (
                        <div key={index} className="flex items-center">
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cargo-600 hover:text-cargo-800 text-sm truncate"
                          >
                            {link}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Needs Explanation */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Customer Needs</h4>
                  <p className="text-sm text-gray-900">{selectedQuotation.explanation_of_needs}</p>
                </div>

                {/* Admin Actions */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Admin Actions</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as QuotationRequest['status'] }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="quoted">Quoted</option>
                        <option value="rejected">Rejected</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Agent Notes</label>
                      <textarea
                        value={formData.agent_notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, agent_notes: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                        placeholder="Add notes about this quotation request..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Quoted Price (CAD)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.quoted_price}
                          onChange={(e) => setFormData(prev => ({ ...prev, quoted_price: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Delivery (Days)</label>
                        <input
                          type="number"
                          value={formData.estimated_delivery_days}
                          onChange={(e) => setFormData(prev => ({ ...prev, estimated_delivery_days: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStatus}
                  className="px-4 py-2 text-sm font-medium text-white bg-cargo-600 hover:bg-cargo-700 rounded-lg transition-colors"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
