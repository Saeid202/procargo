import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  ExportRequest,
  ExportRequestFile,
  ExportService,
} from "../../services/exportService";
import {
  ArrowPathIcon,
  DocumentTextIcon,
  EyeIcon,
  LinkIcon,
  PaperAirplaneIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const getStatusBadge = (status?: string | null) => {
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

const AgentExportPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [exportLoading, setExportLoading] = useState(false);
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
  const [exportResponseDraft, setExportResponseDraft] = useState<
    Record<string, string>
  >({});
  const [exportResponsePrice, setExportResponsePrice] = useState<
    Record<string, string>
  >({});
  const [exportResponseDelivery, setExportResponseDelivery] = useState<
    Record<string, string>
  >({});
  const [exportResponseSending, setExportResponseSending] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    if (user) {
      loadExportRequests();
    }
  }, [user]);

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
    return exportRequests.filter((request) => {
      const matchesStatus =
        exportFilterStatus === "all" || request.status === exportFilterStatus;
      const haystack = `${request.company_name || ""} ${
        request.company_type || ""
      } ${request.company_introduction || ""} ${request.product_name || ""} ${
        request.product_description || ""
      } ${request.additional_info || ""} ${request.admin_notes || ""}`.toLowerCase();
      const matchesSearch = haystack.includes(exportSearchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [exportRequests, exportFilterStatus, exportSearchTerm]);

  const openExportDetails = async (request: ExportRequest) => {
    try {
      const { files, error } = await ExportService.getExportRequestFiles(
        request.id
      );
      if (error) {
        console.error("Error loading files:", error);
        setExportFilesMap((prev) => ({ ...prev, [request.id]: [] }));
      } else {
        setExportFilesMap((prev) => ({ ...prev, [request.id]: files || [] }));
      }
    } catch (err) {
      console.error("Error loading files:", err);
      setExportFilesMap((prev) => ({ ...prev, [request.id]: [] }));
    } finally {
      setExportStatusUpdate((prev) =>
        prev[request.id]
          ? prev
          : {
              ...prev,
              [request.id]: (request.status || "pending") as NonNullable<
                ExportRequest["status"]
              >,
            }
      );
      setExportAdminNotesUpdate((prev) =>
        prev[request.id] !== undefined
          ? prev
          : { ...prev, [request.id]: request.admin_notes || "" }
      );
    }
  };

  const toggleExportDetails = async (rowId: string, request: ExportRequest) => {
    const element = document.getElementById(`${rowId}-details`);
    if (element) {
      const willOpen = element.classList.contains("hidden");
      element.classList.toggle("hidden");
      if (willOpen) {
        await openExportDetails(request);
      }
    }
  };

  const handleExportStatusSave = async (request: ExportRequest) => {
    try {
      const newStatus = (exportStatusUpdate[request.id] ||
        request.status ||
        "pending") as NonNullable<ExportRequest["status"]>;
      const notes = exportAdminNotesUpdate[request.id] ?? request.admin_notes ?? "";
      const { success, error } = await ExportService.updateExportStatus(
        request.id,
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

  const handleExportResponseSend = async (request: ExportRequest) => {
    if (!user?.id) {
      toast.error(t("please_login_to_continue") || "Please log in to continue.");
      return;
    }

    const draft = (exportResponseDraft[request.id] || "").trim();
    if (!draft) {
      toast.error(t("export_response_empty") || "Response message is required");
      return;
    }

    const priceRaw = (exportResponsePrice[request.id] || "").trim();
    let priceValue: number | null = null;
    if (priceRaw) {
      const parsed = Number(priceRaw);
      if (Number.isNaN(parsed)) {
        toast.error(
          t("export_response_price_invalid") || "Please enter a valid price"
        );
        return;
      }
      priceValue = parsed;
    }

    const deliveryValue = (exportResponseDelivery[request.id] || "").trim();

    setExportResponseSending((prev) => ({ ...prev, [request.id]: true }));
    try {
      const { error } = await ExportService.createExportResponse(
        request.id,
        user.id,
        {
          response: draft,
          price: priceValue,
          delivery_date: deliveryValue || null,
        }
      );
      if (error) {
        toast.error(
          t("export_response_error") || "Failed to send export response"
        );
      } else {
        toast.success(
          t("export_response_success") || "Response sent successfully"
        );
        setExportResponseDraft((prev) => {
          const next = { ...prev };
          delete next[request.id];
          return next;
        });
        setExportResponsePrice((prev) => {
          const next = { ...prev };
          delete next[request.id];
          return next;
        });
        setExportResponseDelivery((prev) => {
          const next = { ...prev };
          delete next[request.id];
          return next;
        });
        await loadExportRequests();
      }
    } catch (error) {
      console.error("Failed to send export response:", error);
      toast.error(
        t("export_response_error") || "Failed to send export response"
      );
    } finally {
      setExportResponseSending((prev) => {
        const next = { ...prev };
        delete next[request.id];
        return next;
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            {t("export")}
          </h1>
          <p className="text-sm text-gray-600">
            Manage export assistance requests submitted by customers.
          </p>
        </div>
        <button
          onClick={loadExportRequests}
          className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-50"
        >
          <ArrowPathIcon className="h-5 w-5 mr-1" />
          {t("refresh")}
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
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
                {filteredExports.map((request, index) => (
                  <React.Fragment key={request.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.company_name || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.product_name || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                            request.status
                          )}`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.created_at
                          ? new Date(request.created_at).toLocaleString()
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() =>
                            toggleExportDetails(`export${index}`, request)
                          }
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <EyeIcon className="w-5 h-5" />
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
                              <h4 className="font-semibold text-gray-800 mb-3">
                                {t("company_information")}
                              </h4>
                              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                                <div>
                                  <span className="font-medium">
                                    {t("company_name")}:
                                  </span>{" "}
                                  {request.company_name || "-"}
                                </div>
                                <div>
                                  <span className="font-medium">
                                    {t("company_type")}:
                                  </span>{" "}
                                  {request.company_type || "-"}
                                </div>
                                <div className="col-span-2">
                                  <span className="font-medium">
                                    {t("company_introduction")}:
                                  </span>{" "}
                                  {request.company_introduction || "-"}
                                </div>
                              </div>
                            </div>

                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h4 className="font-semibold text-gray-800 mb-3">
                                {t("product_details")}
                              </h4>
                              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                                <div>
                                  <span className="font-medium">
                                    {t("product")}:
                                  </span>{" "}
                                  {request.product_name || "-"}
                                </div>
                                <div>
                                  <span className="font-medium">
                                    {t("status")}:
                                  </span>{" "}
                                  <span
                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                                      request.status
                                    )}`}
                                  >
                                    {request.status}
                                  </span>
                                </div>
                                <div className="col-span-2">
                                  <span className="font-medium">
                                    {t("description")}:
                                  </span>{" "}
                                  {request.product_description || "-"}
                                </div>
                                <div className="col-span-2">
                                  <span className="font-medium">
                                    {t("additional_info")}:
                                  </span>{" "}
                                  {request.additional_info || "-"}
                                </div>
                              </div>
                            </div>

                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h4 className="font-semibold text-gray-800 mb-3">
                                {t("attachments")}
                              </h4>
                              <div className="space-y-2">
                                {(exportFilesMap[request.id] || []).length === 0 && (
                                  <p className="text-sm text-gray-500">
                                    {t("no_files")}
                                  </p>
                                )}
                                {(exportFilesMap[request.id] || []).map((file) => (
                                  <div
                                    key={file.id}
                                    className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg text-sm"
                                  >
                                    <div className="flex items-center gap-2 text-blue-600">
                                      <LinkIcon className="w-4 h-4" />
                                      <span className="truncate max-w-xs">
                                        {file.file_name}
                                      </span>
                                    </div>
                                    <a
                                      href={file.file_path}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                    >
                                      <EyeIcon className="w-4 h-4" />
                                      {t("view")}
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h4 className="font-semibold text-gray-800 mb-3">
                                {t("update_status")}
                              </h4>
                              <div className="space-y-3">
                                <select
                                  value={
                                    exportStatusUpdate[request.id] ||
                                    request.status ||
                                    "pending"
                                  }
                                  onChange={(e) =>
                                    setExportStatusUpdate((prev) => ({
                                      ...prev,
                                      [request.id]: e.target
                                        .value as NonNullable<
                                        ExportRequest["status"]
                                      >,
                                    }))
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                >
                                  <option value="pending">{t("pending")}</option>
                                  <option value="in_review">{t("in_review")}</option>
                                  <option value="processed">{t("processed")}</option>
                                  <option value="rejected">{t("rejected")}</option>
                                </select>
                                <textarea
                                  value={
                                    exportAdminNotesUpdate[request.id] ??
                                    (request.admin_notes || "")
                                  }
                                  onChange={(e) =>
                                    setExportAdminNotesUpdate((prev) => ({
                                      ...prev,
                                      [request.id]: e.target.value,
                                    }))
                                  }
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                  placeholder={t("admin_notes") || "Admin notes"}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleExportStatusSave(request)}
                                  className="w-full bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
                                >
                                  {t("save")}
                                </button>
                              </div>
                            </div>

                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-gray-800">
                                  {t("export_response_quick_title")}
                                </h4>
                                <button
                                  onClick={() =>
                                    toggleExportDetails(`export${index}`, request)
                                  }
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <XMarkIcon className="w-5 h-5" />
                                </button>
                              </div>
                              <textarea
                                value={exportResponseDraft[request.id] ?? ""}
                                onChange={(e) =>
                                  setExportResponseDraft((prev) => ({
                                    ...prev,
                                    [request.id]: e.target.value,
                                  }))
                                }
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                                placeholder={
                                  t("export_response_placeholder") ||
                                  "Type your response for the customer"
                                }
                              />
                              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <input
                                  type="number"
                                  value={exportResponsePrice[request.id] ?? ""}
                                  onChange={(e) =>
                                    setExportResponsePrice((prev) => ({
                                      ...prev,
                                      [request.id]: e.target.value,
                                    }))
                                  }
                                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                                  aria-label={t("export_response_price_label") || "Price"}
                                  placeholder={t("export_response_price_label") || "Price (USD)"}
                                />
                                <input
                                  type="date"
                                  value={exportResponseDelivery[request.id] ?? ""}
                                  onChange={(e) =>
                                    setExportResponseDelivery((prev) => ({
                                      ...prev,
                                      [request.id]: e.target.value,
                                    }))
                                  }
                                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                                  aria-label={t("export_response_delivery_label") || "Delivery date"}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleExportResponseSend(request)}
                                disabled={!!exportResponseSending[request.id]}
                                className="mt-3 flex items-center justify-center gap-2 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                {exportResponseSending[request.id] ? (
                                  <>
                                    <span className="h-4 w-4 rounded-full border-2 border-white border-b-transparent animate-spin" />
                                    {t("export_response_send") || "Send response"}
                                  </>
                                ) : (
                                  <>
                                    <PaperAirplaneIcon className="h-4 w-4" />
                                    {t("export_response_send") || "Send response"}
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentExportPage;
