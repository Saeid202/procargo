import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { SupabaseService } from '../../services/supabaseService';
import { QuotationService } from '../../services/quotationService';
import { OtherRequestService } from '../../services/otherRequestService';
import { useTranslation } from 'react-i18next';

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
  supplier_files?: SupplierFile[];
}

export interface SupplierFile {
  created_at: string;
  file_name: string;
  file_type: string;
  file_url: string;
  id: string;
  supplier_id: string;
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
  const [activeSegment, setActiveSegment] = useState('I don\'t have a Supplier');
  const [otherRequestData, setOtherRequestData] = useState({
    description: '',
    contactInfo: '',
    urgency: 'normal'
  });
  const [quotationRequestData, setQuotationRequestData] = useState({
    productName: '',
    description: '',
    referenceLinks: [{ url: '', description: '' }],
    productImages: [] as File[],
    needsExplanation: '',
    quantity: 0,
    unitType: 'Pcs',
    budget: '',
    timeline: '',
    specialRequirements: ''
  });
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

  const { t } = useTranslation();

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

  const handleOtherRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!user) {
      alert('Please log in to submit a request.');
      setLoading(false);
      return;
    }

    try {
      // Prepare data for database
      const requestData = {
        description: otherRequestData.description,
        contact_info: otherRequestData.contactInfo || undefined,
        urgency: otherRequestData.urgency as "low" | "normal" | "high" | "urgent",
      };

      // Create other request in database
      const { request, error: requestError } = await OtherRequestService.createOtherRequest(
        user.id,
        requestData
      );

      if (requestError || !request) {
        throw new Error(requestError || 'Failed to create request');
      }
      
      // Reset form
      setOtherRequestData({
        description: '',
        contactInfo: '',
        urgency: 'normal'
      });

      // Show success message
      alert('Your request has been submitted successfully! We will contact you soon.');
    } catch (error) {
      console.error('Error submitting other request:', error);
      alert(`Error submitting request: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  // Quotation request helper functions
  const addReferenceLink = () => {
    setQuotationRequestData(prev => ({
      ...prev,
      referenceLinks: [...prev.referenceLinks, { url: '', description: '' }]
    }));
  };

  const removeReferenceLink = (index: number) => {
    setQuotationRequestData(prev => ({
      ...prev,
      referenceLinks: prev.referenceLinks.filter((_, i) => i !== index)
    }));
  };

  const updateReferenceLink = (index: number, field: 'url' | 'description', value: string) => {
    setQuotationRequestData(prev => ({
      ...prev,
      referenceLinks: prev.referenceLinks.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setQuotationRequestData(prev => ({
      ...prev,
      productImages: [...prev.productImages, ...files]
    }));
  };

  const removeImage = (index: number) => {
    setQuotationRequestData(prev => ({
      ...prev,
      productImages: prev.productImages.filter((_, i) => i !== index)
    }));
  };

  const handleQuotationRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!user) {
      alert('Please log in to submit a quotation request.');
      setLoading(false);
      return;
    }

    try {
      // Prepare data for database
      const quotationData = {
        product_name: quotationRequestData.productName,
        description: quotationRequestData.description,
        reference_links: quotationRequestData.referenceLinks
          .filter(link => link.url.trim() !== '')
          .map(link => link.url),
        explanation_of_needs: quotationRequestData.needsExplanation,
        quantity: quotationRequestData.quantity,
      };

      // Create quotation request in database
      const { quotation, error: quotationError } = await QuotationService.createQuotationRequest(
        user.id,
        quotationData
      );

      if (quotationError || !quotation) {
        throw new Error(quotationError || 'Failed to create quotation request');
      }

      // Upload images if any
      if (quotationRequestData.productImages.length > 0) {
        for (const image of quotationRequestData.productImages) {
          const { error: uploadError } = await QuotationService.uploadQuotationFile(
            quotation.id,
            user.id,
            image
          );
          
          if (uploadError) {
            console.warn('Failed to upload image:', uploadError);
            // Continue with other images even if one fails
          }
        }
      }
      
      // Reset form
      setQuotationRequestData({
        productName: '',
        description: '',
        referenceLinks: [{ url: '', description: '' }],
        productImages: [],
        needsExplanation: '',
        quantity: 0,
        unitType: 'Pcs',
        budget: '',
        timeline: '',
        specialRequirements: ''
      });

      // Show success message
      alert('Your quotation request has been submitted successfully! Our agents will contact you soon with quotes.');
    } catch (error) {
      console.error('Error submitting quotation request:', error);
      alert(`Error submitting request: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
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
    <div>
      <div className="flex justify-between items-center mb-6">
        {/* <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage your cargo orders and track their status</p>
        </div> */}
        <div></div>
        <button
          onClick={() => setActiveSegment('I have a Supplier')}
          className="bg-cargo-600 hover:bg-cargo-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          {t("new_order")}
        </button>
      </div>

      {/* Instructions */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">{t("choose_the_appropriate_option_based_on_your_needs")}</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex-shrink-0 mt-0.5">1</span>
              <div>
                <span className="font-semibold text-blue-900">{t("i_have_a_supplier")}</span> - {t("use_this_form_if_you_have_already_negotiated_prices_with_suppliers_and_need_us_to_purchase_consolidate_and_ship_your_products_you_can_also_request_supplier_credibility_verification")}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-green-600 text-white text-xs font-bold rounded-full flex-shrink-0 mt-0.5">2</span>
              <div>
                <span className="font-semibold text-green-900">{t("i_dont_have_a_supplier")}</span> - {t("use_this_form_if_you_need_us_to_source_products_for_you_please_provide_detailed_specifications_and_attach_any_relevant_documents")}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-600 text-white text-xs font-bold rounded-full flex-shrink-0 mt-0.5">3</span>
              <div>
                <span className="font-semibold text-purple-900">{t("other_requests")}</span> - {t("use_this_form_for_any_other_inquiries_related_to_the_chinese_market")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Bar */}
      <div className="mb-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex">
            <button 
              onClick={() => setActiveSegment('I have a Supplier')}
              className={`flex-1 px-6 py-4 text-center border-r border-gray-200 transition-all duration-200 font-medium ${
                activeSegment === 'I have a Supplier'
                  ? 'bg-cargo-50 text-cargo-700 border-b-2 border-cargo-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {t("i_have_a_supplier")}
            </button>
            <button 
              onClick={() => setActiveSegment('I don\'t have a Supplier')}
              className={`flex-1 px-6 py-4 text-center border-r border-gray-200 transition-all duration-200 font-medium ${
                activeSegment === 'I don\'t have a Supplier'
                  ? 'bg-cargo-50 text-cargo-700 border-b-2 border-cargo-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {t("i_dont_have_a_supplier")}
            </button>
            <button 
              onClick={() => setActiveSegment('Other requests')}
              className={`flex-1 px-6 py-4 text-center transition-all duration-200 font-medium ${
                activeSegment === 'Other requests'
                  ? 'bg-cargo-50 text-cargo-700 border-b-2 border-cargo-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {t("other_requests")}
            </button>
          </div>
        </div>
      </div>

      {/* Other Requests Form */}
      {activeSegment === 'Other requests' && (
        <div className="mb-6">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-br from-slate-50 to-slate-200">
              <h2 className="text-xl font-semibold text-gray-900">{t("describe_your_request")}</h2>
              <p className="text-gray-600 text-sm mt-1">{t("tell_us_what_you_need_and_we_ll_help_you_find_the_right_solution")}</p>
            </div>

            <form onSubmit={handleOtherRequestSubmit} className="p-6 space-y-6">
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("what_do_you_need_help_with")} *
                </label>
                <textarea
                  id="description"
                  rows={6}
                  value={otherRequestData.description}
                  onChange={(e) => setOtherRequestData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500 resize-none"
                  placeholder={t("please_describe_your_specific_requirements_questions_or_needs_in_detail")}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700 mb-2">
                    {t("contact_information")}
                  </label>
                  <input
                    type="text"
                    id="contactInfo"
                    value={otherRequestData.contactInfo}
                    onChange={(e) => setOtherRequestData(prev => ({ ...prev, contactInfo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                    placeholder={t("phone_number_or_email_optional")}
                  />
                </div>

                <div>
                  <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-2">
                    {t("urgency_level")}
                  </label>
                  <select
                    id="urgency"
                    value={otherRequestData.urgency}
                    onChange={(e) => setOtherRequestData(prev => ({ ...prev, urgency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                  >
                    <option value="low">{t("low_no_rush")}</option>
                    <option value="normal">{t("normal_within_a_week")}</option>
                    <option value="high">{t("high_within_2_3_days")}</option>
                    <option value="urgent">{t("urgent_same_day")}</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading || !otherRequestData.description.trim()}
                  className="bg-cargo-600 hover:bg-cargo-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors duration-200"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <PlusIcon className="h-5 w-5" />
                      {t("submit_request")}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* I have a Supplier Form */}
      {activeSegment === 'I have a Supplier' && (
        <div className="mb-6">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-br from-blue-50 to-blue-100">
              <h2 className="text-xl font-semibold text-gray-900">{t("submit_new_order")}</h2>
              <button
                type="button"
                onClick={addSupplier}
                className="bg-gradient-to-tr from-green-600 to-green-700 text-white px-3 py-2 rounded-xl flex items-center gap-2 text-sm font-medium"
              >
                <PlusIcon className="h-4 w-4 opacity-70" />
                {t("add_supplier")}
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
                        <div className='bg-gray-100 h-8 w-10 absolute top-6 right-6 rtl:left-6 rtl:right-auto flex items-center justify-center rounded-xl' >
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
                            {t("supplier")} {index + 1}
                          </span>
                          <span className="font-medium text-gray-500">{t("suppliers_and_products")}</span>
                        </div>

                        <div className="flex justify-between items-center mb-4">
                          {
                            formData.suppliers.length == 1 ? (
                              <div className='bg-gray-100 h-8 w-10 absolute top-6 right-6 rtl:left-6 rtl:right-auto flex items-center justify-center rounded-xl' >
                                <button
                                  onClick={() => setActiveSegment('I don\'t have a Supplier')}
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
                          {t("product_name_and_description")} <span className="text-red-500">*</span>
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
                        {errors[`supplier-${index}-product_name`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`supplier-${index}-product_name`]}</p>
                        )}
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          {t("supplier_links")}
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
                                  placeholder={t("alibaba_1688_link")}
                                />
                                {errors[`supplier-${index}-link-${linkIndex}-url`] && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {errors[`supplier-${index}-link-${linkIndex}-url`]}
                                  </p>
                                )}
                                <div className='w-full flex items-center justify-between gap-2' >
                                  <input
                                    type="text"
                                    value={link.description}
                                    onChange={(e) =>
                                      updateSupplierLink(supplier.id, linkIndex, 'description', e.target.value)
                                    }
                                    className="w-full md:w-3/4 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white"
                                    placeholder={t("description_optional")}
                                  />
                                  <input
                                    type="number"
                                    value={link.quantity}
                                    onChange={(e) =>
                                      updateSupplierLink(supplier.id, linkIndex, 'quantity', e.target.value)
                                    }
                                    className="w-full md:w-1/4 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white"
                                    placeholder={t("qty")}
                                  />
                                  {errors[`supplier-${index}-link-${linkIndex}-quantity`] && (
                                    <p className="text-red-500 text-xs mt-1">
                                      {errors[`supplier-${index}-link-${linkIndex}-quantity`]}
                                    </p>
                                  )}
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
                            + {t("add_another_link")}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 mb-4">
                        <div className='w-full md:max-w-[30%]' >
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            {t("quantity")} <span className='text-red-500' >*</span>
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
                            {t("logistics_type")} <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={supplier.logistics_type}
                            onChange={(e) =>
                              updateSupplier(supplier.id, "logistics_type", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white"
                          >
                            <option value={'Air'}>{t("air")}</option>
                            <option value={'Sea LCL'}>{t("sea_lcl")}</option>
                            <option value={'Sea FCL'}>{t("sea_fcl")}</option>
                            <option value={'Express'}>{t("express")}</option>
                            <option value={'Consolidation'}>{t("consolidation")}</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            {t("special_instructions")}
                          </label>
                          <textarea
                            value={supplier.special_instructions}
                            onChange={(e) =>
                              updateSupplier(supplier.id, "special_instructions", e.target.value)
                            }
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white"
                            placeholder={t("special_instructions_optional")}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            {t("notes")}
                          </label>
                          <textarea
                            value={supplier.notes}
                            onChange={(e) =>
                              updateSupplier(supplier.id, "notes", e.target.value)
                            }
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white"
                            placeholder={t("notes_optional")}
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("upload_files")}
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
                            + {t("add_another_file")}
                          </button>
                          <div className="text-sm mt-1">{t("attach_invoices_specs_or_photos_for_this_supplier_product")}</div>
                        </div>
                      </div>
                    </section>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
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
                      {t("submit_order")}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSegment('I don\'t have a Supplier')}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-md font-medium"
                >
                  {t("cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quotation Request Form */}
      {activeSegment === 'I don\'t have a Supplier' && (
        <div className="mb-6">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-br from-green-50 to-green-100">
              <h2 className="text-xl font-semibold text-gray-900">{t("request_quotation_from_our_agents")}</h2>
              <p className="text-gray-600 text-sm mt-1">{t("tell_us_about_the_product_you_need_and_our_agents_will_find_the_best_suppliers_for_you")}</p>
            </div>

            <form onSubmit={handleQuotationRequestSubmit} className="p-6 space-y-6">
              {/* Product Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">{t("product_information")}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("product_name")} *
                    </label>
                    <input
                      type="text"
                      id="productName"
                      value={quotationRequestData.productName}
                      onChange={(e) => setQuotationRequestData(prev => ({ ...prev, productName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                      placeholder={t("e_g_led_strip_lights_water_bottles_etc")}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("quantity")} *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        id="quantity"
                        value={quotationRequestData.quantity}
                        onChange={(e) => setQuotationRequestData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                        placeholder={t("1000")}
                        min="1"
                        required
                      />
                      <select
                        value={quotationRequestData.unitType}
                        onChange={(e) => setQuotationRequestData(prev => ({ ...prev, unitType: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                      >
                        <option value="Pcs">{t("pcs")}</option>
                        <option value="Sets">{t("sets")}</option>
                        <option value="Boxes">{t("boxes")}</option>
                        <option value="Kg">{t("kg")}</option>
                        <option value="Lbs">{t("lbs")}</option>
                        <option value="Meters">{t("meters")}</option>
                        <option value="Feet">{t("feet")}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    {t("product_description")} *
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    value={quotationRequestData.description}
                    onChange={(e) => setQuotationRequestData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500 resize-none"
                    placeholder={t("describe_the_product_specifications_materials_colors_dimensions_etc")}
                    required
                  />
                </div>
              </div>

              {/* Reference Links */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">{t("reference_links")}</h3>
                  <button
                    type="button"
                    onClick={addReferenceLink}
                    className="text-cargo-600 hover:text-cargo-700 text-sm font-medium flex items-center gap-1"
                  >
                    <PlusIcon className="h-4 w-4" />
                    {t("add_link")}
                  </button>
                </div>

                {quotationRequestData.referenceLinks.map((link, index) => (
                  <div key={index} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("website_url")}
                      </label>
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => updateReferenceLink(index, 'url', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                        placeholder="https://example.com/product"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("description")}
                      </label>
                      <input
                        type="text"
                        value={link.description}
                        onChange={(e) => updateReferenceLink(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                        placeholder={t("what_is_this_link_for")}
                      />
                    </div>
                    {quotationRequestData.referenceLinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeReferenceLink(index)}
                        className="text-red-600 hover:text-red-700 p-2"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Product Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">{t("product_images")}</h3>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="productImages"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="productImages"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <div className="p-3 bg-cargo-50 rounded-full">
                      <PlusIcon className="h-8 w-8 text-cargo-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{t("upload_product_images")}</span>
                    <span className="text-xs text-gray-500">{t("png_jpg_gif_up_to_10mb_each")}</span>
                  </label>
                </div>

                {quotationRequestData.productImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {quotationRequestData.productImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Product ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">{t("additional_information")}</h3>
                
                <div>
                  <label htmlFor="needsExplanation" className="block text-sm font-medium text-gray-700 mb-2">
                    {t("please_explain_your_needs")} *
                  </label>
                  <textarea
                    id="needsExplanation"
                    rows={4}
                    value={quotationRequestData.needsExplanation}
                    onChange={(e) => setQuotationRequestData(prev => ({ ...prev, needsExplanation: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500 resize-none"
                    placeholder={t("explain_what_you_re_looking_for_any_specific_requirements_quality_standards_etc")}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("budget_range")}
                    </label>
                    <input
                      type="text"
                      id="budget"
                      value={quotationRequestData.budget}
                      onChange={(e) => setQuotationRequestData(prev => ({ ...prev, budget: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                      placeholder={t("e_g_1000_5000")}
                    />
                  </div>

                  <div>
                    <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("timeline")}
                    </label>
                    <select
                      id="timeline"
                      value={quotationRequestData.timeline}
                      onChange={(e) => setQuotationRequestData(prev => ({ ...prev, timeline: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                    >
                      <option value="">{t("select_timeline")}</option>
                      <option value="urgent">{t("urgent_1_2_weeks")}</option>
                      <option value="normal">{t("normal_2_4_weeks")}</option>
                      <option value="flexible">{t("flexible_1_2_months")}</option>
                      <option value="long-term">{t("long_term_2_plus_months")}</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="specialRequirements" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("special_requirements")}
                    </label>
                    <input
                      type="text"
                      id="specialRequirements"
                      value={quotationRequestData.specialRequirements}
                      onChange={(e) => setQuotationRequestData(prev => ({ ...prev, specialRequirements: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                      placeholder={t("e_g_custom_packaging_certifications")}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading || !quotationRequestData.productName.trim() || !quotationRequestData.description.trim() || !quotationRequestData.needsExplanation.trim()}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors duration-200"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <PlusIcon className="h-5 w-5" />
                      {t("request_quotation")}
                    </>
                  )}
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