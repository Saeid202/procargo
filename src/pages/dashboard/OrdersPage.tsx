import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

import { PlusIcon, EyeIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Order {
  id: string;
  order_number: string;
  status: string;
  priority: string;
  origin_country: string;
  destination_country: string;
  total_value: number;
  currency: string;
  created_at: string;
  estimated_delivery?: string;
}

interface Supplier {
  id: string;
  product_name: string;
  supplier_links: string[];
  quantity: number;
  unit_type: string;
  unit_price: number;
  logistics_type: string;
  special_instructions: string;
  notes: string;
  files: File[];
}

interface OrderFormData {
  origin_country: string;
  origin_city: string;
  destination_country: string;
  destination_city: string;
  total_value: number;
  currency: string;
  exchange_rate: number;
  priority: string;
  notes: string;
  estimated_delivery: string;
  suppliers: Supplier[];
}

const OrdersPage: React.FC = () => {
  const { user, session } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OrderFormData>({
    origin_country: 'China',
    origin_city: '',
    destination_country: 'Canada',
    destination_city: '',
    total_value: 0,
    currency: 'USD',
    exchange_rate: 1.0,
    priority: 'normal',
    notes: '',
    estimated_delivery: '',
    suppliers: [{
      id: '1',
      product_name: '',
      supplier_links: [''],
      quantity: 0,
      unit_type: 'Pcs',
      unit_price: 0,
      logistics_type: 'Air',
      special_instructions: '',
      notes: '',
      files: []
    }]
  });

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      console.log('Loading mock orders for user:', user?.id);

      // Mock orders data
      const mockOrders: Order[] = [
        {
          id: '1',
          order_number: 'ORD-20241201-0001',
          status: 'Pending',
          priority: 'normal',
          origin_country: 'China',
          destination_country: 'Canada',
          total_value: 5000,
          currency: 'USD',
          created_at: '2024-12-01T10:00:00Z',
          estimated_delivery: '2024-12-15'
        }
      ];

      console.log('Mock orders loaded successfully:', mockOrders);
      setOrders(mockOrders);
    } catch (error) {
      console.error('Exception loading mock orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateOrderNumber = () => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${dateStr}-${random}`;
  };

  // Supplier management functions
  const addSupplier = () => {
    const newSupplier: Supplier = {
      id: Date.now().toString(),
      product_name: '',
      supplier_links: [''],
      quantity: 0,
      unit_type: 'Pcs',
      unit_price: 0,
      logistics_type: 'Air',
      special_instructions: '',
      notes: '',
      files: []
    };
    setFormData(prev => ({
      ...prev,
      suppliers: [...prev.suppliers, newSupplier]
    }));
  };

  const removeSupplier = (supplierId: string) => {
    setFormData(prev => ({
      ...prev,
      suppliers: prev.suppliers.filter(s => s.id !== supplierId)
    }));
  };

  const updateSupplier = (supplierId: string, field: keyof Supplier, value: any) => {
    setFormData(prev => ({
      ...prev,
      suppliers: prev.suppliers.map(s => 
        s.id === supplierId ? { ...s, [field]: value } : s
      )
    }));
  };

  const addSupplierLink = (supplierId: string) => {
    setFormData(prev => ({
      ...prev,
      suppliers: prev.suppliers.map(s => 
        s.id === supplierId 
          ? { ...s, supplier_links: [...s.supplier_links, ''] }
          : s
      )
    }));
  };

  const removeSupplierLink = (supplierId: string, linkIndex: number) => {
    setFormData(prev => ({
      ...prev,
      suppliers: prev.suppliers.map(s => 
        s.id === supplierId 
          ? { ...s, supplier_links: s.supplier_links.filter((_, i) => i !== linkIndex) }
          : s
      )
    }));
  };

  const updateSupplierLink = (supplierId: string, linkIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      suppliers: prev.suppliers.map(s => 
        s.id === supplierId 
          ? { 
              ...s, 
              supplier_links: s.supplier_links.map((link, i) => 
                i === linkIndex ? value : link
              )
            }
          : s
      )
    }));
  };

  const addSupplierFile = (supplierId: string) => {
    setFormData(prev => ({
      ...prev,
      suppliers: prev.suppliers.map(s => 
        s.id === supplierId 
          ? { ...s, files: [...s.files, new File([], '')] }
          : s
      )
    }));
  };

  const removeSupplierFile = (supplierId: string, fileIndex: number) => {
    setFormData(prev => ({
      ...prev,
      suppliers: prev.suppliers.map(s => 
        s.id === supplierId 
          ? { ...s, files: s.files.filter((_, i) => i !== fileIndex) }
          : s
      )
    }));
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      console.error('No user authenticated');
      return;
    }

    try {
      setLoading(true);
      console.log('Submitting order for user:', user.id);

      const orderNumber = generateOrderNumber();
      
      // Mock order creation
      const newOrder: Order = {
        id: Date.now().toString(),
        order_number: orderNumber,
        status: 'Pending',
        priority: formData.priority,
        origin_country: formData.origin_country,
        destination_country: formData.destination_country,
        total_value: formData.total_value,
        currency: formData.currency,
        created_at: new Date().toISOString(),
        estimated_delivery: formData.estimated_delivery || undefined
      };

      console.log('Mock order created successfully:', newOrder);
      
      // Reset form
      setFormData({
        origin_country: 'China',
        origin_city: '',
        destination_country: 'Canada',
        destination_city: '',
        total_value: 0,
        currency: 'USD',
        exchange_rate: 1.0,
        priority: 'normal',
        notes: '',
        estimated_delivery: '',
        suppliers: [{
          id: '1',
          product_name: '',
          supplier_links: [''],
          quantity: 0,
          unit_type: 'Pcs',
          unit_price: 0,
          logistics_type: 'Air',
          special_instructions: '',
          notes: '',
          files: []
        }]
      });
      setShowForm(false);
      
      alert('Mock order created successfully!');
    } catch (error) {
      console.error('Exception creating order:', error);
      alert('Error creating order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // Mock order status update
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );
      
      console.log('Mock order status updated:', orderId, 'to', newStatus);
    } catch (error) {
      console.error('Exception updating mock order status:', error);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      // Mock order deletion
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      
      console.log('Mock order deleted:', orderId);
    } catch (error) {
      console.error('Exception deleting mock order:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Authentication Required
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Please log in to view and manage your orders.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage your cargo orders and track their status</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          New Order
        </button>
      </div>



      {/* New Order Form */}
      {showForm && (
        <div className="mb-6 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Create New Order</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          <form onSubmit={handleOrderSubmit} className="p-6 space-y-6">

            {/* Suppliers Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Suppliers & Products</h3>
                <button
                  type="button"
                  onClick={addSupplier}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Supplier
                </button>
              </div>

              <div className="space-y-6">
                {formData.suppliers.map((supplier, index) => (
                  <div key={supplier.id} className="relative border border-gray-200 rounded-lg p-6 bg-gray-50">
                    {/* Remove Supplier Button */}
                    {formData.suppliers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSupplier(supplier.id)}
                        className="absolute top-4 right-4 text-red-600 hover:text-red-800 transition-colors"
                        title="Remove Supplier"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    )}

                    <div className="mb-4">
                      <h4 className="text-md font-semibold text-gray-800 mb-2">
                        Supplier {index + 1}
                      </h4>
                    </div>

                    {/* Product Information */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name & Description
                      </label>
                      <textarea
                        value={supplier.product_name}
                        onChange={(e) => updateSupplier(supplier.id, 'product_name', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Describe the product..."
                      />
                    </div>

                    {/* Supplier Links */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Supplier Links
                      </label>
                      <div className="space-y-2">
                        {supplier.supplier_links.map((link, linkIndex) => (
                          <div key={linkIndex} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={link}
                              onChange={(e) => updateSupplierLink(supplier.id, linkIndex, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Alibaba / 1688 link"
                            />
                            {supplier.supplier_links.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeSupplierLink(supplier.id, linkIndex)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Remove Link"
                              >
                                <XMarkIcon className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addSupplierLink(supplier.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                        >
                          + Add Another Link
                        </button>
                      </div>
                    </div>

                    {/* Quantity, Units, Price */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          value={supplier.quantity}
                          onChange={(e) => updateSupplier(supplier.id, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Units
                        </label>
                        <select
                          value={supplier.unit_type}
                          onChange={(e) => updateSupplier(supplier.id, 'unit_type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="Pcs">Pcs</option>
                          <option value="Cartons">Cartons</option>
                          <option value="Kg">Kg</option>
                          <option value="Meters">Meters</option>
                          <option value="Liters">Liters</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unit Price
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={supplier.unit_price}
                          onChange={(e) => updateSupplier(supplier.id, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {/* Logistics Type */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Logistics Type
                      </label>
                      <select
                        value={supplier.logistics_type}
                        onChange={(e) => updateSupplier(supplier.id, 'logistics_type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Air">Air</option>
                        <option value="Sea">Sea</option>
                        <option value="Express">Express</option>
                        <option value="Consolidation">Consolidation</option>
                        <option value="Land">Land</option>
                      </select>
                    </div>

                    {/* Instructions & Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Special Instructions
                        </label>
                        <textarea
                          value={supplier.special_instructions}
                          onChange={(e) => updateSupplier(supplier.id, 'special_instructions', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Special handling requirements..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                                                 <textarea
                           value={supplier.notes}
                           onChange={(e) => updateSupplier(supplier.id, 'notes', e.target.value)}
                           rows={2}
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           placeholder="Additional notes..."
                         />
                      </div>
                    </div>

                    {/* File Uploads */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Files
                      </label>
                      <div className="space-y-2">
                        {supplier.files.map((file, fileIndex) => (
                          <div key={fileIndex} className="flex items-center gap-2">
                            <input
                              type="file"
                              onChange={(e) => {
                                const newFile = e.target.files?.[0];
                                if (newFile) {
                                  const newFiles = [...supplier.files];
                                  newFiles[fileIndex] = newFile;
                                  updateSupplier(supplier.id, 'files', newFiles);
                                }
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => removeSupplierFile(supplier.id, fileIndex)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Remove File"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addSupplierFile(supplier.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                        >
                          + Add Another File
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-md font-medium transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating Order...
                  </>
                ) : (
                  <>
                    <PlusIcon className="h-5 w-5" />
                    Create Order
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Orders List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Your Orders</h3>
        </div>
        
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No orders found. Create your first order to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(order.priority)}`}>
                        {order.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.origin_country} → {order.destination_country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.currency} {order.total_value.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => updateOrderStatus(order.id, 'confirmed')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => deleteOrder(order.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;

