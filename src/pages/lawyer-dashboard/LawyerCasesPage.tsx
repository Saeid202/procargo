import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

import { CaseData, SupabaseService } from "../../services/supabaseService";
import { cn } from "../../utils/cn";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Loading from "../../components/ui/Loading";

const LawyerCasesPage: React.FC = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState<CaseData[]>([]);
  const [casesLoading, setCasesLoading] = useState(false);
  const [creatingResponse, setCreatingResponse] = useState(false);
  const [caseStatusUpdate, setCaseStatusUpdate] = useState<
    Record<string, NonNullable<CaseData["status"]>>
  >({});
  const [updatingCaseStatus, setUpdatingCaseStatus] = useState<
    Record<string, boolean>
  >({});
  const [caseResponse, setCaseResponse] = useState<string>("");
  const [caseQuickPrice, setCaseQuickPrice] = useState<number>(0);
  const [caseQuickDeliveryDate, setCaseQuickDeliveryDate] =
    useState<string>("");
  const { t } = useTranslation();

  const loadCases = async () => {
    try {
      setCasesLoading(true);
      const { cases, error } = await SupabaseService.getCases();

      if (error) {
        console.error("Exception loading cases:", error);
        toast.error("Error loading cases");
      } else {
        setCases(cases || []);
      }
    } catch (err) {
      console.error("Exception loading cases:", err);
      toast.error("Exception loading cases");
    } finally {
      setCasesLoading(false);
    }
  };

  const toggleCaseDetails = (
    caseIdKey: string,
    caseId?: string,
    status?: CaseData["status"]
  ) => {
    const isMobile = window.innerWidth < 1024;
    const caseDetails = document.getElementById(
      `${caseIdKey}-details${isMobile ? "-mobile" : ""}`
    );

    if (caseDetails) {
      caseDetails.classList.toggle("hidden");
      if (caseId) {
        setCaseStatusUpdate((prev) =>
          prev[caseId]
            ? prev
            : {
                ...prev,
                [caseId]: (status || "SUBMITTED") as NonNullable<
                  CaseData["status"]
                >,
              }
        );
      }
    }
  };

  useEffect(() => {
    if (user) {
      loadCases();
    }
  }, [user]);

  const createCaseResponse = async (caseId: string) => {
    setCreatingResponse(true);
    const { error } = await SupabaseService.createCaseResponse(
      caseId,
      user?.id as string,
      {
        response: caseResponse,
        price: caseQuickPrice,
        delivery_date: !!caseQuickDeliveryDate
          ? caseQuickDeliveryDate
          : new Date().toISOString(),
      }
    );
    if (error) {
      console.error("Exception creating case response:", error);
      toast.error("Exception creating case response");
    } else {
      toast.success("Case response created successfully");
      await loadCases();
    }
    setCreatingResponse(false);
  };

  const handleCaseStatusSave = async (caseData: CaseData) => {
    try {
      const newStatus = (caseStatusUpdate[caseData.id!] ||
        caseData.status ||
        "SUBMITTED") as NonNullable<CaseData["status"]>;
      setUpdatingCaseStatus((prev) => ({ ...prev, [caseData.id!]: true }));
      const { case: updated, error } = await SupabaseService.updateCaseStatus(
        caseData.id!,
        newStatus
      );
      if (error) {
        toast.error("Failed to update case status");
      } else {
        toast.success("Case status updated successfully");
        await loadCases();
      }
    } catch (err) {
      console.error("Exception updating case status:", err);
      toast.error("Exception updating case status");
    } finally {
      setUpdatingCaseStatus((prev) => ({ ...prev, [caseData.id!]: false }));
    }
  };
  if (casesLoading) {
    return <Loading />;
  }

  return (
    <div id="orders" className="tab-content">
      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("subject")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("plaintiff")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("defendant")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("status")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("created")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("actions")}
              </th>
            </tr>
          </thead>
          <tbody
            className="bg-white divide-y divide-gray-200"
            id="orderTableBody"
          >
            {cases.map((caseData, index) => (
              <>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {caseData.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {caseData.plaintiff_type}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {caseData.defendant_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={cn(
                        "capitalize inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        caseData.status === "SUBMITTED"
                          ? "bg-red-100 text-red-800"
                          : caseData.status === "IN_REVIEW"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      )}
                    >
                      {caseData.status?.replace("-", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {caseData.created_at
                      ? new Date(caseData.created_at).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "long", day: "numeric" }
                        )
                      : ""}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() =>
                        toggleCaseDetails(
                          `caseData${index}`,
                          caseData.id!,
                          caseData.status
                        )
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
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
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
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
                <tr
                  id={`caseData${index}-details`}
                  className={cn(
                    "hidden",
                    caseData.status === "SUBMITTED"
                      ? "bg-blue-50"
                      : caseData.status === "IN_REVIEW"
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
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                              />
                            </svg>
                            {t("case_information")}
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">
                                {t("plaintiff_type")}:
                              </span>{" "}
                              {caseData.plaintiff_type}
                            </div>
                            <div>
                              <span className="font-medium">
                                {t("defendant_name")}:
                              </span>{" "}
                              {caseData.defendant_name}
                            </div>
                            <div>
                              <span className="font-medium">
                                {t("subject")}:
                              </span>{" "}
                              {caseData.subject}
                            </div>
                            <div>
                              <span className="font-medium">
                                {t("description")}:
                              </span>{" "}
                              {caseData.description}
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
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                              />
                            </svg>
                            {t("attachments")}
                          </h4>
                          {caseData?.case_documents?.map(
                            (caseDocument, docIndex) => (
                              <div key={docIndex} className="flex gap-3">
                                <a
                                  href={caseDocument.file_url}
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
                                  {caseDocument.file_name}
                                </a>
                              </div>
                            )
                          )}
                        </div>
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
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {t("current_status")}
                          </h4>
                          <div className="text-center">
                            <span
                              className={cn(
                                "capitalize inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                                caseData.status === "SUBMITTED"
                                  ? "bg-red-100 text-red-800"
                                  : caseData.status === "IN_REVIEW"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              )}
                            >
                              {caseData.status?.replace("-", " ")}
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
                                caseStatusUpdate[caseData.id!] ||
                                caseData.status ||
                                "SUBMITTED"
                              }
                              onChange={(e) =>
                                setCaseStatusUpdate((prev) => ({
                                  ...prev,
                                  [caseData.id!]: e.target.value as NonNullable<
                                    CaseData["status"]
                                  >,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                              <option value="SUBMITTED">
                                {t("submitted") || "Submitted"}
                              </option>
                              <option value="IN_REVIEW">
                                {t("in_review") || "In Review"}
                              </option>
                              <option value="NEED_MORE_INFO">
                                {t("need_more_info")}
                              </option>
                              <option value="RESOLVED">
                                {t("resolved") || "Resolved"}
                              </option>
                              <option value="CLOSED">
                                {t("closed") || "Closed"}
                              </option>
                              <option value="REJECTED">
                                {t("rejected") || "Rejected"}
                              </option>
                              <option value="COMPLETED">
                                {t("completed") || "Completed"}
                              </option>
                            </select>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleCaseStatusSave(caseData)}
                                disabled={!!updatingCaseStatus[caseData.id!]}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                                  updatingCaseStatus[caseData.id!]
                                    ? "bg-green-400 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-700"
                                } text-white flex items-center justify-center gap-2`}
                              >
                                {updatingCaseStatus[caseData.id!] && (
                                  <svg
                                    className="animate-spin h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a12 12 0 100 8z"
                                    ></path>
                                  </svg>
                                )}
                                {t("save")}
                              </button>
                            </div>
                          </div>
                        </div>

                        {caseData.status === "COMPLETED" ? (
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                              <svg
                                className="w-5 h-5 mr-2 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                              </svg>
                              {t("lawyer_notes")}
                            </h4>
                            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                              {t("case_successfully_completed")}
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
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                              </svg>
                              {t("quick_response")}
                            </h4>
                            <div className="space-y-3">
                              <textarea
                                placeholder={t("type_your_response")}
                                rows={3}
                                value={caseResponse}
                                onChange={(e) =>
                                  setCaseResponse(e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                              ></textarea>
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="number"
                                  placeholder={t("price_dollar")}
                                  value={caseQuickPrice}
                                  onChange={(e) =>
                                    setCaseQuickPrice(Number(e.target.value))
                                  }
                                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                                <input
                                  type="date"
                                  value={caseQuickDeliveryDate}
                                  onChange={(e) =>
                                    setCaseQuickDeliveryDate(e.target.value)
                                  }
                                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    createCaseResponse(caseData.id!)
                                  }
                                  disabled={creatingResponse}
                                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                                    creatingResponse
                                      ? "bg-blue-400 cursor-not-allowed"
                                      : "bg-blue-600 hover:bg-blue-700"
                                  } text-white flex items-center justify-center gap-2`}
                                >
                                  {creatingResponse && (
                                    <svg
                                      className="animate-spin h-4 w-4 text-white"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a12 12 0 100 8z"
                                      ></path>
                                    </svg>
                                  )}
                                  {t("send_reply")}
                                </button>
                              </div>
                            </div>
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

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {cases.map((caseData, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow border border-gray-200"
          >
            {/* Case Card Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {caseData.subject}
                </h3>
                <div className="flex gap-2 ml-3">
                  <button
                    onClick={() =>
                      toggleCaseDetails(
                        `caseData${index}`,
                        caseData.id!,
                        caseData.status
                      )
                    }
                    className="text-blue-600 hover:text-blue-900 p-1"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <button className="text-green-600 hover:text-green-900 p-1">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("plaintiff")}:</span>
                  <span className="font-medium text-gray-900">
                    {caseData.plaintiff_type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("defendant")}:</span>
                  <span className="font-medium text-gray-900">
                    {caseData.defendant_name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">{t("created")}:</span>
                  <span className="font-medium text-gray-900">
                    {caseData.created_at
                      ? new Date(caseData.created_at).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "short", day: "numeric" }
                        )
                      : ""}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex justify-center">
                <span
                  className={cn(
                    "capitalize inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                    caseData.status === "SUBMITTED"
                      ? "bg-red-100 text-red-800"
                      : caseData.status === "IN_REVIEW"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  )}
                >
                  {caseData.status?.replace("-", " ")}
                </span>
              </div>
            </div>

            {/* Case Details (Expandable) */}
            <div
              id={`caseData${index}-details-mobile`}
              className={cn(
                "hidden",
                caseData.status === "SUBMITTED"
                  ? "bg-blue-50"
                  : caseData.status === "IN_REVIEW"
                  ? "bg-yellow-50"
                  : "bg-green-50"
              )}
            >
              <div className="p-4 space-y-4">
                {/* Case Information */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    {t("case_information")}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">
                        {t("plaintiff_type")}:
                      </span>{" "}
                      <span className="text-gray-600">
                        {caseData.plaintiff_type}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        {t("defendant_name")}:
                      </span>{" "}
                      <span className="text-gray-600">
                        {caseData.defendant_name}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        {t("subject")}:
                      </span>{" "}
                      <span className="text-gray-600">{caseData.subject}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        {t("description")}:
                      </span>{" "}
                      <span className="text-gray-600">
                        {caseData.description}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Attachments */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      />
                    </svg>
                    {t("attachments")}
                  </h4>
                  <div className="space-y-2">
                    {caseData?.case_documents?.map((caseDocument, docIndex) => (
                      <a
                        key={docIndex}
                        href={caseDocument.file_url}
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
                        {caseDocument.file_name}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {t("current_status")}
                  </h4>
                  <div className="text-center mb-4">
                    <span
                      className={cn(
                        "capitalize inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                        caseData.status === "SUBMITTED"
                          ? "bg-red-100 text-red-800"
                          : caseData.status === "IN_REVIEW"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      )}
                    >
                      {caseData.status?.replace("-", " ")}
                    </span>
                    <p className="text-xs text-gray-600 mt-1">
                      {t("waiting_for_response")}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h5 className="font-semibold text-gray-800 mb-3">
                      {t("update_status")}
                    </h5>
                    <div className="space-y-3">
                      <select
                        value={
                          caseStatusUpdate[caseData.id!] ||
                          caseData.status ||
                          "SUBMITTED"
                        }
                        onChange={(e) =>
                          setCaseStatusUpdate((prev) => ({
                            ...prev,
                            [caseData.id!]: e.target.value as NonNullable<
                              CaseData["status"]
                            >,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="SUBMITTED">
                          {t("submitted") || "Submitted"}
                        </option>
                        <option value="IN_REVIEW">
                          {t("in_review") || "In Review"}
                        </option>
                        <option value="NEED_MORE_INFO">
                          {t("need_more_info")}
                        </option>
                        <option value="RESOLVED">
                          {t("resolved") || "Resolved"}
                        </option>
                        <option value="CLOSED">
                          {t("closed") || "Closed"}
                        </option>
                        <option value="REJECTED">
                          {t("rejected") || "Rejected"}
                        </option>
                        <option value="COMPLETED">
                          {t("completed") || "Completed"}
                        </option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleCaseStatusSave(caseData)}
                        disabled={!!updatingCaseStatus[caseData.id!]}
                        className={`w-full px-3 py-2 rounded-lg text-sm font-medium ${
                          updatingCaseStatus[caseData.id!]
                            ? "bg-green-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                        } text-white flex items-center justify-center gap-2`}
                      >
                        {updatingCaseStatus[caseData.id!] && (
                          <svg
                            className="animate-spin h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a12 12 0 100 8z"
                            ></path>
                          </svg>
                        )}
                        {t("save")}
                      </button>
                    </div>
                  </div>

                  {caseData.status === "COMPLETED" ? (
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-2 flex items-center">
                        <svg
                          className="w-4 h-4 mr-2 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        {t("lawyer_notes")}
                      </h5>
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {t("case_successfully_completed")}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <svg
                          className="w-4 h-4 mr-2 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        {t("quick_response")}
                      </h5>
                      <div className="space-y-3">
                        <textarea
                          placeholder={t("type_your_response")}
                          value={caseResponse}
                          onChange={(e) => setCaseResponse(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                        ></textarea>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            placeholder={t("price_dollar")}
                            value={caseQuickPrice}
                            onChange={(e) =>
                              setCaseQuickPrice(Number(e.target.value))
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                          <input
                            value={caseQuickDeliveryDate}
                            onChange={(e) =>
                              setCaseQuickDeliveryDate(e.target.value)
                            }
                            type="date"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => createCaseResponse(caseData.id!)}
                            disabled={creatingResponse}
                            className={`w-full px-3 py-2 rounded-lg text-sm font-medium ${
                              creatingResponse
                                ? "bg-blue-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                            } text-white flex items-center justify-center gap-2`}
                          >
                            {creatingResponse && (
                              <svg
                                className="animate-spin h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a12 12 0 100 8z"
                                ></path>
                              </svg>
                            )}
                            {t("send_reply")}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LawyerCasesPage;
