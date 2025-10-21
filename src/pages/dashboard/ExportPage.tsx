import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  ChangeEvent,
  FormEvent,
} from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import {
  ExportService,
  ExportRequest,
  ExportResponseRecord,
} from "../../services/exportService";
import { useAuth } from "../../contexts/AuthContext";
import { MessagingService } from "../../services/messagingService";
import { supabase } from "../../lib/supabase";
import {
  ChatBubbleLeftRightIcon,
  ClockIcon,
  DocumentPlusIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";

type ExportFormData = {
  companyName: string;
  companyType: string;
  companyIntroduction: string;
  productNames: string[];
  productDescription: string;
  additionalInfo: string;
};

type MessageTarget = {
  requestId: string;
  agentId: string;
  reference?: string;
};

interface CreateFormProps {
  isPersian: boolean;
  t: TFunction;
  formData: ExportFormData;
  onFieldChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onProductNameChange: (index: number, value: string) => void;
  onAddProductName: () => void;
  onRemoveProductName: (index: number) => void;
  selectedFiles: File[];
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  isSubmitting: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

interface ExportHistoryProps {
  user: any;
  t: TFunction;
  historyLoading: boolean;
  exportRequests: ExportRequest[];
  responsesByRequest: Map<string, ExportResponseRecord[]>;
  formatDate: (value?: string | null) => string;
  formatPrice: (value?: number | null) => string;
  onMessageAgent: (requestId: string, agentId?: string | null, reference?: string | null) => void;
}

interface MessageModalProps {
  t: TFunction;
  target: MessageTarget;
  draft: string;
  sending: boolean;
  onDraftChange: (value: string) => void;
  onClose: () => void;
  onSend: (event: FormEvent<HTMLFormElement>) => void;
}

const CreateExportForm: React.FC<CreateFormProps> = ({
  isPersian,
  t,
  formData,
  onFieldChange,
  onProductNameChange,
  onAddProductName,
  onRemoveProductName,
  selectedFiles,
  onFileChange,
  onRemoveFile,
  isSubmitting,
  onSubmit,
}) => {
  if (!isPersian) {
    return (
      <section className="max-w-3xl mx-auto bg-yellow-50 border border-yellow-200 text-center rounded-2xl p-8 text-yellow-800 shadow-sm">
        <h2 className="text-xl font-semibold mb-2">
          {t("export_form_language_notice_title")}
        </h2>
        <p className="text-sm">{t("export_form_language_notice_body")}</p>
      </section>
    );
  }

  return (
    <section className="max-w-4xl mx-auto space-y-6">
      <header className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">{t("export")}</h1>
        <p className="text-gray-600">
          صادرات و ارسال کالا به خارج از کشور
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 text-blue-800 space-y-3">
          <h2 className="text-lg font-semibold text-blue-900">
            خدمات صادرات و پشتیبانی ما
          </h2>
          <p>
            برای کمک به تولید کننده ها تسهیلاتی را فراهم نمودیم که شما
            می‌توانید با تکمیل این فرم و معرفی محصول خود، از کمک نماینده‌های ما
            در چین بهره‌مند شوید. نماینده ما اطلاعات شما را بررسی می‌کند تا
            ببیند چگونه می‌توانیم در زمینه صادرات همراهتان باشیم.
          </p>
          <p>
            لطفا فرم را کامل پر کنید و در قسمت توضیحات هر موردی که می‌تواند به
            شناخت بهتر شما و محصولتان کمک کند اضافه نمایید تا در اسرع وقت با شما
            تماس بگیریم.
          </p>
        </div>
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-6 text-orange-800 space-y-2">
          <h2 className="text-lg font-semibold text-orange-900">
            مراحل کار
          </h2>
          <ul className="space-y-1 text-sm">
            <li>• تکمیل فرم درخواست صادرات</li>
            <li>• بررسی اطلاعات توسط نماینده</li>
            <li>• ارائه راهنمایی و پیشنهاد</li>
            <li>• تماس و پیگیری در اسرع وقت</li>
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 text-yellow-800">
        <p className="font-semibold">
          توجه: ما فقط درخواست‌ها را از تولید کننده‌ها قبول می‌کنیم و
          شرکت‌های بازرگانی مشمول این خدمات نمی‌شوند.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6 bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <section className="space-y-4">
          <header className="text-lg font-semibold text-blue-900">
            1. معرفی شرکت صادراتی یا تولید کننده
          </header>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="space-y-2 text-sm">
              <span className="font-medium text-gray-700">نام شرکت *</span>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={onFieldChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                required
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium text-gray-700">نوع شرکت</span>
              <input
                type="text"
                name="companyType"
                value={formData.companyType}
                onChange={onFieldChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </label>
          </div>
          <label className="space-y-2 text-sm block">
            <span className="font-medium text-gray-700">معرفی شرکت</span>
            <textarea
              name="companyIntroduction"
              value={formData.companyIntroduction}
              onChange={onFieldChange}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
        </section>

        <section className="space-y-4">
          <header className="text-lg font-semibold text-green-900">
            2. نام محصولات
          </header>
          <div className="space-y-3">
            {formData.productNames.map((name, index) => (
              <div key={`product-${index}`} className="flex items-center gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    onProductNameChange(index, event.target.value)
                  }
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="نام محصول"
                  required
                />
                {formData.productNames.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveProductName(index)}
                    className="rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={onAddProductName}
              className="rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white"
            >
              افزودن محصول
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <header className="text-lg font-semibold text-purple-900">
            3. توضیحات محصول و اطلاعات تکمیلی
          </header>
          <label className="space-y-2 text-sm block">
            <span className="font-medium text-gray-700">توضیحات محصول</span>
            <textarea
              name="productDescription"
              value={formData.productDescription}
              onChange={onFieldChange}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="space-y-2 text-sm block">
            <span className="font-medium text-gray-700">توضیحات تکمیلی</span>
            <textarea
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={onFieldChange}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
        </section>

        <section className="space-y-3">
          <header className="text-lg font-semibold text-gray-900">
            4. فایل‌های ضمیمه
          </header>
          <input
            type="file"
            onChange={onFileChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
          {selectedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((file, index) => (
                <span
                  key={`${file.name}-${index}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700"
                >
                  {file.name}
                  <button
                    type="button"
                    onClick={() => onRemoveFile(index)}
                    className="text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60"
          >
            {isSubmitting ? t("loading") : t("submit_case")}
          </button>
        </div>
      </form>
    </section>
  );
};

const ExportHistory: React.FC<ExportHistoryProps> = ({
  user,
  t,
  historyLoading,
  exportRequests,
  responsesByRequest,
  formatDate,
  formatPrice,
  onMessageAgent,
}) => {
  if (!user) {
    return (
      <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
        <p>{t("please_login_to_continue")}</p>
      </div>
    );
  }

  if (historyLoading) {
    return (
      <div className="mt-6 space-y-4">
        {[0, 1].map((index) => (
          <div
            key={`export-skeleton-${index}`}
            className="rounded-2xl border border-white/10 bg-white/60 p-6 shadow-sm"
          >
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
            <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-gray-200" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, metaIndex) => (
                <div key={`export-meta-${metaIndex}`} className="space-y-2">
                  <div className="h-2 w-16 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
                </div>
              ))}
            </div>
            <div className="mt-6 h-24 animate-pulse rounded-xl bg-gray-100" />
          </div>
        ))}
      </div>
    );
  }

  if (exportRequests.length === 0) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-purple-200 bg-purple-50/70 px-6 py-12 text-center text-purple-700">
        <DocumentPlusIcon className="h-10 w-10" />
        <p className="text-sm font-semibold">{t("export_history_empty")}</p>
        <p className="text-xs text-purple-600">{t("export_history_empty_hint")}</p>
      </div>
    );
  }

  const statusBadgeClass = (status?: ExportRequest["status"]) => {
    switch (status) {
      case "processed":
        return "bg-green-100 text-green-700";
      case "in_review":
        return "bg-blue-100 text-blue-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const statusDotClass = (status?: ExportRequest["status"]) => {
    switch (status) {
      case "processed":
        return "bg-green-500";
      case "in_review":
        return "bg-blue-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  return (
    <div className="mt-6 space-y-6">
      {exportRequests.map((request, index) => {
        const requestKey = request.id ?? `export-${index}`;
        const responses = responsesByRequest.get(request.id ?? "") || [];
        const [latestResponse, ...olderResponses] = responses;
        const agentId =
          latestResponse?.agent_id ||
          olderResponses.find((response) => response.agent_id)?.agent_id ||
          null;
        const reference =
          request.product_name?.trim() ||
          request.company_name?.trim() ||
          request.id ||
          t("export_request_reference_placeholder");
        const priceText =
          typeof latestResponse?.price === "number"
            ? formatPrice(latestResponse.price)
            : null;
        const deliveryText = latestResponse?.delivery_date
          ? formatDate(latestResponse.delivery_date)
          : null;

        return (
          <article
            key={requestKey}
            className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500/0 via-purple-500 to-purple-500/0" />
            <div className="p-5 sm:p-6 space-y-6">
              <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-400">
                    <ClockIcon className="h-4 w-4 text-purple-500" />
                    {t("export_last_update")}:{" "}
                    {formatDate(request.updated_at || request.created_at)}
                  </div>
                  <h3 className="mt-1 text-lg font-semibold text-gray-900">
                    {reference}
                  </h3>
                  <dl className="mt-3 grid grid-cols-1 gap-3 text-sm text-gray-700 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {t("company")}
                      </dt>
                      <dd className="mt-1">{request.company_name || "-"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {t("product")}
                      </dt>
                      <dd className="mt-1">{request.product_name || "-"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {t("status")}
                      </dt>
                      <dd className="mt-1 capitalize">
                        {request.status ? t(request.status) : t("pending")}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-3">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(
                      request.status
                    )}`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${statusDotClass(
                        request.status
                      )}`}
                    />
                    {request.status ? t(request.status) : t("pending")}
                  </span>
                  <button
                    type="button"
                    onClick={() => onMessageAgent(requestKey, agentId, reference)}
                    disabled={!agentId}
                    title={
                      !agentId ? t("export_message_agent_unavailable") : undefined
                    }
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition ${
                      agentId
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "cursor-not-allowed bg-gray-200 text-gray-500"
                    }`}
                  >
                    <PaperAirplaneIcon className="h-4 w-4" />
                    {t("export_message_agent_button")}
                  </button>
                </div>
              </header>

              <section className="rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 via-white to-white p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                      <ChatBubbleLeftRightIcon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {t("export_latest_response")}
                      </p>
                      {latestResponse?.created_at && (
                        <p className="text-xs text-gray-500">
                          {t("export_response_at", {
                            date: formatDate(latestResponse.created_at),
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  {latestResponse && (
                    <div className="flex flex-wrap gap-2 text-xs text-purple-700">
                      {priceText && (
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 font-medium">
                          {t("export_response_price", { price: priceText })}
                        </span>
                      )}
                      {deliveryText && (
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 font-medium">
                          {t("export_response_delivery", {
                            deliveryDate: deliveryText,
                          })}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {latestResponse ? (
                  <p className="mt-4 whitespace-pre-line text-sm text-gray-700">
                    {latestResponse.response}
                  </p>
                ) : (
                  <div className="mt-4 rounded-lg border border-dashed border-purple-200 bg-purple-50/60 px-4 py-3 text-sm text-purple-700">
                    {t("export_no_response")}
                  </div>
                )}
              </section>

              {olderResponses.length > 0 && (
                <section className="space-y-4">
                  <p className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <ClockIcon className="h-4 w-4 text-purple-500" />
                    {t("export_responses_timeline")}
                  </p>
                  <div className="relative pl-5">
                    <div className="absolute left-1.5 top-2 bottom-2 w-px bg-purple-100" />
                    <div className="space-y-4">
                      {olderResponses.map((response) => {
                        const priceTimelineText =
                          typeof response.price === "number"
                            ? formatPrice(response.price)
                            : null;
                        const deliveryTimelineText = response.delivery_date
                          ? formatDate(response.delivery_date)
                          : null;
                        return (
                          <div key={response.id} className="relative pl-4">
                            <span className="absolute left-[-14px] top-3 h-3 w-3 rounded-full border-2 border-purple-400 bg-white" />
                            <div className="rounded-xl border border-purple-100 bg-white p-4 shadow-sm space-y-3">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
                                  {formatDate(response.created_at)}
                                </p>
                                <div className="flex flex-wrap gap-2 text-xs text-purple-600">
                                  {priceTimelineText && (
                                    <span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 font-medium">
                                      {t("export_response_price", {
                                        price: priceTimelineText,
                                      })}
                                    </span>
                                  )}
                                  {deliveryTimelineText && (
                                    <span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 font-medium">
                                      {t("export_response_delivery", {
                                        deliveryDate: deliveryTimelineText,
                                      })}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {response.response && (
                                <p className="whitespace-pre-line text-sm text-gray-600">
                                  {response.response}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
};

const MessageModal: React.FC<MessageModalProps> = ({
  t,
  target,
  draft,
  sending,
  onDraftChange,
  onClose,
  onSend,
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
    onClick={onClose}
  >
    <div
      className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t("export_message_agent_title")}
          </h3>
          {target.reference && (
            <p className="mt-1 text-xs text-gray-500">
              {t("export_message_agent_about_request", {
                reference: target.reference,
              })}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={sending}
          className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed"
        >
          ×
        </button>
      </div>
      <form onSubmit={onSend} className="space-y-4 px-6 py-5">
        <p className="text-sm text-gray-600">
          {t("export_message_agent_instruction")}
        </p>
        <textarea
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          rows={6}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:cursor-not-allowed disabled:bg-gray-100"
          placeholder={t("export_message_agent_placeholder")}
          disabled={sending}
        />
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed"
          >
            {t("export_message_agent_cancel")}
          </button>
          <button
            type="submit"
            disabled={sending}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-purple-400"
          >
            {sending ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-b-transparent" />
                {t("export_message_agent_send")}
              </span>
            ) : (
              <>
                <PaperAirplaneIcon className="h-4 w-4" />
                {t("export_message_agent_send")}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
);

const ExportPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isPersian = i18n.language === "fa" || i18n.language === "fa-IR";

  const [mainTab, setMainTab] = useState<"create" | "history">("create");
  const [formData, setFormData] = useState<ExportFormData>({
    companyName: "",
    companyType: "",
    companyIntroduction: "",
    productNames: [""],
    productDescription: "",
    additionalInfo: "",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [historyLoading, setHistoryLoading] = useState(false);
  const [exportRequests, setExportRequests] = useState<ExportRequest[]>([]);
  const [exportResponses, setExportResponses] = useState<ExportResponseRecord[]>([]);
  const [messageTarget, setMessageTarget] = useState<MessageTarget | null>(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [messageSending, setMessageSending] = useState(false);

  const formatDate = useCallback(
    (value?: string | null) => {
      if (!value) {
        return "-";
      }
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return "-";
      }
      return date.toLocaleDateString(i18n.language, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
    [i18n.language]
  );

  const formatPrice = useCallback(
    (value?: number | null) => {
      if (typeof value !== "number") {
        return "";
      }
      return new Intl.NumberFormat(i18n.language, {
        maximumFractionDigits: 2,
      }).format(value);
    },
    [i18n.language]
  );

  const responsesByRequest = useMemo(() => {
    const map = new Map<string, ExportResponseRecord[]>();
    exportResponses.forEach((response) => {
      if (!response.export_request_id) {
        return;
      }
      if (!map.has(response.export_request_id)) {
        map.set(response.export_request_id, []);
      }
      map.get(response.export_request_id)!.push(response);
    });
    map.forEach((entries) => {
      entries.sort(
        (a, b) =>
          new Date(b.created_at || "").getTime() -
          new Date(a.created_at || "").getTime()
      );
    });
    return map;
  }, [exportResponses]);

  const fetchUserExportHistory = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      setHistoryLoading(true);
      const { exports, error } = await ExportService.getExportRequestsByUser(user.id);
      if (error) {
        console.error("Failed to load export requests", error);
        setExportRequests([]);
        setExportResponses([]);
        return;
      }

      setExportRequests(exports || []);
      const requestIds = (exports || [])
        .map((item) => item.id)
        .filter((id): id is string => Boolean(id));

      if (requestIds.length > 0) {
        const { responses, error: responseError } =
          await ExportService.getExportResponsesByRequestIds(requestIds);
        if (responseError) {
          console.error("Failed to load export responses", responseError);
          setExportResponses([]);
        } else {
          setExportResponses(responses || []);
        }
      } else {
        setExportResponses([]);
      }
    } catch (error) {
      console.error("Unexpected error loading export history", error);
    } finally {
      setHistoryLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && mainTab === "history") {
      fetchUserExportHistory();
    }
  }, [user, mainTab, fetchUserExportHistory]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const channel = supabase
      .channel(`user-export-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "export_requests",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          if (mainTab === "history") {
            fetchUserExportHistory();
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "export_response",
        },
        () => {
          if (mainTab === "history") {
            fetchUserExportHistory();
          }
        }
      );

    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, mainTab, fetchUserExportHistory]);

  const handleFieldChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = event.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  const handleProductNameChange = useCallback((index: number, value: string) => {
    setFormData((prev) => {
      const nextNames = [...prev.productNames];
      nextNames[index] = value;
      return { ...prev, productNames: nextNames };
    });
  }, []);

  const addProductName = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      productNames: [...prev.productNames, ""],
    }));
  }, []);

  const removeProductName = useCallback((index: number) => {
    setFormData((prev) => {
      const nextNames = prev.productNames.filter((_, i) => i !== index);
      return { ...prev, productNames: nextNames.length ? nextNames : [""] };
    });
  }, []);

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const files = event.currentTarget.files;
    if (files && files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...Array.from(files)]);
      event.currentTarget.value = "";
    }
  }, []);

  const removeSelectedFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsSubmitting(true);

      try {
        if (!user) {
          console.error("No user authenticated");
          setIsSubmitting(false);
          return;
        }

        const cleanedProductNames = formData.productNames
          .map((p) => p.trim())
          .filter((p) => p.length > 0);
        if (cleanedProductNames.length === 0) {
          alert(t("export_validation_product_name"));
          setIsSubmitting(false);
          return;
        }

        const { export: exportRequest, error: exportError } =
          await ExportService.createExportRequest(user.id, {
            company_name: formData.companyName,
            company_type: formData.companyType,
            company_introduction: formData.companyIntroduction,
            product_name: cleanedProductNames.join(", "),
            product_description: formData.productDescription,
            additional_info: formData.additionalInfo,
          });

        if (exportError || !exportRequest) {
          console.error("Error creating export request:", exportError);
          setIsSubmitting(false);
          return;
        }

        for (const file of selectedFiles) {
          const { error: fileError } = await ExportService.uploadFile(
            user.id,
            exportRequest.id,
            file
          );
          if (fileError) {
            console.error(`Failed to upload ${file.name}:`, fileError);
          }
        }

        alert(t("export_submission_success"));

        setFormData({
          companyName: "",
          companyType: "",
          companyIntroduction: "",
          productNames: [""],
          productDescription: "",
          additionalInfo: "",
        });
        setSelectedFiles([]);
        if (mainTab !== "history") {
          setMainTab("history");
        }
        await fetchUserExportHistory();
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchUserExportHistory, formData, mainTab, selectedFiles, t, user]
  );

  const handleMessageAgent = useCallback(
    (requestId: string, agentId?: string | null, reference?: string | null) => {
      if (!agentId) {
        alert(t("export_message_agent_unavailable"));
        return;
      }

      const prefill = reference
        ? t("export_message_agent_default", { reference })
        : "";
      setMessageDraft(prefill);
      setMessageTarget({
        requestId,
        agentId,
        reference: reference || undefined,
      });
    },
    [t]
  );

  const closeMessageModal = useCallback(() => {
    if (messageSending) {
      return;
    }
    setMessageTarget(null);
    setMessageDraft("");
  }, [messageSending]);

  const handleSendAgentMessage = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!messageTarget) {
        return;
      }

      const body = messageDraft.trim();
      if (!body) {
        alert(t("export_message_agent_empty"));
        return;
      }

      try {
        setMessageSending(true);
        const { data: thread, error: threadError } =
          await MessagingService.createOrGetDirectThread(messageTarget.agentId);
        if (threadError || !thread) {
          throw threadError || new Error("Thread creation failed");
        }

        const { error: sendError } = await MessagingService.sendMessage(
          thread.id,
          body
        );
        if (sendError) {
          throw sendError;
        }

        alert(t("export_message_agent_success"));
        setMessageDraft("");
        setMessageTarget(null);
      } catch (error) {
        console.error("Failed to send export message", error);
        alert(t("export_message_agent_error"));
      } finally {
        setMessageSending(false);
      }
    },
    [messageDraft, messageTarget, t]
  );

  return (
    <div className="p-6 space-y-6">
      <div
        role="tablist"
        className="flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-white/60 p-3 shadow-sm backdrop-blur-sm"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mainTab === "create"}
          onClick={() => setMainTab("create")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            mainTab === "create"
              ? "bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-lg"
              : "bg-white text-gray-600 border border-white/40 hover:border-purple-200"
          }`}
        >
          {t("export_tab_create")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mainTab === "history"}
          onClick={() => setMainTab("history")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            mainTab === "history"
              ? "bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-lg"
              : "bg-white text-gray-600 border border-white/40 hover:border-purple-200"
          }`}
        >
          {t("export_tab_history")}
        </button>
      </div>

      {mainTab === "create" && (
        <CreateExportForm
          isPersian={isPersian}
          t={t}
          formData={formData}
          onFieldChange={handleFieldChange}
          onProductNameChange={handleProductNameChange}
          onAddProductName={addProductName}
          onRemoveProductName={removeProductName}
          selectedFiles={selectedFiles}
          onFileChange={handleFileChange}
          onRemoveFile={removeSelectedFile}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      )}

      {mainTab === "history" && (
        <section className="rounded-2xl border border-white/10 bg-white/60 p-6 shadow-xl backdrop-blur-sm">
          <header className="space-y-1">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("export_history_title")}
            </h2>
            <p className="text-sm text-gray-500">
              {t("export_history_description")}
            </p>
          </header>

          <ExportHistory
            user={user}
            t={t}
            historyLoading={historyLoading}
            exportRequests={exportRequests}
            responsesByRequest={responsesByRequest}
            formatDate={formatDate}
            formatPrice={formatPrice}
            onMessageAgent={handleMessageAgent}
          />
        </section>
      )}

      {messageTarget && (
        <MessageModal
          t={t}
          target={messageTarget}
          draft={messageDraft}
          sending={messageSending}
          onDraftChange={setMessageDraft}
          onClose={closeMessageModal}
          onSend={handleSendAgentMessage}
        />
      )}
    </div>
  );
};

export default ExportPage;
