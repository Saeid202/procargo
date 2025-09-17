import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

import { SupabaseService } from '../../services/supabaseService';
import { Order } from '../dashboard/OrdersPage';
import { cn } from '../../utils/cn';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Loading from '../../components/ui/Loading';


const AgentOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderResponse, setOrderResponse] = useState<string>('');
  const [orderQuickPrice, setOrderQuickPrice] = useState<number>(0);
  const [orderQuickDeliveryDate, setOrderQuickDeliveryDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { t } = useTranslation();

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    setIsLoading(true);
    const { orders, error } = await SupabaseService.getAgentOrders();

    if (error) {
      console.error('Exception loading orders:', error);
    } else {
      setOrders(orders || []);
    }
    setIsLoading(false);
  };

  const toggleOrderDetails = (orderId: string) => {
    const orderDetails = document.getElementById(`${orderId}-details`);
    if (orderDetails) {
      orderDetails.classList.toggle('hidden');
    }
  };

  const updateOrderStatus = async (orderNumber: string, status: string) => {
    setIsLoading(true);
    const { error } = await SupabaseService.updateOrder(orderNumber, { status });
    if (error) {
      toast.error('Exception updating order status:', error);
    } else {
      toast.success('Order status updated successfully');
      await loadOrders();
    }
    setIsLoading(false);
  };

  const createOrderResponse = async (orderNumber: string) => {
    setIsLoading(true);
    const { error } = await SupabaseService.createOrderResponse(orderNumber, user?.id as string, { response: orderResponse, price: orderQuickPrice, delivery_date: !!orderQuickDeliveryDate ? orderQuickDeliveryDate : new Date().toISOString() });
    if (error) {
      toast.error('Exception creating order response:', error);
    } else {
      toast.success('Order response created successfully');
      await loadOrders();
  };
  setIsLoading(false);
  };

  if (isLoading) {
    return <Loading />
  }

  return (
    <div id="orders" className="tab-content">

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("order_id")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("buyer")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("product")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("qty")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("status")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("date")}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200" id="orderTableBody">
            {
              orders.map((order, index) => (
                <>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.order_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.destination_country}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{order.suppliers?.map((supplier) => supplier.product_name).join(', ')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.suppliers?.reduce((acc, supplier) => acc + supplier.quantity, 0)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn("capitalize inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", order.status === 'pending' ? 'bg-red-100 text-red-800' : order.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800')}>
                        {order.status?.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => toggleOrderDetails(`order${index}`)}
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
                  <tr id={`order${index}-details`} className={cn("hidden", order.status === 'pending' ? 'bg-blue-50' : order.status === 'in-progress' ? 'bg-yellow-50' : 'bg-green-50')}>
                    <td className="px-6 py-4" colSpan={7}>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                              {t("product_information")}
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div><span className="font-medium">{t("name")}:</span> {order.suppliers?.map((supplier) => supplier.product_name).join(', ')}</div>
                              <div><span className="font-medium">{t("quantity")}:</span> {order.suppliers?.reduce((acc, supplier) => acc + supplier.quantity, 0)} units</div>
                              {/* //TODO-Question: What is the category? */}
                              <div><span className="font-medium">{t("category")}:</span> Commercial Equipment</div>
                              <div><span className="font-medium">{t("priority")}:</span> <span className="text-red-600 font-medium capitalize">{order.priority}</span></div>
                            </div>
                          </div>

                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                              {t("supplier_links")}
                            </h4>
                            {
                              order.suppliers?.map((supplier) => (
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <span className="text-blue-600 overflow-auto">{supplier.supplier_links?.[0].url}</span>
                                    <span className="text-xs text-gray-500">{supplier.supplier_links?.[0].description}</span>
                                  </div>

                                </div>
                              ))
                            }
                          </div>

                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                              <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              {t("attachments")}
                            </h4>
                            {
                              order.suppliers?.map((supplier) => (
                                <>
                                  {
                                    supplier?.supplier_files?.map((file) => (
                                      <>
                                        <div className="flex gap-3">
                                          <a
                                            href={file.file_url}
                                            target='_blank'
                                            className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                              <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                                            </svg>
                                            {file.file_name}
                                          </a>
                                        </div>
                                      </>
                                    ))
                                  }
                                </>
                              ))
                            }
                          </div>

                          {
                            order.status === 'completed' && (
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {t("order_summary")}
                                </h4>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                  <div className="p-3 bg-green-50 rounded-lg">
                                    <p className="text-xs text-gray-600">{t("final_price")}</p>
                                    <p className="text-lg font-bold text-green-600">${order.total_value}</p>
                                  </div>
                                  <div className="p-3 bg-blue-50 rounded-lg">
                                    {/* //TODO-Question: Delivery Date */}
                                    <p className="text-xs text-gray-600">{t("delivery_date")}</p>
                                    <p className="text-sm font-semibold text-blue-600">May 15, 2025</p>
                                  </div>
                                  <div className="p-3 bg-purple-50 rounded-lg">
                                    {/* //TODO-Question: Status */}
                                    <p className="text-xs text-gray-600">{t("status")}</p>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      {t("delivered")}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )
                          }
                        </div>

                        <div className="space-y-4">
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                              <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {t("current_status")}
                            </h4>
                            <div className="text-center">
                              <span className={cn("capitalize inline-flex items-center px-3 py-1 rounded-full text-sm font-medium", order.status === 'pending' ? 'bg-red-100 text-red-800' : order.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800')}>
                                {order.status?.replace('-', ' ')}
                              </span>
                              <p className="text-xs text-gray-600 mt-1">{t("waiting_for_response")}</p>
                            </div>
                          </div>

                          {
                            order.status === 'completed' ? (
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                  </svg>
                                  {t("agent_notes")}
                                </h4>
                                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                  {t("order_successfully_completed")}. {t("buyer_satisfied_with_delivery")}. {t("all_requirements_met_and_product_quality_exceeded_expectations")}.
                                </div>
                              </div>
                            ) : (
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                  </svg>
                                  {t("quick_response")}
                                </h4>
                                <form className="space-y-3">
                                  <textarea
                                    placeholder={t("type_your_response")}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                                    value={orderResponse}
                                    onChange={(e) => setOrderResponse(e.target.value)}
                                  ></textarea>
                                  <div className="grid grid-cols-2 gap-2">
                                    <input
                                      type="number"
                                      placeholder={t("price_dollar")}
                                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                      value={orderQuickPrice}
                                      onChange={(e) => setOrderQuickPrice(Number(e.target.value))}
                                    />
                                    <input
                                      type="date"
                                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                      value={orderQuickDeliveryDate}
                                      onChange={(e) => setOrderQuickDeliveryDate(e.target.value)}
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <button type="button" onClick={async () => await createOrderResponse(order.order_number)} className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
                                      {t("send_reply")}
                                    </button>
                                    <button
                                      onClick={async () => await updateOrderStatus(order.order_number, 'in-progress')}
                                      type="button" className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm font-medium">
                                      {t("in_progress")}
                                    </button>
                                  </div>
                                </form>
                              </div>
                            )
                          }


                        </div>
                      </div>
                    </td>
                  </tr>
                </>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgentOrdersPage;