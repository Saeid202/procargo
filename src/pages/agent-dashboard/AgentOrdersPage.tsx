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

const AgentOrdersPage: React.FC = () => {
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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

    if (!validateForm()) {
      alert("Please fix the errors before submitting.");
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

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    formData.suppliers.forEach((supplier, i) => {
      if (!supplier.product_name.trim()) newErrors[`supplier-${i}-product_name`] = "Product name is required";
      if (supplier.quantity <= 0) newErrors[`supplier-${i}-quantity`] = "Quantity must be greater than 0";

      if (!supplier.supplier_links.length) {
        newErrors[`supplier-${i}-link`] = "At least one supplier link is required";
      } else {
        supplier.supplier_links.forEach((link, j) => {
          if (!link.url.trim()) {
            newErrors[`supplier-${i}-link-${j}-url`] = "Supplier link URL is required";
          }
          if (link.quantity <= 0) {
            newErrors[`supplier-${i}-link-${j}-quantity`] = "Link quantity must be greater than 0";
          }
        });
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    <div id="orders" className="tab-content">

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name, product..."
          className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          // oninput="filterOrders()"
          id="searchInput"
        />
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          // onchange="filterOrders()"
          id="statusFilter"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200" id="orderTableBody">
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">ORD-001</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">John Doe</td>
              <td className="px-6 py-4 text-sm text-gray-500">Commercial Coffee Machine</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">5</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Pending
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">May 5, 2025</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  // onclick="toggleOrderDetails('order1')"
                  className="text-blue-600 hover:text-blue-900 mr-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button
                  // onclick="downloadOrder('ORD-001')"
                  className="text-green-600 hover:text-green-900">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </td>
            </tr>
            <tr id="order1-details" className="hidden bg-blue-50">
              <td className="px-6 py-4 col-span-7">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Product Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="font-medium">Name:</span> Commercial Coffee Machine</div>
                        <div><span className="font-medium">Quantity:</span> 5 units</div>
                        <div><span className="font-medium">Category:</span> Commercial Equipment</div>
                        <div><span className="font-medium">Priority:</span> <span className="text-red-600 font-medium">High</span></div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Supplier Links
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-blue-600">Alibaba (Primary)</span>
                          <span className="text-xs text-gray-500">Quality check + warranty required</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-green-600">1688.com (Alternative)</span>
                          <span className="text-xs text-gray-500">Commercial grade for restaurant use</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        Attachments
                      </h4>
                      <div className="flex gap-3">
                        <button
                          // onclick="downloadFile('spec_sheet.pdf')"
                          className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                          </svg>
                          spec_sheet.pdf
                        </button>
                        <button
                          // onclick="downloadFile('photo.jpg')"
                          className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                          </svg>
                          photo.jpg
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Current Status
                      </h4>
                      <div className="text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          Pending
                        </span>
                        <p className="text-xs text-gray-600 mt-1">Waiting for response</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Quick Response
                      </h4>
                      <form className="space-y-3">
                        <textarea
                          placeholder="Type your response..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                        ></textarea>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            placeholder="Price $"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                          <input
                            type="date"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button type="submit" className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
                            Send Reply
                          </button>
                          <button
                            // onclick="updateOrderStatus('ORD-001', 'in-progress')"
                            type="button" className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm font-medium">
                            In Progress
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </td>
            </tr>

            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">ORD-002</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Sarah Lee</td>
              <td className="px-6 py-4 text-sm text-gray-500">Industrial Blender</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">10</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  In Progress
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">May 4, 2025</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  // onclick="toggleOrderDetails('order2')"
                  className="text-blue-600 hover:text-blue-900 mr-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button
                  // onclick="downloadOrder('ORD-002')"
                  className="text-green-600 hover:text-green-900">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </td>
            </tr>
            <tr id="order2-details" className="hidden bg-yellow-50">
              <td className="px-6 py-4 col-span-7">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Product Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="font-medium">Name:</span> Industrial Blender</div>
                        <div><span className="font-medium">Quantity:</span> 10 units</div>
                        <div><span className="font-medium">Category:</span> Industrial Equipment</div>
                        <div><span className="font-medium">Priority:</span> <span className="text-yellow-600 font-medium">Medium</span></div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Supplier Links
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-blue-600">1688.com (Primary)</span>
                          <span className="text-xs text-gray-500">Warranty + manual required</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-green-600">Alibaba (Alternative)</span>
                          <span className="text-xs text-gray-500">Industrial grade for food processing</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        Attachments
                      </h4>
                      <div className="flex gap-3">
                        <button
                          // onclick="downloadFile('warranty.pdf')"
                          className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                          </svg>
                          warranty.pdf
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Current Status
                      </h4>
                      <div className="text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          In Progress
                        </span>
                        <p className="text-xs text-gray-600 mt-1">Order being processed</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Quick Response
                      </h4>
                      <form className="space-y-3">
                        <textarea
                          placeholder="Type your response..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                        ></textarea>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            placeholder="Price $"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                          <input
                            type="date"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button type="submit" className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
                            Send Reply
                          </button>
                          <button
                            // onclick="updateOrderStatus('ORD-002', 'completed')"
                            type="button" className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
                            Complete
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </td>
            </tr>

            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">ORD-003</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Alex Kim</td>
              <td className="px-6 py-4 text-sm text-gray-500">Office Printer</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Completed
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">May 3, 2025</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  // onclick="toggleOrderDetails('order3')"
                  className="text-blue-600 hover:text-blue-900 mr-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button
                  // onclick="downloadOrder('ORD-003')"
                  className="text-green-600 hover:text-green-900">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </td>
            </tr>
            <tr id="order3-details" className="hidden bg-green-50">
              <td className="px-6 py-4 col-span-7">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Product Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="font-medium">Name:</span> Office Printer</div>
                        <div><span className="font-medium">Quantity:</span> 2 units</div>
                        <div><span className="font-medium">Category:</span> Office Equipment</div>
                        <div><span className="font-medium">Priority:</span> <span className="font-medium text-green-600">Low</span></div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Supplier Links
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-blue-600">Alibaba (Primary)</span>
                          <span className="text-xs text-gray-500">No special requirements</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Order Summary
                      </h4>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-xs text-gray-600">Final Price</p>
                          <p className="text-lg font-bold text-green-600">$1,200.00</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs text-gray-600">Delivery Date</p>
                          <p className="text-sm font-semibold text-blue-600">May 15, 2025</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <p className="text-xs text-gray-600">Status</p>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Delivered
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Current Status
                      </h4>
                      <div className="text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          Completed
                        </span>
                        <p className="text-xs text-gray-600 mt-1">Order successfully delivered</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Agent Notes
                      </h4>
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        Order successfully completed. Buyer satisfied with delivery. All requirements met and product quality exceeded expectations.
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgentOrdersPage;

