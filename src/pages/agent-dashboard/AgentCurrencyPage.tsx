import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  CurrencyTransferRequest,
  CurrencyTransferResponse,
  CurrencyTransferService,
} from "../../services/currencyTransferService";
import {
  ArrowPathIcon,
  CurrencyDollarIcon,
  PaperAirplaneIcon,
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

const AgentCurrencyPage: React.FC = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  const [currencyLoading, setCurrencyLoading] = useState(false);
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
  const [transferResponsesMap, setTransferResponsesMap] = useState<
    Record<string, CurrencyTransferResponse[]>
  >({});
  const [transferResponseDraft, setTransferResponseDraft] = useState<
    Record<string, string>
  >({});
  const [transferResponseRate, setTransferResponseRate] = useState<
    Record<string, string>
  >({});
  const [transferResponseFee, setTransferResponseFee] = useState<
    Record<string, string>
  >({});
  const [transferResponseDelivery, setTransferResponseDelivery] = useState<
    Record<string, string>
  >({});
  const [transferResponseSending, setTransferResponseSending] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    if (user) {
      loadCurrencyTransfers();
    }
  }, [user]);

  const loadCurrencyTransfers = async () => {
    try {
      setCurrencyLoading(true);
      const { transfers, error } =
        await CurrencyTransferService.getAllTransfers();
      if (error) {
        console.error("Error loading currency transfers:", error);
        setCurrencyTransfers([]);
        return;
      }
      const list = transfers || [];
      setCurrencyTransfers(list);

      const transferIds = list
        .map((transfer) => transfer.id)
        .filter((value): value is string => Boolean(value));

      if (transferIds.length > 0) {
        const { responses, error: responsesError } =
          await CurrencyTransferService.getResponsesForTransfers(transferIds);
        if (responsesError) {
          console.error(
            "Error loading currency transfer responses:",
            responsesError
          );
        }
        const grouped = (responses || []).reduce(
          (acc, response) => {
            if (!response.transfer_id) {
              return acc;
            }
            if (!acc[response.transfer_id]) {
              acc[response.transfer_id] = [];
            }
            acc[response.transfer_id].push(response);
            return acc;
          },
          {} as Record<string, CurrencyTransferResponse[]>
        );
        setTransferResponsesMap(grouped);
      } else {
        setTransferResponsesMap({});
      }
    } catch (e) {
      console.error("Error loading currency transfers:", e);
      setCurrencyTransfers([]);
    } finally {
      setCurrencyLoading(false);
    }
  };

  const filteredCurrencyTransfers = useMemo(() => {
    return currencyTransfers.filter((transfer) => {
      const matchesStatus =
        currencyFilterStatus === "all" || transfer.status === currencyFilterStatus;
      const haystack = `${transfer.transfer_type} ${transfer.from_currency} ${
        transfer.to_currency
      } ${transfer.purpose} ${transfer.beneficiary_name} ${
        transfer.beneficiary_bank
      } ${transfer.customer_request} ${transfer.admin_notes || ""}`.toLowerCase();
      const matchesSearch = haystack.includes(currencySearchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [currencyTransfers, currencyFilterStatus, currencySearchTerm]);

  const toggleCurrencyDetails = async (
    rowId: string,
    transfer: CurrencyTransferRequest
  ) => {
    const element = document.getElementById(`${rowId}-details`);
    if (element) {
      const willOpen = element.classList.contains("hidden");
      element.classList.toggle("hidden");
      if (willOpen) {
        setTransferStatusUpdate((prev) =>
          prev[transfer.id]
            ? prev
            : {
                ...prev,
                [transfer.id]: (transfer.status || "pending") as NonNullable<
                  CurrencyTransferRequest["status"]
                >,
              }
        );
        setTransferAdminNotesUpdate((prev) =>
          prev[transfer.id] !== undefined
            ? prev
            : { ...prev, [transfer.id]: transfer.admin_notes || "" }
        );
      }
    }
  };

  const handleTransferStatusSave = async (transfer: CurrencyTransferRequest) => {
    try {
      const newStatus = (transferStatusUpdate[transfer.id] ||
        transfer.status ||
        "pending") as NonNullable<CurrencyTransferRequest["status"]>;
      const notes = transferAdminNotesUpdate[transfer.id] ?? transfer.admin_notes ?? "";
      const { success, error } =
        await CurrencyTransferService.updateTransferStatus(
          transfer.id,
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

  const sendCurrencyResponse = async (transfer: CurrencyTransferRequest) => {
    if (!user?.id) {
      toast.error(t("please_login_to_continue") || "Please log in to continue.");
      return;
    }

    const responseBody = (transferResponseDraft[transfer.id] || "").trim();
    if (!responseBody) {
      toast.error(
        t("currency_transfer_response_required") ||
          "Please enter a response before sending"
      );
      return;
    }

    const rateInput = transferResponseRate[transfer.id];
    const feeInput = transferResponseFee[transfer.id];
    const deliveryInput = transferResponseDelivery[transfer.id];

    const parsedRate =
      rateInput !== undefined && rateInput.trim() !== ""
        ? Number(rateInput)
        : undefined;
    if (parsedRate !== undefined && Number.isNaN(parsedRate)) {
      toast.error(
        t("currency_transfer_rate_invalid") || "Please enter a valid rate"
      );
      return;
    }

    const parsedFee =
      feeInput !== undefined && feeInput.trim() !== ""
        ? Number(feeInput)
        : undefined;
    if (parsedFee !== undefined && Number.isNaN(parsedFee)) {
      toast.error(
        t("currency_transfer_fee_invalid") || "Please enter a valid fee"
      );
      return;
    }

    setTransferResponseSending((prev) => ({ ...prev, [transfer.id]: true }));
    try {
      const { response, error } =
        await CurrencyTransferService.createTransferResponse(
          transfer.id,
          user.id,
          {
            response: responseBody,
            offered_rate: parsedRate,
            fee: parsedFee,
            delivery_date: deliveryInput
              ? new Date(deliveryInput).toISOString()
              : undefined,
          }
        );

      if (error || !response) {
        throw new Error(error || "Failed to send response");
      }

      toast.success(
        t("currency_transfer_response_success") ||
          "Currency transfer response sent"
      );

      setTransferResponsesMap((prev) => {
        const existing = prev[transfer.id] || [];
        return {
          ...prev,
          [transfer.id]: [response, ...existing],
        };
      });

      setTransferResponseDraft((prev) => {
        const next = { ...prev };
        delete next[transfer.id];
        return next;
      });
      setTransferResponseRate((prev) => {
        const next = { ...prev };
        delete next[transfer.id];
        return next;
      });
      setTransferResponseFee((prev) => {
        const next = { ...prev };
        delete next[transfer.id];
        return next;
      });
      setTransferResponseDelivery((prev) => {
        const next = { ...prev };
        delete next[transfer.id];
        return next;
      });
    } catch (error) {
      console.error("Failed to send currency transfer response:", error);
      toast.error(
        t("currency_transfer_response_error") ||
          "Failed to send currency transfer response"
      );
    } finally {
      setTransferResponseSending((prev) => ({
        ...prev,
        [transfer.id]: false,
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            {t("currency_transfer")}
          </h1>
          <p className="text-sm text-gray-600">
            Review and respond to customer currency transfer requests.
          </p>
        </div>
        <button
          onClick={loadCurrencyTransfers}
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
                {filteredCurrencyTransfers.map((transfer, index) => (
                  <React.Fragment key={transfer.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transfer.transfer_type || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transfer.amount?.toLocaleString()} {transfer.to_currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transfer.from_currency} → {transfer.to_currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                        {transfer.purpose}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transfer.beneficiary_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                            transfer.status
                          )}`}
                        >
                          {transfer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                        {transfer.admin_notes || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transfer.created_at
                          ? new Date(transfer.created_at).toLocaleString()
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() =>
                            toggleCurrencyDetails(`currency${index}`, transfer)
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
                              <h4 className="font-semibold text-gray-800 mb-3">
                                {t("currency_transfer")}
                              </h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">
                                    {t("type")}:
                                  </span>{" "}
                                  {transfer.transfer_type || "-"}
                                </div>
                                <div>
                                  <span className="font-medium">
                                    {t("amount")}:
                                  </span>{" "}
                                  {transfer.amount?.toLocaleString()}{" "}
                                  {transfer.to_currency}
                                </div>
                                <div>
                                  <span className="font-medium">
                                    {t("currencies")}:
                                  </span>{" "}
                                  {transfer.from_currency} → {transfer.to_currency}
                                </div>
                                <div>
                                  <span className="font-medium">
                                    {t("submitted")}:
                                  </span>{" "}
                                  {transfer.created_at
                                    ? new Date(transfer.created_at).toLocaleString(
                                        i18n.language
                                      )
                                    : "-"}
                                </div>
                                <div className="col-span-2">
                                  <span className="font-medium">
                                    {t("purpose")}:
                                  </span>{" "}
                                  {transfer.purpose}
                                </div>
                                <div>
                                  <span className="font-medium">
                                    {t("beneficiary")}:
                                  </span>{" "}
                                  {transfer.beneficiary_name}
                                </div>
                                <div>
                                  <span className="font-medium">
                                    {t("bank")}:
                                  </span>{" "}
                                  {transfer.beneficiary_bank}
                                </div>
                              </div>
                            </div>

                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h4 className="font-semibold text-gray-800 mb-3">
                                {t("customer_request")}
                              </h4>
                              <div className="text-gray-900 whitespace-pre-wrap">
                                {transfer.customer_request}
                              </div>
                            </div>

                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h4 className="font-semibold text-gray-800 mb-3">
                                {t("currency_transfer_responses")}
                              </h4>
                              <div className="space-y-4">
                                {(transferResponsesMap[transfer.id] || []).length === 0 ? (
                                  <p className="text-sm text-gray-500">
                                    {t("currency_transfer_no_responses")}
                                  </p>
                                ) : (
                                  (transferResponsesMap[transfer.id] || []).map(
                                    (response) => {
                                      const agentName = response.agent
                                        ? [
                                            response.agent.first_name,
                                            response.agent.last_name,
                                          ]
                                            .filter(Boolean)
                                            .join(" ") || response.agent.email
                                        : null;
                                      return (
                                        <div
                                          key={response.id}
                                          className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                                        >
                                          <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span className="font-medium text-gray-700">
                                              {agentName || t("agent")}
                                            </span>
                                            <span>
                                              {response.created_at
                                                ? new Date(
                                                    response.created_at
                                                  ).toLocaleString(i18n.language)
                                                : "-"}
                                            </span>
                                          </div>
                                          <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                                            {response.response}
                                          </p>
                                          <dl className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-600">
                                            {response.offered_rate !== null &&
                                              response.offered_rate !== undefined && (
                                                <div>
                                                  <dt className="font-medium text-gray-700">
                                                    {t("currency_transfer_rate_label") ||
                                                      "Offered rate"}
                                                  </dt>
                                                  <dd>{response.offered_rate}</dd>
                                                </div>
                                              )}
                                            {response.fee !== null &&
                                              response.fee !== undefined && (
                                                <div>
                                                  <dt className="font-medium text-gray-700">
                                                    {t("currency_transfer_fee_label") ||
                                                      "Service fee"}
                                                  </dt>
                                                  <dd>{response.fee}</dd>
                                                </div>
                                              )}
                                            {response.delivery_date && (
                                              <div>
                                                <dt className="font-medium text-gray-700">
                                                  {t("currency_transfer_delivery_label") ||
                                                    "Expected delivery"}
                                                </dt>
                                                <dd>
                                                  {new Date(
                                                    response.delivery_date
                                                  ).toLocaleDateString(i18n.language)}
                                                </dd>
                                              </div>
                                            )}
                                          </dl>
                                        </div>
                                      );
                                    }
                                  )
                                )}
                                <div className="border-t border-gray-200 pt-4">
                                  <h5 className="text-sm font-semibold text-gray-800 mb-2">
                                    {t("send_reply")}
                                  </h5>
                                  <textarea
                                    value={transferResponseDraft[transfer.id] ?? ""}
                                    onChange={(e) =>
                                      setTransferResponseDraft((prev) => ({
                                        ...prev,
                                        [transfer.id]: e.target.value,
                                      }))
                                    }
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder={
                                      t("currency_transfer_response_placeholder") ||
                                      "Share details for the customer"
                                    }
                                  />
                                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <input
                                      type="number"
                                      step="any"
                                      value={transferResponseRate[transfer.id] ?? ""}
                                      onChange={(e) =>
                                        setTransferResponseRate((prev) => ({
                                          ...prev,
                                          [transfer.id]: e.target.value,
                                        }))
                                      }
                                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      placeholder={
                                        t("currency_transfer_rate_placeholder") ||
                                        "Offered rate"
                                      }
                                    />
                                    <input
                                      type="number"
                                      step="any"
                                      value={transferResponseFee[transfer.id] ?? ""}
                                      onChange={(e) =>
                                        setTransferResponseFee((prev) => ({
                                          ...prev,
                                          [transfer.id]: e.target.value,
                                        }))
                                      }
                                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      placeholder={
                                        t("currency_transfer_fee_placeholder") ||
                                        "Service fee"
                                      }
                                    />
                                    <input
                                      type="date"
                                      value={transferResponseDelivery[transfer.id] ?? ""}
                                      onChange={(e) =>
                                        setTransferResponseDelivery((prev) => ({
                                          ...prev,
                                          [transfer.id]: e.target.value,
                                        }))
                                      }
                                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      placeholder={
                                        t("currency_transfer_delivery_placeholder") ||
                                        "Expected completion"
                                      }
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => sendCurrencyResponse(transfer)}
                                    disabled={!!transferResponseSending[transfer.id]}
                                    className="mt-3 inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                  >
                                    {transferResponseSending[transfer.id] ? (
                                      <>
                                        <span className="h-4 w-4 rounded-full border-2 border-white border-b-transparent animate-spin" />
                                        {t("sending") || "Sending"}
                                      </>
                                    ) : (
                                      <>
                                        <PaperAirplaneIcon className="h-4 w-4" />
                                        {t("send_reply")}
                                      </>
                                    )}
                                  </button>
                                </div>
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
                                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                                    transfer.status
                                  )}`}
                                >
                                  {transfer.status}
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
                                    transferStatusUpdate[transfer.id] ||
                                    transfer.status ||
                                    "pending"
                                  }
                                  onChange={(e) =>
                                    setTransferStatusUpdate((prev) => ({
                                      ...prev,
                                      [transfer.id]: e.target
                                        .value as NonNullable<
                                        CurrencyTransferRequest["status"]
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
                                    transferAdminNotesUpdate[transfer.id] ??
                                    (transfer.admin_notes || "")
                                  }
                                  onChange={(e) =>
                                    setTransferAdminNotesUpdate((prev) => ({
                                      ...prev,
                                      [transfer.id]: e.target.value,
                                    }))
                                  }
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                  placeholder={t("admin_notes") || "Admin notes"}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleTransferStatusSave(transfer)}
                                  className="w-full bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
                                >
                                  {t("save")}
                                </button>
                              </div>
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

export default AgentCurrencyPage;
