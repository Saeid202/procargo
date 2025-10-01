import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CompanyVerificationRequest, CompanyVerificationFile, CompanyVerificationService } from '../../services/companyVerificationService'
import { ArrowPathIcon, EyeIcon, XMarkIcon, BuildingOffice2Icon, LinkIcon } from '@heroicons/react/24/outline'

const AdminCompanyVerificationPage: React.FC = () => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<CompanyVerificationRequest[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selected, setSelected] = useState<CompanyVerificationRequest | null>(null)
  const [files, setFiles] = useState<CompanyVerificationFile[]>([])

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const { requests, error } = await CompanyVerificationService.getAllVerificationRequests()
      if (error) {
        console.error('Error loading verification requests:', error)
        alert(`Error loading verification requests: ${error}`)
        return
      }
      setRequests(requests || [])
    } catch (error) {
      console.error('Error loading verification requests:', error)
      alert('Error loading verification requests. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchesStatus = filterStatus === 'all' || r.status === filterStatus
      const haystack = `${r.company_name_english || ''} ${r.company_name_chinese || ''} ${r.business_license || ''}`.toLowerCase()
      const matchesSearch = haystack.includes(searchTerm.toLowerCase())
      return matchesStatus && matchesSearch
    })
  }, [requests, filterStatus, searchTerm])

  const openDetails = async (req: CompanyVerificationRequest) => {
    setSelected(req)
    try {
      const { files, error } = await CompanyVerificationService.getVerificationRequestFiles(req.id)
      if (error) {
        console.error('Error loading files:', error)
        setFiles([])
        return
      }
      setFiles(files || [])
    } catch (error) {
      console.error('Error loading files:', error)
      setFiles([])
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
            <BuildingOffice2Icon className="h-6 w-6 mr-2 text-indigo-600" />
            {t('company_verification') || 'Company Verification'}
          </h1>
          <button onClick={loadRequests} className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-50">
            <ArrowPathIcon className="h-5 w-5 mr-1" />
            {t('refresh')}
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
          <div className="px-6 py-4 grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('status')}</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="all">{t('all')}</option>
                <option value="pending">{t('pending')}</option>
                <option value="in_review">{t('in_review')}</option>
                <option value="verified">{t('verified') || 'Verified'}</option>
                <option value="rejected">{t('rejected')}</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('search')}</label>
              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t('search_placeholder')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">{t('all_requests')}</h2>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <BuildingOffice2Icon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">{t('no_requests_found')}</h3>
              <p className="mt-1 text-sm text-gray-500">{t('no_requests_found')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('company')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">中文名</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('created_at')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.company_name_english || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.company_name_chinese || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.status || 'pending'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.created_at ? new Date(r.created_at).toLocaleString() : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => openDetails(r)} className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50">
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
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-3xl">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{t('request_details')}</h3>
                <button onClick={() => { setSelected(null); setFiles([]) }} className="p-1 rounded-md hover:bg-gray-100">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">{t('company')}</div>
                    <div className="text-gray-900">{selected.company_name_english || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">中文名</div>
                    <div className="text-gray-900">{selected.company_name_chinese || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">{t('status')}</div>
                    <div className="text-gray-900">{selected.status || 'pending'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">{t('created_at')}</div>
                    <div className="text-gray-900">{selected.created_at ? new Date(selected.created_at).toLocaleString() : '-'}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">{t('attachments')}</div>
                  {files.length === 0 ? (
                    <div className="text-gray-500 text-sm">{t('no_files') || 'No files'}</div>
                  ) : (
                    <ul className="space-y-2">
                      {files.map((f) => {
                        const url = CompanyVerificationService.getFilePublicUrl(f.file_path)
                        return (
                          <li key={f.id} className="flex items-center justify-between">
                            <div className="text-sm text-gray-900">{f.file_name}</div>
                            {url && (
                              <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center text-blue-600 hover:underline">
                                <LinkIcon className="h-4 w-4 mr-1" />
                                {t('view_attachment')}
                              </a>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end">
                <button onClick={() => { setSelected(null); setFiles([]) }} className="px-4 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50">
                  {t('close')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminCompanyVerificationPage
