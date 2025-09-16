import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
  UserIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface SupportTicket {
  id: string;
  email: string;
  subject: string;
  message: string;
  file_url?: string;
  created_at: string;
}

interface TicketFilters {
  search: string;
}

const AdminSupportPage = () => {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showTicketDetails, setShowTicketDetails] = useState(false);
  const [filters, setFilters] = useState<TicketFilters>({
    search: ''
  });
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [adminResponse, setAdminResponse] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    withAttachments: 0
  });

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('support_requests')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply search filter
      if (filters.search) {
        query = query.or(`subject.ilike.%${filters.search}%,message.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching tickets:', error);
        toast.error('Failed to fetch tickets');
        return;
      }

      setTickets(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while fetching tickets');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ticketData: SupportTicket[]) => {
    setStats({
      total: ticketData.length,
      withAttachments: ticketData.filter(t => t.file_url).length
    });
  };


  const deleteTicket = async (ticketId: string) => {
    if (!window.confirm(t('confirm_delete_ticket'))) return;

    try {
      const { error } = await supabase
        .from('support_requests')
        .delete()
        .eq('id', ticketId);

      if (error) {
        toast.error('Failed to delete ticket');
        return;
      }

      toast.success(t('ticket_deleted_successfully'));
      fetchTickets();
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast.error('An error occurred while deleting ticket');
    }
  };

  const addAdminResponse = async (ticketId: string) => {
    if (!adminResponse.trim()) return;

    try {
      // Here you would typically add the response to a messages table
      // For now, we'll just show a success message
      toast.success(t('response_added_successfully'));
      setAdminResponse('');
      fetchTickets();
    } catch (error) {
      console.error('Error adding response:', error);
      toast.error('An error occurred while adding response');
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

  const handleSelectTicket = (ticketId: string) => {
    setSelectedTickets(prev => 
      prev.includes(ticketId) 
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTickets.length === tickets.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(tickets.map(t => t.id));
    }
  };

  if (showTicketDetails && selectedTicket) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowTicketDetails(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('ticket_details')}</h2>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => deleteTicket(selectedTicket.id)}
              className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
            >
              {t('delete_ticket')}
            </button>
          </div>
        </div>

        {/* Ticket Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('ticket_information')}</h3>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="text-sm font-medium text-gray-500 w-full sm:w-32">{t('ticket_id')}:</span>
                  <span className="text-sm text-gray-900 break-all">{selectedTicket.id}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="text-sm font-medium text-gray-500 w-full sm:w-32">{t('customer_email')}:</span>
                  <span className="text-sm text-gray-900 break-all">{selectedTicket.email}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start">
                  <span className="text-sm font-medium text-gray-500 w-full sm:w-32">{t('subject')}:</span>
                  <span className="text-sm text-gray-900 break-words">{selectedTicket.subject}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="text-sm font-medium text-gray-500 w-full sm:w-32">{t('created_date')}:</span>
                  <span className="text-sm text-gray-900">{formatDate(selectedTicket.created_at)}</span>
                </div>
                {selectedTicket.file_url && (
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="text-sm font-medium text-gray-500 w-full sm:w-32">{t('attachment')}:</span>
                    <a 
                      href={selectedTicket.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
                    >
                      {t('view_attachment')}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('message')}</h3>
              <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap break-words">
                {selectedTicket.message}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('support_tickets')}</h1>
          <p className="text-sm sm:text-base text-gray-600">{t('admin_support_description')}</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs sm:text-sm text-gray-600">{t('total_tickets')}</div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.withAttachments}</div>
          <div className="text-xs sm:text-sm text-gray-600">{t('ticket_attachments')}</div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('search_tickets')}</label>
          <div className="relative">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('search_tickets')}
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedTickets.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="text-sm text-blue-800">
              {selectedTickets.length} {t('tickets_selected')}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  selectedTickets.forEach(id => deleteTicket(id));
                  setSelectedTickets([]);
                }}
                className="w-full sm:w-auto px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                {t('delete_ticket')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tickets Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-6 sm:p-8 text-center">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm sm:text-base text-gray-600">{t('loading')}</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-6 sm:p-8 text-center">
            <ChatBubbleLeftRightIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">{t('no_tickets_found')}</h3>
            <p className="text-sm sm:text-base text-gray-600">{t('no_tickets_found_description')}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedTickets.length === tickets.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('ticket_id')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('customer_email')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('subject')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('attachment')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('created_date')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedTickets.includes(ticket.id)}
                          onChange={() => handleSelectTicket(ticket.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {ticket.id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ticket.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {ticket.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {ticket.file_url ? (
                          <a 
                            href={ticket.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            {t('view_attachment')}
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(ticket.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setShowTicketDetails(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title={t('view_ticket')}
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteTicket(ticket.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title={t('delete_ticket')}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden">
              {/* Select All for Mobile */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedTickets.length === tickets.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{t('select_all')}</span>
                </label>
              </div>

              {/* Mobile Cards */}
              <div className="divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedTickets.includes(ticket.id)}
                          onChange={() => handleSelectTicket(ticket.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {ticket.subject}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {ticket.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setShowTicketDetails(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 transition-colors p-1"
                          title={t('view_ticket')}
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteTicket(ticket.id)}
                          className="text-red-600 hover:text-red-900 transition-colors p-1"
                          title={t('delete_ticket')}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span className="font-medium">{t('ticket_id')}:</span>
                        <span className="font-mono">{ticket.id.slice(0, 8)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">{t('created_date')}:</span>
                        <span>{formatDate(ticket.created_at)}</span>
                      </div>
                      {ticket.file_url && (
                        <div className="flex justify-between">
                          <span className="font-medium">{t('attachment')}:</span>
                          <a 
                            href={ticket.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {t('view_attachment')}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminSupportPage;