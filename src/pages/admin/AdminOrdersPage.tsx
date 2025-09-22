import React, { useState, useEffect } from 'react';
import { 
  EyeIcon, 
  XCircleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { SupabaseService } from '../../services/supabaseService';
import { useTranslation } from 'react-i18next';

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  origin_country: string;
  origin_city?: string;
  destination_country: string;
  destination_city?: string;
  total_value: number;
  currency: string;
  priority: string;
  status: string;
  notes?: string;
  estimated_delivery?: string;
  created_at: string;
  updated_at: string;
  suppliers?: Supplier[];
}

interface Supplier {
  id: string;
  product_name: string;
  quantity: number;
  unit_type: string;
  unit_price: number;
  logistics_type: string;
  special_instructions?: string;
  notes?: string;
  supplier_links?: SupplierLink[];
  supplier_files?: SupplierFile[];
}

interface SupplierLink {
  id: string;
  url: string;
  description?: string;
  quantity: number;
}

interface SupplierFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
}

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { t } = useTranslation();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const { orders, error } = await SupabaseService.getAgentOrders();
      
      if (error) {
        console.error('Error loading orders:', error);
        alert(`Error loading orders: ${error}`);
        return;
      }
      
      setOrders(orders || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      alert('Error loading orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-purple-600 bg-purple-100';
      case 'shipped': return 'text-indigo-600 bg-indigo-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'normal': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.origin_country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.destination_country.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cargo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t("orders_management")}</h1>
        <div className="text-sm text-gray-500">
          {t("total")}: {orders.length} | {t("filtered")}: {filteredOrders.length}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Suppliers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.order_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.origin_country} → {order.destination_country}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.origin_city && order.destination_city && 
                          `${order.origin_city} → ${order.destination_city}`
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.currency} {order.total_value.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(order.priority)}`}>
                        {order.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.suppliers?.length || 0} suppliers
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-cargo-600 hover:text-cargo-900 mr-3"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">Order Details - {selectedOrder.order_number}</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Order Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Order Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Order Number</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedOrder.order_number}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Priority</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedOrder.priority)}`}>
                        {selectedOrder.priority}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Total Value</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedOrder.currency} {selectedOrder.total_value.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Route</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedOrder.origin_country} → {selectedOrder.destination_country}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Estimated Delivery</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedOrder.estimated_delivery ? new Date(selectedOrder.estimated_delivery).toLocaleDateString() : 'Not set'}
                      </p>
                    </div>
                  </div>
                  {selectedOrder.notes && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <p className="mt-1 text-sm text-gray-900 bg-white p-3 rounded-md">{selectedOrder.notes}</p>
                    </div>
                  )}
                </div>

                {/* Suppliers */}
                {selectedOrder.suppliers && selectedOrder.suppliers.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Suppliers ({selectedOrder.suppliers.length})</h4>
                    <div className="space-y-4">
                      {selectedOrder.suppliers.map((supplier, index) => (
                        <div key={supplier.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="text-sm font-medium text-gray-900">Supplier {index + 1}</h5>
                            <span className="text-xs text-gray-500">{supplier.logistics_type}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Product</label>
                              <p className="mt-1 text-sm text-gray-900">{supplier.product_name}</p>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Quantity</label>
                              <p className="mt-1 text-sm text-gray-900">{supplier.quantity} {supplier.unit_type}</p>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Unit Price</label>
                              <p className="mt-1 text-sm text-gray-900">{selectedOrder.currency} {supplier.unit_price}</p>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Total</label>
                              <p className="mt-1 text-sm text-gray-900">{selectedOrder.currency} {(supplier.quantity * supplier.unit_price).toLocaleString()}</p>
                            </div>
                          </div>

                          {supplier.special_instructions && (
                            <div className="mb-3">
                              <label className="block text-xs font-medium text-gray-700">Special Instructions</label>
                              <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{supplier.special_instructions}</p>
                            </div>
                          )}

                          {supplier.notes && (
                            <div className="mb-3">
                              <label className="block text-xs font-medium text-gray-700">Notes</label>
                              <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{supplier.notes}</p>
                            </div>
                          )}

                          {/* Supplier Links */}
                          {supplier.supplier_links && supplier.supplier_links.length > 0 && (
                            <div className="mb-3">
                              <label className="block text-xs font-medium text-gray-700 mb-2">Supplier Links</label>
                              <div className="space-y-2">
                                {supplier.supplier_links.map((link, linkIndex) => (
                                  <div key={link.id} className="bg-blue-50 p-2 rounded text-sm">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <a 
                                          href={link.url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:text-blue-800 break-all"
                                        >
                                          {link.url}
                                        </a>
                                        {link.description && (
                                          <p className="text-gray-600 mt-1">{link.description}</p>
                                        )}
                                      </div>
                                      <span className="text-xs text-gray-500 ml-2">Qty: {link.quantity}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Supplier Files */}
                          {supplier.supplier_files && supplier.supplier_files.length > 0 && (
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-2">Files</label>
                              <div className="space-y-1">
                                {supplier.supplier_files.map((file) => (
                                  <div key={file.id} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                                    <div className="flex items-center">
                                      <DocumentTextIcon className="h-4 w-4 text-gray-400 mr-2" />
                                      <span className="text-gray-900">{file.file_name}</span>
                                    </div>
                                    <a 
                                      href={file.file_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 text-xs"
                                    >
                                      Download
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
