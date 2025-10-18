import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";

import { SupabaseService } from "../../services/supabaseService";
import { Order } from "../dashboard/OrdersPage";
import { cn } from "../../utils/cn";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Loading from "../../components/ui/Loading";
import {
  ExportRequest,
  ExportRequestFile,
  ExportService,
} from "../../services/exportService";
import {
  CurrencyTransferRequest,
  CurrencyTransferService,
} from "../../services/currencyTransferService";
import {
  ArrowPathIcon,
  EyeIcon,
  XMarkIcon,
  DocumentTextIcon,
  LinkIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

const AgentOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderResponse, setOrderResponse] = useState<string>("");
  const [orderQuickPrice, setOrderQuickPrice] = useState<number>(0);
  const [orderQuickDeliveryDate, setOrderQuickDeliveryDate] =
    useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Export requests state
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [exportRequests, setExportRequests] = useState<ExportRequest[]>([]);
  const [exportFilterStatus, setExportFilterStatus] = useState<string>("all");
  const [exportSearchTerm, setExportSearchTerm] = useState<string>("");
  const [exportFilesMap, setExportFilesMap] = useState<
    Record<string, ExportRequestFile[]>
  >({});
  const [exportStatusUpdate, setExportStatusUpdate] = useState<
    Record<string, NonNullable<ExportRequest["status"]>>
  >({});
  const [exportAdminNotesUpdate, setExportAdminNotesUpdate] = useState<
    Record<string, string>
  >({});

  // Currency transfers state
  const [currencyLoading, setCurrencyLoading] = useState<boolean>(false);
  const [currencyTransfers, setCurrencyTransfers] = useState<
    CurrencyTransferRequest[]
  >([]);
  const [currencyFilterStatus, setCurrencyFilterStatus] =
    useState<string>("all");
  const [currencySearchTerm, setCurrencySearchTerm] = useState<string>("");
  const [transferStatusUpdate, setTransferStatusUpdate] = useState<
    Record<string, NonNullable<CurrencyTransferRequest["status"]>>
  >({});
  const [transferAdminNotesUpdate, setTransferAdminNotesUpdate] = useState<
    Record<string, string>
  >({});

  const { t } = useTranslation();

  // Tabs
  const [activeTab, setActiveTab] = useState<"orders" | "export" | "currency">(
    "orders"
  );

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadExportRequests();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadCurrencyTransfers();
    }
  }, [user]);

  const loadOrders = async () => {
    setIsLoading(true);
    const { orders, error } = await SupabaseService.getAgentOrders();

    if (error) {
      console.error("Exception loading orders:", error);
    } else {
      setOrders(orders || []);
    }
    setIsLoading(false);
  };

  const toggleOrderDetails = (orderId: string) => {
    const orderDetails = document.getElementById(`${orderId}-details`);
    if (orderDetails) {
      orderDetails.classList.toggle("hidden");
    }
  };

  const updateOrderStatus = async (orderNumber: string, status: string) => {
    setIsLoading(true);
    const { error } = await SupabaseService.updateOrder(orderNumber, {
      status,
    });
    if (error) {
      toast.error("Exception updating order status:", error);
    } else {
      toast.success("Order status updated successfully");
      await loadOrders();
    }
    setIsLoading(false);
  };

  const createOrderResponse = async (orderNumber: string) => {
    setIsLoading(true);
    const { error } = await SupabaseService.createOrderResponse(
      orderNumber,
      user?.id as string,
      {
        response: orderResponse,
        price: orderQuickPrice,
        delivery_date: !!orderQuickDeliveryDate
          ? orderQuickDeliveryDate
          : new Date().toISOString(),
      }
    );
    if (error) {
      toast.error("Exception creating order response:", error);
    } else {
      toast.success("Order response created successfully");
      await loadOrders();
    }
    setIsLoading(false);
  };

  const loadExportRequests = async () => {
    try {
      setExportLoading(true);
      const { exports, error } = await ExportService.getAllExportRequests();
      if (error) {
        console.error("Error loading export requests:", error);
        return;
      }
      setExportRequests(exports || []);
    } catch (e) {
      console.error("Error loading export requests:", e);
    } finally {
      setExportLoading(false);
    }
  };

  const filteredExports = useMemo(() => {
    return exportRequests.filter((r) => {
      const matchesStatus =
        exportFilterStatus === "all" || r.status === exportFilterStatus;
      const haystack = `${r.company_name || ""} ${r.company_type || ""} ${
        r.company_introduction || ""
      } ${r.product_name || ""} ${r.product_description || ""} ${
        r.additional_info || ""
      } ${r.admin_notes || ""}`.toLowerCase();
      const matchesSearch = haystack.includes(exportSearchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [exportRequests, exportFilterStatus, exportSearchTerm]);

  const openExportDetails = async (req: ExportRequest) => {
    try {
      const { files, error } = await ExportService.getExportRequestFiles(
        req.id
      );
      if (error) {
        console.error("Error loading files:", error);
        setExportFilesMap((prev) => ({ ...prev, [req.id]: [] }));
      } else {
        setExportFilesMap((prev) => ({ ...prev, [req.id]: files || [] }));
      }
    } catch (err) {
      console.error("Error loading files:", err);
      setExportFilesMap((prev) => ({ ...prev, [req.id]: [] }));
    } finally {
      setExportStatusUpdate((prev) =>
        prev[req.id]
          ? prev
          : {
              ...prev,
              [req.id]: (req.status || "pending") as NonNullable<
                ExportRequest["status"]
              >,
            }
      );
      setExportAdminNotesUpdate((prev) =>
        prev[req.id] !== undefined
          ? prev
          : { ...prev, [req.id]: req.admin_notes || "" }
      );
    }
  };

  const toggleExportDetails = async (rowId: string, req: ExportRequest) => {
    const el = document.getElementById(`${rowId}-details`);
    if (el) {
      const willOpen = el.classList.contains("hidden");
      el.classList.toggle("hidden");
      if (willOpen) {
        await openExportDetails(req);
      }
    }
  };

  const handleExportStatusSave = async (req: ExportRequest) => {
    try {
      const newStatus = (exportStatusUpdate[req.id] ||
        req.status ||
        "pending") as NonNullable<ExportRequest["status"]>;
      const notes = exportAdminNotesUpdate[req.id] ?? req.admin_notes ?? "";
      const { success, error } = await ExportService.updateExportStatus(
        req.id,
        newStatus,
        notes || undefined
      );
      if (success) {
        toast.success("Export status updated successfully");
        await loadExportRequests();
      } else {
        toast.error(error || "Failed to update export status");
      }
    } catch (e) {
      console.error("Exception updating export status:", e);
      toast.error("Exception updating export status");
    }
  };

  const loadCurrencyTransfers = async () => {
    try {
      setCurrencyLoading(true);
      const { transfers, error } =
        await CurrencyTransferService.getAllTransfers();
      if (error) {
        console.error("Error loading currency transfers:", error);
        return;
      }
      setCurrencyTransfers(transfers || []);
    } catch (e) {
      console.error("Error loading currency transfers:", e);
    } finally {
      setCurrencyLoading(false);
    }
  };

  const filteredCurrencyTransfers = useMemo(() => {
    return currencyTransfers.filter((tr) => {
      const matchesStatus =
        currencyFilterStatus === "all" || tr.status === currencyFilterStatus;
      const haystack = `${tr.transfer_type} ${tr.from_currency} ${
        tr.to_currency
      } ${tr.purpose} ${tr.beneficiary_name} ${tr.beneficiary_bank} ${
        tr.customer_request
      } ${tr.admin_notes || ""}`.toLowerCase();
      const matchesSearch = haystack.includes(currencySearchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [currencyTransfers, currencyFilterStatus, currencySearchTerm]);

  const toggleCurrencyDetails = async (
    rowId: string,
    tr: CurrencyTransferRequest
  ) => {
    const el = document.getElementById(`${rowId}-details`);
    if (el) {
      const willOpen = el.classList.contains("hidden");
      el.classList.toggle("hidden");
      if (willOpen) {
        setTransferStatusUpdate((prev) =>
          prev[tr.id]
            ? prev
            : {
                ...prev,
                [tr.id]: (tr.status || "pending") as NonNullable<
                  CurrencyTransferRequest["status"]
                >,
              }
        );
        setTransferAdminNotesUpdate((prev) =>
          prev[tr.id] !== undefined
            ? prev
            : { ...prev, [tr.id]: tr.admin_notes || "" }
        );
      }
    }
  };

  const handleTransferStatusSave = async (tr: CurrencyTransferRequest) => {
    try {
      const newStatus = (transferStatusUpdate[tr.id] ||
        tr.status ||
        "pending") as NonNullable<CurrencyTransferRequest["status"]>;
      const notes = transferAdminNotesUpdate[tr.id] ?? tr.admin_notes ?? "";
      const { success, error } =
        await CurrencyTransferService.updateTransferStatus(
          tr.id,
          newStatus,
          notes || undefined
        );
      if (success) {
        toast.success("Currency transfer updated successfully");
        await loadCurrencyTransfers();
      } else {
        toast.error(error || "Failed to update currency transfer");
      }
    } catch (e) {
      console.error("Exception updating currency transfer:", e);
      toast.error("Exception updating currency transfer");
    }
  };

  const getCurrencyStatusBadge = (status?: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-700 bg-yellow-100";
      case "in_review":
        return "text-blue-700 bg-blue-100";
      case "processed":
        return "text-green-700 bg-green-100";
      case "rejected":
        return "text-red-700 bg-red-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div id="orders" className="tab-content">
      <div className="mb-6 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex-1 px-6 py-4 text-center border-r border-gray-200 transition-all duration-200 font-medium ${
              activeTab === "orders"
                ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {t("orders") || "Orders"}
          </button>
          <button
            onClick={() => setActiveTab("export")}
            className={`flex-1 px-6 py-4 text-center border-r border-gray-200 transition-all duration-200 font-medium ${
              activeTab === "export"
                ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {t("export")}
          </button>
          <button
            onClick={() => setActiveTab("currency")}
            className={`flex-1 px-6 py-4 text-center transition-all duration-200 font-medium ${
              activeTab === "currency"
                ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {t("currency_transfer")}
          </button>
        </div>
      </div>

      {activeTab === "orders" && (
        <>
          <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("order_id")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("buyer")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("product")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("qty")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("status")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("date")}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody
              className="bg-white divide-y divide-gray-200"
              id="orderTableBody"
            >
              {orders.map((order, index) => (
                <>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.destination_country}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {order.suppliers
                        ?.map((supplier) => supplier.product_name)
                        .join(", ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.suppliers?.reduce(
                        (acc, supplier) => acc + supplier.quantity,
                        0
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          "capitalize inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          order.status === "pending"
                            ? "bg-red-100 text-red-800"
                            : order.status === "in-progress"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        )}
                      >
                        {order.status?.replace("-", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => toggleOrderDetails(`order${index}`)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      <button
                        // onclick="downloadOrder('ORD-001')"
                        className="text-green-600 hover:text-green-900"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                  <tr
                    id={`order${index}-details`}
                    className={cn(
                      "hidden",
                      order.status === "pending"
                        ? "bg-blue-50"
                        : order.status === "in-progress"
                        ? "bg-yellow-50"
                        : "bg-green-50"
                    )}
                  >
                    <td className="px-6 py-4" colSpan={7}>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                              <svg
                                className="w-5 h-5 mr-2 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                              </svg>
                              {t("product_information")}
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">
                                  {t("name")}:
                                </span>{" "}
                                {order.suppliers
                                  ?.map((supplier) => supplier.product_name)
                                  .join(", ")}
                              </div>
                              <div>
                                <span className="font-medium">
                                  {t("quantity")}:
                                </span>{" "}
                                {order.suppliers?.reduce(
                                  (acc, supplier) => acc + supplier.quantity,
                                  0
                                )}{" "}
                                units
                              </div>
                              {/* //TODO-Question: What is the category? */}
                              <div>
                                <span className="font-medium">
                                  {t("category")}:
                                </span>{" "}
                                Commercial Equipment
                              </div>
                              <div>
                                <span className="font-medium">
                                  {t("priority")}:
                                </span>{" "}
                                <span className="text-red-600 font-medium capitalize">
                                  {order.priority}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                              <svg
                                className="w-5 h-5 mr-2 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                />
                              </svg>
                              {t("supplier_links")}
                            </h4>
                            {order.suppliers?.map((supplier) => (
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <span className="text-blue-600 overflow-auto">
                                    {supplier.supplier_links?.[0].url}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {supplier.supplier_links?.[0].description}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                              <svg
                                className="w-5 h-5 mr-2 text-purple-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                />
                              </svg>
                              {t("attachments")}
                            </h4>
                            {order.suppliers?.map((supplier) => (
                              <>
                                {supplier?.supplier_files?.map((file) => (
                                  <>
                                    <div className="flex gap-3">
                                      <a
                                        href={file.file_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                                      >
                                        <svg
                                          className="w-4 h-4"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path
                                            fill-rule="evenodd"
                                            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                            clip-rule="evenodd"
                                          />
                                        </svg>
                                        {file.file_name}
                                      </a>
                                    </div>
                                  </>
                                ))}
                              </>
                            ))}
                          </div>

                          {order.status === "completed" && (
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                <svg
                                  className="w-5 h-5 mr-2 text-green-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                {t("order_summary")}
                              </h4>
                              <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="p-3 bg-green-50 rounded-lg">
                                  <p className="text-xs text-gray-600">
                                    {t("final_price")}
                                  </p>
                                  <p className="text-lg font-bold text-green-600">
                                    ${order.total_value}
                                  </p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                  {/* //TODO-Question: Delivery Date */}
                                  <p className="text-xs text-gray-600">
                                    {t("delivery_date")}
                                  </p>
                                  <p className="text-sm font-semibold text-blue-600">
                                    May 15, 2025
                                  </p>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-lg">
                                  {/* //TODO-Question: Status */}
                                  <p className="text-xs text-gray-600">
                                    {t("status")}
                                  </p>
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {t("delivered")}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                              <svg
                                className="w-5 h-5 mr-2 text-orange-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {t("current_status")}
                            </h4>
                            <div className="text-center">
                              <span
                                className={cn(
                                  "capitalize inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                                  order.status === "pending"
                                    ? "bg-red-100 text-red-800"
                                    : order.status === "in-progress"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                                )}
                              >
                                {order.status?.replace("-", " ")}
                              </span>
                              <p className="text-xs text-gray-600 mt-1">
                                {t("waiting_for_response")}
                              </p>
                            </div>
                          </div>

                          {order.status === "completed" ? (
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                <svg
                                  className="w-5 h-5 mr-2 text-blue-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                  />
                                </svg>
                                {t("agent_notes")}
                              </h4>
                              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                {t("order_successfully_completed")}.{" "}
                                {t("buyer_satisfied_with_delivery")}.{" "}
                                {t(
                                  "all_requirements_met_and_product_quality_exceeded_expectations"
                                )}
                                .
                              </div>
                            </div>
                          ) : (
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                <svg
                                  className="w-5 h-5 mr-2 text-blue-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                  />
                                </svg>
                                {t("quick_response")}
                              </h4>
                              <form className="space-y-3">
                                <textarea
                                  placeholder={t("type_your_response")}
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                                  value={orderResponse}
                                  onChange={(e) =>
                                    setOrderResponse(e.target.value)
                                  }
                                ></textarea>
                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="number"
                                    placeholder={t("price_dollar")}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    value={orderQuickPrice}
                                    onChange={(e) =>
                                      setOrderQuickPrice(Number(e.target.value))
                                    }
                                  />
                                  <input
                                    type="date"
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    value={orderQuickDeliveryDate}
                                    onChange={(e) =>
                                      setOrderQuickDeliveryDate(e.target.value)
                                    }
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={async () =>
                                      await createOrderResponse(
                                        order.order_number
                                      )
                                    }
                                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                                  >
                                    {t("send_reply")}
                                  </button>
                                  <button
                                    onClick={async () =>
                                      await updateOrderStatus(
                                        order.order_number,
                                        "in-progress"
                                      )
                                    }
                                    type="button"
                                    className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm font-medium"
                                  >
                                    {t("in_progress")}
                                  </button>
                                </div>
                              </form>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Export Requests inside Orders tab */}
        <div className="mt-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <DocumentTextIcon className="h-6 w-6 mr-2 text-blue-600" />
              {t("export")}
            </h2>
            <button
              onClick={loadExportRequests}
              className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-50"
            >
              <ArrowPathIcon className="h-5 w-5 mr-1" />
              {t("refresh")}
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
            <div className="px-6 py-4 grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("status")}
                </label>
                <select
                  value={exportFilterStatus}
                  onChange={(e) => setExportFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">{t("all")}</option>
                  <option value="pending">{t("pending")}</option>
                  <option value="in_review">{t("in_review")}</option>
                  <option value="processed">{t("processed")}</option>
                  <option value="rejected">{t("rejected")}</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("search")}
                </label>
                <input
                  value={exportSearchTerm}
                  onChange={(e) => setExportSearchTerm(e.target.value)}
                  placeholder={t("search_placeholder")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">
                {t("all_requests")}
              </h3>
            </div>

            {exportLoading ? (
              <div className="p-6 text-center">
                <ArrowPathIcon className="h-6 w-6 mx-auto text-gray-400 animate-spin" />
                <p className="mt-2 text-gray-600">{t("loading")}</p>
              </div>
            ) : filteredExports.length === 0 ? (
              <div className="text-center py-12">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h4 className="mt-2 text-sm font-medium text-gray-900">
                  {t("no_requests_found")}
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  {t("no_requests_found")}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("company")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("product")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("status")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("created_at")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredExports.map((r, index) => (
                      <>
                        <tr key={r.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {r.company_name || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {r.product_name || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCurrencyStatusBadge(
                                r.status?.toLowerCase()
                              )}`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {r.created_at
                              ? new Date(r.created_at).toLocaleString()
                              : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() =>
                                toggleExportDetails(`orders_export${index}`, r)
                              }
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                        <tr
                          id={`orders_export${index}-details`}
                          className="hidden bg-blue-50"
                        >
                          <td className="px-6 py-4" colSpan={5}>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              <div className="lg:col-span-2 space-y-4">
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                    <svg
                                      className="w-5 h-5 mr-2 text-blue-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                      />
                                    </svg>
                                    {t("product_information")}
                                  </h4>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="font-medium">
                                        {t("company")}:
                                      </span>{" "}
                                      {r.company_name || "-"}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        {t("product")}:
                                      </span>{" "}
                                      {r.product_name || "-"}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        {t("status")}:
                                      </span>{" "}
                                      {r.status || "pending"}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        {t("created_at")}:
                                      </span>{" "}
                                      {r.created_at
                                        ? new Date(r.created_at).toLocaleString()
                                        : "-"}
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                    <svg
                                      className="w-5 h-5 mr-2 text-purple-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                      />
                                    </svg>
                                    {t("attachments")}
                                  </h4>
                                  {(exportFilesMap[r.id] || []).length === 0 ? (
                                    <div className="text-gray-500 text-sm">
                                      {t("no_files") || "No files"}
                                    </div>
                                  ) : (
                                    <div className="flex gap-3 flex-wrap">
                                      {(exportFilesMap[r.id] || []).map(
                                        (file) => (
                                          <a
                                            key={file.id}
                                            href={
                                              ExportService.getFilePublicUrl(
                                                file.file_path
                                              ) || undefined
                                            }
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                                          >
                                            <svg
                                              className="w-4 h-4"
                                              fill="currentColor"
                                              viewBox="0 0 20 20"
                                            >
                                              <path
                                                fillRule="evenodd"
                                                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                                clipRule="evenodd"
                                              />
                                            </svg>
                                            {file.file_name}
                                          </a>
                                        )
                                      )}
                                    </div>
                                  )}
                                </div>

                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <h4 className="font-semibold text-gray-800 mb-3">
                                    {t("description")}
                                  </h4>
                                  <div className="text-gray-900 whitespace-pre-wrap">
                                    {r.product_description || "-"}
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <h4 className="font-semibold text-gray-800 mb-3">
                                    {t("current_status")}
                                  </h4>
                                  <div className="text-center">
                                    <span className="capitalize inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                      {r.status || "pending"}
                                    </span>
                                    <p className="text-xs text-gray-600 mt-1">
                                      {t("waiting_for_response")}
                                    </p>
                                  </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <h4 className="font-semibold text-gray-800 mb-3">
                                    {t("update_status")}
                                  </h4>
                                  <div className="space-y-3">
                                    <select
                                      value={
                                        exportStatusUpdate[r.id] ||
                                        r.status ||
                                        "pending"
                                      }
                                      onChange={(e) =>
                                        setExportStatusUpdate((prev) => ({
                                          ...prev,
                                          [r.id]: e.target.value as NonNullable<
                                            ExportRequest["status"]
                                          >,
                                        }))
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    >
                                      <option value="pending">
                                        {t("pending")}
                                      </option>
                                      <option value="in_review">
                                        {t("in_review")}
                                      </option>
                                      <option value="processed">
                                        {t("processed")}
                                      </option>
                                      <option value="rejected">
                                        {t("rejected")}
                                      </option>
                                    </select>
                                    <textarea
                                      value={
                                        exportAdminNotesUpdate[r.id] ??
                                        (r.admin_notes || "")
                                      }
                                      onChange={(e) =>
                                        setExportAdminNotesUpdate((prev) => ({
                                          ...prev,
                                          [r.id]: e.target.value,
                                        }))
                                      }
                                      rows={3}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                      placeholder={
                                        t("admin_notes") || "Admin notes"
                                      }
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleExportStatusSave(r)
                                        }
                                        className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
                                      >
                                        {t("save")}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        </>
      )}

      {activeTab === "export" && (
        <div className="mt-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <DocumentTextIcon className="h-6 w-6 mr-2 text-blue-600" />
              {t("export")}
            </h2>
            <button
              onClick={loadExportRequests}
              className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-50"
            >
              <ArrowPathIcon className="h-5 w-5 mr-1" />
              {t("refresh")}
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
            <div className="px-6 py-4 grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("status")}
                </label>
                <select
                  value={exportFilterStatus}
                  onChange={(e) => setExportFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">{t("all")}</option>
                  <option value="pending">{t("pending")}</option>
                  <option value="in_review">{t("in_review")}</option>
                  <option value="processed">{t("processed")}</option>
                  <option value="rejected">{t("rejected")}</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("search")}
                </label>
                <input
                  value={exportSearchTerm}
                  onChange={(e) => setExportSearchTerm(e.target.value)}
                  placeholder={t("search_placeholder")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">
                {t("all_requests")}
              </h3>
            </div>

            {exportLoading ? (
              <div className="p-6 text-center">
                <ArrowPathIcon className="h-6 w-6 mx-auto text-gray-400 animate-spin" />
                <p className="mt-2 text-gray-600">{t("loading")}</p>
              </div>
            ) : filteredExports.length === 0 ? (
              <div className="text-center py-12">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h4 className="mt-2 text-sm font-medium text-gray-900">
                  {t("no_requests_found")}
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  {t("no_requests_found")}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("company")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("product")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("status")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("created_at")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredExports.map((r, index) => (
                      <>
                        <tr key={r.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {r.company_name || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {r.product_name || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCurrencyStatusBadge(
                                r.status?.toLowerCase()
                              )}`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {r.created_at
                              ? new Date(r.created_at).toLocaleString()
                              : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() =>
                                toggleExportDetails(`export${index}`, r)
                              }
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                        <tr
                          id={`export${index}-details`}
                          className="hidden bg-blue-50"
                        >
                          <td className="px-6 py-4" colSpan={5}>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              <div className="lg:col-span-2 space-y-4">
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                    <svg
                                      className="w-5 h-5 mr-2 text-blue-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                      />
                                    </svg>
                                    {t("product_information")}
                                  </h4>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="font-medium">
                                        {t("company")}:
                                      </span>{" "}
                                      {r.company_name || "-"}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        {t("product")}:
                                      </span>{" "}
                                      {r.product_name || "-"}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        {t("status")}:
                                      </span>{" "}
                                      {r.status || "pending"}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        {t("created_at")}:
                                      </span>{" "}
                                      {r.created_at
                                        ? new Date(
                                            r.created_at
                                          ).toLocaleString()
                                        : "-"}
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                    <svg
                                      className="w-5 h-5 mr-2 text-purple-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                      />
                                    </svg>
                                    {t("attachments")}
                                  </h4>
                                  {(exportFilesMap[r.id] || []).length === 0 ? (
                                    <div className="text-gray-500 text-sm">
                                      {t("no_files") || "No files"}
                                    </div>
                                  ) : (
                                    <div className="flex gap-3 flex-wrap">
                                      {(exportFilesMap[r.id] || []).map(
                                        (file) => (
                                          <a
                                            key={file.id}
                                            href={
                                              ExportService.getFilePublicUrl(
                                                file.file_path
                                              ) || undefined
                                            }
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                                          >
                                            <svg
                                              className="w-4 h-4"
                                              fill="currentColor"
                                              viewBox="0 0 20 20"
                                            >
                                              <path
                                                fillRule="evenodd"
                                                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                                clipRule="evenodd"
                                              />
                                            </svg>
                                            {file.file_name}
                                          </a>
                                        )
                                      )}
                                    </div>
                                  )}
                                </div>

                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <h4 className="font-semibold text-gray-800 mb-3">
                                    {t("description")}
                                  </h4>
                                  <div className="text-gray-900 whitespace-pre-wrap">
                                    {r.product_description || "-"}
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <h4 className="font-semibold text-gray-800 mb-3">
                                    {t("current_status")}
                                  </h4>
                                  <div className="text-center">
                                    <span className="capitalize inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                      {r.status || "pending"}
                                    </span>
                                    <p className="text-xs text-gray-600 mt-1">
                                      {t("waiting_for_response")}
                                    </p>
                                  </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <h4 className="font-semibold text-gray-800 mb-3">
                                    {t("update_status")}
                                  </h4>
                                  <div className="space-y-3">
                                    <select
                                      value={
                                        exportStatusUpdate[r.id] ||
                                        r.status ||
                                        "pending"
                                      }
                                      onChange={(e) =>
                                        setExportStatusUpdate((prev) => ({
                                          ...prev,
                                          [r.id]: e.target.value as NonNullable<
                                            ExportRequest["status"]
                                          >,
                                        }))
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    >
                                      <option value="pending">
                                        {t("pending")}
                                      </option>
                                      <option value="in_review">
                                        {t("in_review")}
                                      </option>
                                      <option value="processed">
                                        {t("processed")}
                                      </option>
                                      <option value="rejected">
                                        {t("rejected")}
                                      </option>
                                    </select>
                                    <textarea
                                      value={
                                        exportAdminNotesUpdate[r.id] ??
                                        (r.admin_notes || "")
                                      }
                                      onChange={(e) =>
                                        setExportAdminNotesUpdate((prev) => ({
                                          ...prev,
                                          [r.id]: e.target.value,
                                        }))
                                      }
                                      rows={3}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                      placeholder={
                                        t("admin_notes") || "Admin notes"
                                      }
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleExportStatusSave(r)
                                        }
                                        className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
                                      >
                                        {t("save")}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Currency Transfer Section */}
      {activeTab === "currency" && (
        <div className="mt-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <CurrencyDollarIcon className="h-6 w-6 mr-2 text-green-600" />
              {t("currency_transfer")}
            </h2>
            <button
              onClick={loadCurrencyTransfers}
              className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-50"
            >
              <ArrowPathIcon className="h-5 w-5 mr-1" />
              {t("refresh")}
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
            <div className="px-6 py-4 grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("status")}
                </label>
                <select
                  value={currencyFilterStatus}
                  onChange={(e) => setCurrencyFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">{t("all")}</option>
                  <option value="pending">{t("pending")}</option>
                  <option value="in_review">{t("in_review")}</option>
                  <option value="processed">{t("processed")}</option>
                  <option value="rejected">{t("rejected")}</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("search")}
                </label>
                <input
                  value={currencySearchTerm}
                  onChange={(e) => setCurrencySearchTerm(e.target.value)}
                  placeholder={t("search_placeholder")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">
                {t("all_requests")}
              </h3>
            </div>

            {currencyLoading ? (
              <div className="p-6 text-center">
                <ArrowPathIcon className="h-6 w-6 mx-auto text-gray-400 animate-spin" />
                <p className="mt-2 text-gray-600">{t("loading")}</p>
              </div>
            ) : filteredCurrencyTransfers.length === 0 ? (
              <div className="text-center py-12">
                <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h4 className="mt-2 text-sm font-medium text-gray-900">
                  {t("no_requests_found")}
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  {t("no_requests_found")}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("type")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("amount")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("currencies")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("purpose")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("beneficiary")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("status")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("admin_notes")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("submitted")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCurrencyTransfers.map((tr, index) => (
                      <>
                        <tr key={tr.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {tr.transfer_type || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {tr.amount?.toLocaleString()} {tr.to_currency}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {tr.from_currency} → {tr.to_currency}
                          </td>
                          <td
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate"
                            title={tr.purpose}
                          >
                            {tr.purpose}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {tr.beneficiary_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCurrencyStatusBadge(
                                tr.status
                              )}`}
                            >
                              {tr.status}
                            </span>
                          </td>
                          <td
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate"
                            title={tr.admin_notes || ""}
                          >
                            {tr.admin_notes || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {tr.created_at
                              ? new Date(tr.created_at).toLocaleString()
                              : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() =>
                                toggleCurrencyDetails(`currency${index}`, tr)
                              }
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                        <tr
                          id={`currency${index}-details`}
                          className="hidden bg-blue-50"
                        >
                          <td className="px-6 py-4" colSpan={9}>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              <div className="lg:col-span-2 space-y-4">
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                    <svg
                                      className="w-5 h-5 mr-2 text-blue-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                      />
                                    </svg>
                                    {t("currency_transfer")}
                                  </h4>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="font-medium">
                                        {t("type")}:
                                      </span>{" "}
                                      {tr.transfer_type || "-"}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        {t("amount")}:
                                      </span>{" "}
                                      {tr.amount?.toLocaleString()}{" "}
                                      {tr.to_currency}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        {t("currencies")}:
                                      </span>{" "}
                                      {tr.from_currency} → {tr.to_currency}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        {t("submitted")}:
                                      </span>{" "}
                                      {tr.created_at
                                        ? new Date(
                                            tr.created_at
                                          ).toLocaleString()
                                        : "-"}
                                    </div>
                                    <div className="col-span-2">
                                      <span className="font-medium">
                                        {t("purpose")}:
                                      </span>{" "}
                                      {tr.purpose}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        {t("beneficiary")}:
                                      </span>{" "}
                                      {tr.beneficiary_name}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        {t("bank")}:
                                      </span>{" "}
                                      {tr.beneficiary_bank}
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <h4 className="font-semibold text-gray-800 mb-3">
                                    {t("customer_request")}
                                  </h4>
                                  <div className="text-gray-900 whitespace-pre-wrap">
                                    {tr.customer_request}
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <h4 className="font-semibold text-gray-800 mb-3">
                                    {t("current_status")}
                                  </h4>
                                  <div className="text-center">
                                    <span
                                      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getCurrencyStatusBadge(
                                        tr.status
                                      )}`}
                                    >
                                      {tr.status}
                                    </span>
                                    <p className="text-xs text-gray-600 mt-1">
                                      {t("waiting_for_response")}
                                    </p>
                                  </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <h4 className="font-semibold text-gray-800 mb-3">
                                    {t("update_status")}
                                  </h4>
                                  <div className="space-y-3">
                                    <select
                                      value={
                                        transferStatusUpdate[tr.id] ||
                                        tr.status ||
                                        "pending"
                                      }
                                      onChange={(e) =>
                                        setTransferStatusUpdate((prev) => ({
                                          ...prev,
                                          [tr.id]: e.target
                                            .value as NonNullable<
                                            CurrencyTransferRequest["status"]
                                          >,
                                        }))
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    >
                                      <option value="pending">
                                        {t("pending")}
                                      </option>
                                      <option value="in_review">
                                        {t("in_review")}
                                      </option>
                                      <option value="processed">
                                        {t("processed")}
                                      </option>
                                      <option value="rejected">
                                        {t("rejected")}
                                      </option>
                                    </select>
                                    <textarea
                                      value={
                                        transferAdminNotesUpdate[tr.id] ??
                                        (tr.admin_notes || "")
                                      }
                                      onChange={(e) =>
                                        setTransferAdminNotesUpdate((prev) => ({
                                          ...prev,
                                          [tr.id]: e.target.value,
                                        }))
                                      }
                                      rows={3}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                      placeholder={
                                        t("admin_notes") || "Admin notes"
                                      }
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleTransferStatusSave(tr)
                                        }
                                        className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
                                      >
                                        {t("save")}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentOrdersPage;
