import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { SupabaseService } from '../../services/supabaseService';

export interface Order {
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
  suppliers?: Supplier[];
}
export interface SupplierLink {
  url: string;
  description: string;
  quantity: number;
}

export interface Supplier {
  id: string;
  product_name: string;
  supplier_links: SupplierLink[];
  quantity: number;
  unit_type: string;
  unit_price: number;
  logistics_type: string;
  special_instructions: string;
  notes: string;
  files: File[];
}

export interface OrderFormData {
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
      supplier_links: [{ url: '', description: '', quantity: 0 }],
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
      supplier_links: [{ url: '', description: '', quantity: 0 }],
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

  const updateSupplierLink = (supplierId: string, linkIndex: number, field: keyof SupplierLink, value: any) => {
    setFormData(prev => ({
      ...prev,
      suppliers: prev.suppliers.map(s =>
        s.id === supplierId
          ? {
            ...s,
            supplier_links: s.supplier_links.map((link, i) =>
              i === linkIndex ? { ...link, [field]: value } : link
            )
          }
          : s
      )
    }));
  };

  const addSupplierLink = (supplierId: string) => {
    setFormData(prev => ({
      ...prev,
      suppliers: prev.suppliers.map(s =>
        s.id === supplierId
          ? { ...s, supplier_links: [...s.supplier_links, { url: '', description: '', quantity: 0 }] }
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

      const orderNumber = generateOrderNumber();
      // 1. Create order
      const { order, error: orderError } = await SupabaseService.createOrder(user.id, formData, orderNumber);
      if (orderError || !order) throw new Error(orderError);

      // 2. Create suppliers + links + files
      for (const supplier of formData.suppliers) {
        const { supplier: savedSupplier, error: supplierError } =
          await SupabaseService.createSupplier(order.id, supplier);
        if (supplierError || !savedSupplier) throw new Error(supplierError);

        if (supplier.supplier_links?.length) {
          const { error: linksError } = await SupabaseService.createSupplierLinks(savedSupplier.id, supplier.supplier_links);
          if (linksError) throw new Error(linksError);
        }

        console.log(supplier.files,'log_01')

        if (supplier.files?.length > 0) {
          const { error: fileError } = await SupabaseService.uploadSupplierFiles(order.id, savedSupplier.id, supplier.files);
          if (fileError) throw new Error(fileError);
        }
      }

      // 3. Reset form
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
          supplier_links: [{ url: '', description: '', quantity: 0 }],
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
      alert('Order created successfully!');
    } catch (error) {
      console.error('Error creating order:', error);
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
    <div>
      <div className="flex justify-between items-center mb-6">
        {/* <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage your cargo orders and track their status</p>
        </div> */}
        <div></div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-cargo-600 hover:bg-cargo-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          New Order
        </button>
      </div>

      {showForm && (
        <div className="pb-6">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-br from-slate-50 to-slate-200">
              <h2 className="text-xl font-semibold">Submit New Order</h2>
              <button
                type="button"
                onClick={addSupplier}
                className="bg-gradient-to-tr from-green-600 to-green-700 text-white px-3 py-2 rounded-xl flex items-center gap-2 text-sm font-medium"
              >
                <PlusIcon className="h-4 w-4 opacity-70" />
                Add Supplier
              </button>
            </div>

            <form onSubmit={handleOrderSubmit} className="p-6 space-y-6">
              <div>
                <div className="space-y-6">
                  {formData.suppliers.map((supplier, index) => (
                    <section
                      key={supplier.id}
                      className="relative border border-gray-200 rounded-2xl p-6 bg-white hover:border-2 hover:border-indigo-500 transition-all duration-200"
                    >
                      {formData.suppliers.length > 1 && (
                        <div className='bg-gray-100 h-8 w-10 absolute top-6 right-6 flex items-center justify-center rounded-xl' >
                          <button
                            type="button"
                            onClick={() => removeSupplier(supplier.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Remove Supplier"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>
                      )}

                      <div className="mb-4 flex w-full items-center justify-between">
                        <div className='flex items-center gap-2' >
                          <span className="inline-block bg-blue-700 text-white text-sm px-4 py-1.5 rounded-lg">
                            Supplier {index + 1}
                          </span>
                          <span className="font-medium text-gray-500">Suppliers & Products</span>
                        </div>


                        <div className="flex justify-between items-center mb-4">
                          {
                            formData.suppliers.length == 1 ? (
                              <div className='bg-gray-100 h-8 w-10 absolute top-6 right-6 flex items-center justify-center rounded-xl' >
                                <button
                                  onClick={() => setShowForm(false)}
                                  className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                  <XMarkIcon className="h-5 w-5" />
                                </button>
                              </div>
                            ) : (
                              <div className='size-5' ></div>
                            )
                          }
                        </div>

                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Product Name & Description
                        </label>
                        <textarea
                          value={supplier.product_name}
                          onChange={(e) =>
                            updateSupplier(supplier.id, "product_name", e.target.value)
                          }
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white"
                          placeholder="Describe the product..."
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Supplier Links
                        </label>
                        <div className="space-y-2">
                          {supplier.supplier_links.map((link, linkIndex) => (
                            <div key={linkIndex} className='flex items-start gap-2 w-full bg-gray-50 p-4 border rounded-xl relative' >
                              <div className="flex w-full items-center gap-2 flex-col">
                                <input
                                  type="url"
                                  value={link.url}
                                  onChange={(e) =>
                                    updateSupplierLink(supplier.id, linkIndex, 'url', e.target.value)
                                  }
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-xl w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white"
                                  placeholder="Alibaba / 1688 link"
                                />
                                <div className='w-full flex items-center justify-between gap-2' >
                                  <input
                                    type="text"
                                    value={link.description}
                                    onChange={(e) =>
                                      updateSupplierLink(supplier.id, linkIndex, 'description', e.target.value)
                                    }
                                    className="w-full md:w-3/4 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white"
                                    placeholder="Description (optional)"
                                  />
                                  <input
                                    type="number"
                                    value={link.quantity}
                                    onChange={(e) =>
                                      updateSupplierLink(supplier.id, linkIndex, 'quantity', e.target.value)
                                    }
                                    className="w-full md:w-1/4 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white"
                                    placeholder="Qty"
                                  />
                                </div>
                              </div>
                              {supplier.supplier_links.length > 1 && (
                                <div
                                  className='size-5 rounded-full bg-red-500 flex items-center justify-center absolute right-3 top-3'
                                >
                                  <button
                                    type="button"
                                    onClick={() => removeSupplierLink(supplier.id, linkIndex)}
                                    className="text-gray-100"
                                    title="Remove Link"
                                  >
                                    <XMarkIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addSupplierLink(supplier.id)}
                            className="text-gray-600 hover:text-gray-800 text-sm font-medium mt-1"
                          >
                            + Add Another Link
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 mb-4">
                        <div className='w-full md:max-w-[30%]' >
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Quantity <span className='text-red-500' >*</span>
                          </label>
                          <input
                            type="number"
                            value={supplier.quantity}
                            onChange={(e) =>
                              updateSupplier(supplier.id, "quantity", parseInt(e.target.value) || 0)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Logistics Type
                          </label>
                          <select
                            value={supplier.logistics_type}
                            onChange={(e) =>
                              updateSupplier(supplier.id, "logistics_type", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white"
                          >
                            <option>Air</option>
                            <option>Sea (LCL)</option>
                            <option>Sea (FCL)</option>
                            <option>Express</option>
                            <option>Consolidation</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Special Instructions
                          </label>
                          <textarea
                            value={supplier.special_instructions}
                            onChange={(e) =>
                              updateSupplier(supplier.id, "special_instructions", e.target.value)
                            }
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white"
                            placeholder="Special handling requirements..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Notes
                          </label>
                          <textarea
                            value={supplier.notes}
                            onChange={(e) =>
                              updateSupplier(supplier.id, "notes", e.target.value)
                            }
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white"
                            placeholder="Additional notes..."
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Upload Files
                        </label>
                        <div className="space-y-2">
                          {supplier.files.map((file, fileIndex) => (
                            <div key={fileIndex} className='flex items-start gap-2 w-full bg-gray-50 p-4 border rounded-xl relative'  >
                              <div className="flex items-center gap-2 w-full">
                                <input
                                  type="file"
                                  onChange={(e) => {
                                    const newFile = e.target.files?.[0];
                                    if (newFile) {
                                      const newFiles = [...supplier.files];
                                      newFiles[fileIndex] = newFile;
                                      updateSupplier(supplier.id, "files", newFiles);
                                    }
                                  }}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white file:border-0 file:bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:text-sm file:font-semibold file:hover:bg-gray-100 cursor-pointer"
                                />
                              </div>
                              <div
                                className='size-5 rounded-full bg-red-500 flex items-center justify-center absolute right-3 top-3'
                              >
                                <button
                                  type="button"
                                  onClick={() => removeSupplierFile(supplier.id, fileIndex)}
                                  className="text-gray-100"
                                  title="Remove File"
                                >
                                  <XMarkIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addSupplierFile(supplier.id)}
                            className="text-gray-600 hover:text-gray-800 text-sm font-medium mt-1"
                          >
                            + Add Another File
                          </button>
                          <div className="text-sm mt-1">Attach invoices, specs, or photos for this supplier/product.</div>
                        </div>
                      </div>
                    </section>
                  ))}
                </div>
              </div>

              < div className="flex gap-3 pt-4 border-t border-gray-200" >
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-md font-medium flex items-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <PlusIcon className="h-5 w-5" />
                      Submit Order
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-md font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

      )}
    </div>
  );
};

export default OrdersPage;

