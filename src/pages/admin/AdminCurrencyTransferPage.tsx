import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CurrencyTransferRequest, CurrencyTransferService } from '../../services/currencyTransferService'
import { 
  EyeIcon,
  XMarkIcon,
  ArrowPathIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

const AdminCurrencyTransferPage: React.FC = () => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [transfers, setTransfers] = useState<CurrencyTransferRequest[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selected, setSelected] = useState<CurrencyTransferRequest | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [newStatus, setNewStatus] = useState<NonNullable<CurrencyTransferRequest['status']> | ''>('')

  useEffect(() => {
    loadTransfers()
  }, [])

  const loadTransfers = async () => {
    try {
      setLoading(true)
      const { transfers, error } = await CurrencyTransferService.getAllTransfers()
      if (error) {
        console.error('Error loading transfers:', error)
        alert(`Error loading transfers: ${error}`)
        return
      }
      setTransfers(transfers || [])
    } catch (error) {
      console.error('Error loading transfers:', error)
      alert('Error loading transfers. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    return transfers.filter((tr) => {
      const matchesStatus = filterStatus === 'all' || tr.status === filterStatus
      const haystack = `${tr.transfer_type} ${tr.from_currency} ${tr.to_currency} ${tr.purpose} ${tr.beneficiary_name} ${tr.beneficiary_bank} ${tr.customer_request} ${tr.admin_notes || ''}`.toLowerCase()
      const matchesSearch = haystack.includes(searchTerm.toLowerCase())
      return matchesStatus && matchesSearch
    })
  }, [transfers, filterStatus, searchTerm])

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-700 bg-yellow-100'
      case 'in_review':
        return 'text-blue-700 bg-blue-100'
      case 'processed':
        return 'text-green-700 bg-green-100'
      case 'rejected':
        return 'text-red-700 bg-red-100'
      default:
        return 'text-gray-700 bg-gray-100'
    }
  }

  const handleUpdateStatus = async () => {
    if (!selected || !newStatus) return
    try {
      const { success, error } = await CurrencyTransferService.updateTransferStatus(selected.id, newStatus, adminNotes || undefined)
      if (success) {
        await loadTransfers()
        setSelected(null)
        setAdminNotes('')
        setNewStatus('')
        alert('Transfer updated successfully!')
      } else {
        alert(`Error updating transfer: ${error}`)
      }
    } catch (error) {
      console.error('Error updating transfer:', error)
      alert('Error updating transfer. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center">
            <ArrowPathIcon className="h-8 w-8 mx-auto text-gray-400 animate-spin" />
            <p className="mt-4 text-gray-600">{t('loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
            <CurrencyDollarIcon className="h-6 w-6 mr-2 text-green-600" />
            {t('currency_transfer')}
          </h1>
          <button
            onClick={loadTransfers}
            className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-5 w-5 mr-1" />
            {t('refresh')}
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
          <div className="px-6 py-4 grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('status')}</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">{t('all')}</option>
                <option value="pending">{t('pending')}</option>
                <option value="in_review">{t('in_review')}</option>
                <option value="processed">{t('processed')}</option>
                <option value="rejected">{t('rejected')}</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('search')}</label>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('search_placeholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">{t('all_requests')}</h2>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">{t('no_requests_found')}</h3>
              <p className="mt-1 text-sm text-gray-500">{t('no_requests_found')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('type')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('amount')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('currencies')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('purpose')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('beneficiary')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_notes')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('submitted')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map((tr) => (
                    <tr key={tr.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tr.transfer_type || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tr.amount?.toLocaleString()} {tr.to_currency}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tr.from_currency} → {tr.to_currency}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate" title={tr.purpose}>{tr.purpose}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tr.beneficiary_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(tr.status)}`}>
                          {tr.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate" title={tr.admin_notes || ''}>{tr.admin_notes || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tr.created_at ? new Date(tr.created_at).toLocaleString() : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => { setSelected(tr); setNewStatus(tr.status || 'pending'); setAdminNotes(tr.admin_notes || '') }}
                          className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50"
                        >
                          <EyeIcon className="h-5 w-5 mr-1" />
                          {t('view')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-2xl">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{t('request_details')}</h3>
                <button onClick={() => setSelected(null)} className="p-1 rounded-md hover:bg-gray-100">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">{t('type')}</div>
                    <div className="text-gray-900">{selected.transfer_type || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">{t('amount')}</div>
                    <div className="text-gray-900">{selected.amount?.toLocaleString()} {selected.to_currency}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">{t('currencies')}</div>
                    <div className="text-gray-900">{selected.from_currency} → {selected.to_currency}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">{t('purpose')}</div>
                    <div className="text-gray-900">{selected.purpose}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">{t('beneficiary')}</div>
                    <div className="text-gray-900">{selected.beneficiary_name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">{t('bank')}</div>
                    <div className="text-gray-900">{selected.beneficiary_bank}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">{t('customer_request')}</div>
                  <div className="text-gray-900 whitespace-pre-wrap">{selected.customer_request}</div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('status')}</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as NonNullable<CurrencyTransferRequest['status']>)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="pending">{t('pending')}</option>
                      <option value="in_review">{t('in_review')}</option>
                      <option value="processed">{t('processed')}</option>
                      <option value="rejected">{t('rejected')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin_notes') || 'Admin notes'}</label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder={t('add_note') || 'Add a note'}
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
                <button onClick={() => setSelected(null)} className="px-4 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50">
                  {t('cancel')}
                </button>
                <button onClick={handleUpdateStatus} className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700">
                  {t('save')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminCurrencyTransferPage
