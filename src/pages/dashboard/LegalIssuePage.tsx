import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "../../utils/cn";
import {
  MinusIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  DocumentPlusIcon,
  PaperAirplaneIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Loading from "../../components/ui/Loading";
import {
  CaseData,
  CaseResponse,
  SupabaseService,
} from "../../services/supabaseService";
import { MessagingService } from "../../services/messagingService";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";

export interface DocumentFiles {
  contract: File[];
  proforma: File[];
  receipt: File[];
  shipping: File[];
  other: File[];
}

export interface CaseDetails {
  plaintiff_type: "company" | "individual";
  headquarter: string;
  defendant_name: string;
  subject: string;
  description: string;
}

const LegalIssuePage = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("case-details");
  const [caseDetails, setCaseDetails] = useState<CaseDetails>({
    plaintiff_type: "company",
    headquarter: "",
    defendant_name: "",
    subject: "",
    description: "",
  });
  const [documnetFiles, setDocumnetFiles] = useState<DocumentFiles>({
    contract: [new File([], "")],
    proforma: [new File([], "")],
    receipt: [new File([], "")],
    shipping: [new File([], "")],
    other: [new File([], "")],
  });
  const [userCases, setUserCases] = useState<CaseData[]>([]);
  const [userCaseResponses, setUserCaseResponses] = useState<CaseResponse[]>([]);
  const [casesLoading, setCasesLoading] = useState(false);
  const [mainTab, setMainTab] = useState<"create" | "history">("create");
  const caseIdsRef = useRef<Set<string>>(new Set());
  const [messageTarget, setMessageTarget] = useState<{
    caseIdentifier: string;
    lawyerId: string;
    subject?: string;
  } | null>(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [messageSending, setMessageSending] = useState(false);

  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  const [errors, setErrors] = useState<{
    headquarter?: string;
    defendant_name?: string;
    subject?: string;
    description?: string;
  }>({});

  const parseDate = (value?: string | null) => (value ? new Date(value).getTime() : 0);

  const formatCaseStatus = useCallback(
    (status?: string | null) => {
      if (!status) {
        return "";
      }
      const key = `case_status_${status.toLowerCase()}`;
      const translated = t(key as any);
      if (translated && translated !== key) {
        return translated;
      }
      return status
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    },
    [t]
  );

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
    (value: number | null | undefined) => {
      if (typeof value !== "number") {
        return "";
      }
      return new Intl.NumberFormat(i18n.language, {
        maximumFractionDigits: 2,
      }).format(value);
    },
    [i18n.language]
  );

  const statusBadgeClass = useCallback((status?: string | null) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-yellow-100 text-yellow-800";
      case "IN_REVIEW":
        return "bg-blue-100 text-blue-800";
      case "NEED_MORE_INFO":
        return "bg-orange-100 text-orange-800";
      case "RESOLVED":
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-700";
      case "CLOSED":
        return "bg-gray-200 text-gray-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }, []);

  const statusAccentDot = useCallback((status?: string | null) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-yellow-500";
      case "IN_REVIEW":
        return "bg-blue-500";
      case "NEED_MORE_INFO":
        return "bg-orange-500";
      case "RESOLVED":
      case "COMPLETED":
        return "bg-emerald-500";
      case "CLOSED":
        return "bg-gray-500";
      case "REJECTED":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  }, []);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
  ];

  const docTypeLabelKey = {
    contract: "contract",
    proforma: "proforma_invoice",
    receipt: "payment_receipt",
    shipping: "shipping_document",
    other: "other_document",
  } as const;

  const validateCaseDetails = () => {
    const newErrors: {
      headquarter?: string;
      defendant_name?: string;
      subject?: string;
      description?: string;
    } = {};

    if (!caseDetails.headquarter.trim()) newErrors.headquarter = t("headquarter_required");
    if (!caseDetails.defendant_name.trim()) newErrors.defendant_name = t("defendant_name_required");
    if (!caseDetails.subject.trim()) newErrors.subject = t("subject_required");
    if (!caseDetails.description || caseDetails.description.trim().length < 20)
      newErrors.description = t("description_min_20");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const loadUserCases = useCallback(async () => {
    if (!user) {
      return;
    }
    try {
      setCasesLoading(true);
      const { cases, error } = await SupabaseService.getCasesByUser(user.id);
      if (error) {
        console.error("Failed to load user cases", error);
        setUserCases([]);
        setUserCaseResponses([]);
        return;
      }

      const caseList = (cases || []).sort(
        (a, b) => parseDate(b.updated_at || b.created_at) - parseDate(a.updated_at || a.created_at)
      );
      setUserCases(caseList);

      const caseIds = caseList
        .map((item) => item.id)
        .filter((id): id is string => Boolean(id));

      if (caseIds.length > 0) {
        const { responses, error: responsesError } =
          await SupabaseService.getCaseResponsesByCaseIds(caseIds);
        if (responsesError) {
          console.error("Failed to load case responses", responsesError);
          setUserCaseResponses([]);
        } else {
          setUserCaseResponses(responses || []);
        }
      } else {
        setUserCaseResponses([]);
      }
    } catch (err) {
      console.error("Unexpected error loading user cases", err);
    } finally {
      setCasesLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }
    loadUserCases();
  }, [loadUserCases, user]);

  const responsesByCase = useMemo(() => {
    const map = new Map<string, CaseResponse[]>();
    userCaseResponses.forEach((response) => {
      if (!response.case_id) {
        return;
      }
      if (!map.has(response.case_id)) {
        map.set(response.case_id, []);
      }
      map.get(response.case_id)!.push(response);
    });
    map.forEach((list) => {
      list.sort((a, b) => parseDate(b.created_at) - parseDate(a.created_at));
    });
    return map;
  }, [userCaseResponses]);

  const handleMessageLawyer = useCallback(
    (caseIdentifier: string, lawyerId?: string | null, subject?: string | null) => {
      if (!lawyerId) {
        toast.error(t("legal_case_message_lawyer_unavailable"));
        return;
      }

      const prefill =
        subject && subject.trim().length > 0
          ? t("legal_case_message_lawyer_default", { subject })
          : "";
      setMessageDraft(prefill);
      setMessageTarget({
        caseIdentifier,
        lawyerId,
        subject: subject || undefined,
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

  const handleSendLawyerMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!messageTarget) {
      return;
    }

    const body = messageDraft.trim();
    if (!body) {
      toast.error(t("legal_case_message_lawyer_empty"));
      return;
    }

    try {
      setMessageSending(true);
      const { data: thread, error: threadError } = await MessagingService.createOrGetDirectThread(
        messageTarget.lawyerId
      );
      if (threadError || !thread) {
        throw threadError || new Error("Failed to create conversation");
      }

      const { error: sendError } = await MessagingService.sendMessage(thread.id, body);
      if (sendError) {
        throw sendError;
      }

      toast.success(t("legal_case_message_lawyer_success"));
      setMessageDraft("");
      setMessageTarget(null);
    } catch (error) {
      console.error("Failed to send message to lawyer", error);
      toast.error(t("legal_case_message_lawyer_error"));
    } finally {
      setMessageSending(false);
    }
  };

  useEffect(() => {
    caseIdsRef.current = new Set(
      userCases
        .map((item) => item.id)
        .filter((id): id is string => Boolean(id))
    );
  }, [userCases]);

  useEffect(() => {
    if (mainTab === "history") {
      loadUserCases();
    }
  }, [loadUserCases, mainTab]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const channel = supabase
      .channel(`user-cases-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cases",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadUserCases();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "case_response",
        },
        (payload) => {
          const candidateCaseId =
            ((payload.new as { case_id?: string } | null)?.case_id) ||
            ((payload.old as { case_id?: string } | null)?.case_id);

          if (candidateCaseId && caseIdsRef.current.has(candidateCaseId)) {
            loadUserCases();
          }
        }
      );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadUserCases, user]);
  const handlePlusDocument = (type: keyof DocumentFiles) => {
    setDocumnetFiles((prev) => ({
      ...prev,
      [type]: [...prev[type], new File([], "")],
    }));
  };

  const handleMinusDocument = (type: keyof DocumentFiles, index: number) => {
    setDocumnetFiles((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const handleToggleTab = (tab: string) => {
    setActiveTab(tab);
  };

  const handleBack = () => {
    setActiveTab("case-details");
  };

  const handleNext = () => {
    if (!validateCaseDetails()) {
      toast.error(t("validation_errors_present"));
      setActiveTab("case-details");
      return;
    }
    setActiveTab("documents-upload");
  };

  const handleFileChange = (
    type: keyof DocumentFiles,
    index: number,
    file?: File
  ) => {
    if (!file || file.size === 0) {
      setDocumnetFiles((prev) => ({
        ...prev,
        [type]: prev[type].map((f, i) => (i === index ? new File([], "") : f)),
      }));
      return;
    }
    if (!allowedTypes.includes(file.type)) {
      toast.error(t("invalid_file_type"));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(t("file_too_large"));
      return;
    }
    setDocumnetFiles((prev) => ({
      ...prev,
      [type]: prev[type].map((f, i) => (i === index ? file : f)),
    }));
  };

  const handleSubmit = async () => {
    if (!validateCaseDetails()) {
      toast.error(t("validation_errors_present"));
      setActiveTab("case-details");
      return;
    }
    try {
      setLoading(true);
      const createToastId = toast.loading(t("creating_case"));

      if (!user) throw new Error("User not found");

      const { case: savedCase, error: caseError } =
        await SupabaseService.createCase({
          user_id: user.id,
          assigned_to: null,
          plaintiff_type: caseDetails.plaintiff_type,
          headquarter: caseDetails.headquarter,
          defendant_name: caseDetails.defendant_name,
          subject: caseDetails.subject,
          description: caseDetails.description,
          status: "SUBMITTED",
        });
      if (caseError) throw new Error(caseError);

      toast.dismiss(createToastId);

      const uploadToastId = toast.loading(t("uploading_documents"));
      const caseId = (savedCase as any)?.id;

      const uploadDoc = async (
        files: File[],
        docType: keyof DocumentFiles,
        typeKey: typeof docTypeLabelKey[keyof typeof docTypeLabelKey]
      ) => {
        for (const f of files) {
          if (!f || f.size === 0) break;
          const { error: documentsError } =
            await SupabaseService.createCaseDocuments(caseId, {
              case_id: caseId,
              doc_type: docType,
            });
          if (documentsError) throw new Error(documentsError);
          const { error: uploadedDocumentsError } =
            await SupabaseService.uploadCaseDocuments(caseId, f, docType as any);
          if (uploadedDocumentsError) {
            toast.error(`${t("upload_failed")} (${t(typeKey)})`);
            break;
          }
        }
      };

      await uploadDoc(documnetFiles.contract, "contract", docTypeLabelKey.contract);
      await uploadDoc(documnetFiles.proforma, "proforma", docTypeLabelKey.proforma);
      await uploadDoc(documnetFiles.receipt, "receipt", docTypeLabelKey.receipt);
      await uploadDoc(documnetFiles.shipping, "shipping", docTypeLabelKey.shipping);
      await uploadDoc(documnetFiles.other, "other", docTypeLabelKey.other);

      toast.dismiss(uploadToastId);
      toast.success(t("case_submitted_successfully"));
      await loadUserCases();
    } catch (error) {
      console.log(error);
      toast.error(t("case_submission_failed"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="-mt-4 space-y-6">
      <div
        role="tablist"
        className="flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-white/60 p-3 shadow-sm backdrop-blur-sm"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mainTab === "create"}
          onClick={() => setMainTab("create")}
          className={cn(
            "px-4 py-2 text-sm font-semibold rounded-xl transition-all",
            mainTab === "create"
              ? "bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg"
              : "bg-white text-gray-600 border border-white/40 hover:border-purple-200"
          )}
        >
          {t("legal_case_tab_create")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mainTab === "history"}
          onClick={() => setMainTab("history")}
          className={cn(
            "px-4 py-2 text-sm font-semibold rounded-xl transition-all",
            mainTab === "history"
              ? "bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg"
              : "bg-white text-gray-600 border border-white/40 hover:border-purple-200"
          )}
        >
          {t("legal_case_tab_history")}
        </button>
      </div>

      <form
        className={cn(
          "rounded-2xl shadow-xl overflow-hidden",
          mainTab !== "create" && "hidden"
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold">{t("submit_your_legal_issue")}</h1>
          <p className="text-gray-400 text-sm mt-1">
            {t(
              "fill_in_the_details_and_attach_any_supporting_documents_our_lawyer_agent_will_review_your_case"
            )}
          </p>
        </div>

        <div className="h-1 bg-gradient-to-r from-transparent via-yellow-600 to-transparent" />

        {/* Tabs */}
        <div
          className="flex gap-2 p-3 bg-white/5 border-b border-white/10 backdrop-blur-sm"
          role="tablist"
        >
          <button
            onClick={() => handleToggleTab("case-details")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold border ",
              activeTab === "case-details"
                ? "border-purple-600 shadow-[0_0_0_3px_rgba(125,39,200,0.4)]"
                : "border border-white/10"
            )}
            role="tab"
            aria-selected="true"
            type="button"
          >
            {t("case_details")}
          </button>
          <button
            onClick={() => handleToggleTab("documents-upload")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold border ",
              activeTab === "documents-upload"
                ? "border-purple-600 shadow-[0_0_0_3px_rgba(125,39,200,0.4)]"
                : "border border-white/10"
            )}
            role="tab"
            aria-selected="false"
            type="button"
          >
            {t("documents_upload")}
          </button>
        </div>

        {activeTab === "case-details" ? (
          <section className="p-6">
            {/* Plaintiff Info */}
            <fieldset className="grid md:grid-cols-2 gap-6 border border-gray-300 p-4">
              <legend className="text-gray-400 text-sm mb-2 font-semibold">
                {t("plaintiff_information")}
              </legend>

              <div>
                <label className="font-semibold block mb-2">
                  {t("are_you_a_company_or_an_individual")}
                </label>
                <div className="flex gap-4 flex-wrap">
                  <label className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-300  cursor-pointer">
                    <input
                      type="radio"
                      name="plaintiff_type"
                      value="company"
                      required
                      className="accent-[#7d27c8]"
                      checked={caseDetails.plaintiff_type === "company"}
                      onChange={() =>
                        setCaseDetails({
                          ...caseDetails,
                          plaintiff_type: "company",
                        })
                      }
                    />{" "}
                    Company
                  </label>
                  <label className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-300  cursor-pointer">
                    <input
                      type="radio"
                      name="plaintiff_type"
                      value="individual"
                      required
                      className="accent-[#7d27c8]"
                      checked={caseDetails.plaintiff_type === "individual"}
                      onChange={() =>
                        setCaseDetails({
                          ...caseDetails,
                          plaintiff_type: "individual",
                        })
                      }
                    />{" "}
                    Individual
                  </label>
                </div>
                <p className="text-gray-400 text-xs mt-1">{t("required")}</p>
              </div>

              <div>
                <label
                  htmlFor="headquarter"
                  className="font-semibold block mb-2"
                >
                  {t("where_is_your_headquarter")}
                </label>
                <input
                  value={caseDetails.headquarter}
                  onChange={(e) =>
                    setCaseDetails({
                      ...caseDetails,
                      headquarter: e.target.value,
                    })
                  }
                  type="text"
                  id="headquarter"
                  name="headquarter"
                  placeholder={t("city_country")}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-white/10  focus:border-purple-600 focus:ring-2 focus:ring-purple-500/40 outline-none"
                />
                <p className="text-gray-400 text-xs mt-1">
                  {t("example_city_country")}
                </p>
                {errors.headquarter && (
                  <p className="text-red-500 text-xs mt-1">{errors.headquarter}</p>
                )}
              </div>
            </fieldset>

            {/* Defendant Info */}
            <fieldset className="grid gap-4 mt-8 border border-gray-300 p-4">
              <legend className="text-gray-400 text-sm mb-2 font-semibold">
                {t("defendant_information")}
              </legend>
              <div>
                <label
                  htmlFor="defendant-name"
                  className="font-semibold block mb-2"
                >
                  {t("name_of_the_company")}
                </label>
                <input
                  value={caseDetails.defendant_name}
                  onChange={(e) =>
                    setCaseDetails({
                      ...caseDetails,
                      defendant_name: e.target.value,
                    })
                  }
                  type="text"
                  id="defendant-name"
                  name="defendant_name"
                  placeholder={t("defendant_company_name")}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-white/10  focus:border-purple-600 focus:ring-2 focus:ring-purple-500/40 outline-none"
                />
                {errors.defendant_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.defendant_name}</p>
                )}
              </div>
            </fieldset>

            {/* Case Summary */}
            <fieldset className="grid gap-4 mt-8 border border-gray-300 p-4">
              <legend className="text-gray-400 text-sm mb-2 font-semibold">
                {t("case_summary")}
              </legend>
              <div>
                <label htmlFor="subject" className="font-semibold block mb-2">
                  {t("subject_of_your_issue")}
                </label>
                <input
                  value={caseDetails.subject}
                  onChange={(e) =>
                    setCaseDetails({ ...caseDetails, subject: e.target.value })
                  }
                  type="text"
                  id="subject"
                  name="subject"
                  placeholder={t("example_subject_of_your_issue")}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-white/10  focus:border-purple-600 focus:ring-2 focus:ring-purple-500/40 outline-none"
                />
                {errors.subject && (
                  <p className="text-red-500 text-xs mt-1">{errors.subject}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="font-semibold block mb-2"
                >
                  {t("explain_your_legal_issue")}
                </label>
                <textarea
                  value={caseDetails.description}
                  onChange={(e) =>
                    setCaseDetails({
                      ...caseDetails,
                      description: e.target.value,
                    })
                  }
                  id="description"
                  name="description"
                  placeholder={t(
                    "please_describe_the_facts_dates_and_what_outcome_you_want"
                  )}
                  minLength={20}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-white/10  focus:border-purple-600 focus:ring-2 focus:ring-purple-500/40 outline-none min-h-[160px] resize-y"
                ></textarea>
                <p className="text-gray-400 text-xs mt-1">
                  {t("minimum_20_characters")}
                </p>
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                )}
              </div>
            </fieldset>
          </section>
        ) : (
          <section className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  id: "contract",
                  label: t("contract"),
                  hint: t("click_to_add_more_allowed_pdf_doc_docx_jpg_png"),
                },
                {
                  id: "proforma",
                  label: t("proforma_invoice"),
                  hint: t("add_all_relevant_invoices"),
                },
                {
                  id: "receipt",
                  label: t("payment_receipt"),
                  hint: t("bank_transfers_receipts_confirmations_etc"),
                },
                {
                  id: "shipping",
                  label: t("shipping_document"),
                  hint: t("b_l_airway_bill_tracking_customs_docs_etc"),
                },
                {
                  id: "other",
                  label: t("other_document"),
                  hint: t("screenshots_emails_photos_etc"),
                },
              ].map((item, idx) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[auto_1fr] gap-3 items-start p-4 border border-dashed border-gray-300 rounded-xl bg-white/5"
                >
                  <button
                    onClick={() =>
                      handlePlusDocument(item.id as keyof DocumentFiles)
                    }
                    type="button"
                    aria-label={`Add ${item.label.toLowerCase()}`}
                    data-group={item.id}
                    className="w-9 h-9 rounded-lg border border-white/10 font-bold text-lg flex items-center justify-center hover:shadow-[0_0_0_3px_rgba(125,39,200,0.4)] hover:-translate-y-0.5 transition bg-gray-200 text-white"
                  >
                    +
                  </button>
                  <div className="min-w-0">
                    <label
                      htmlFor={`${item.id}-input-0`}
                      className="font-semibold block mb-2"
                    >
                      {item.label}
                    </label>
                    <div
                      className="flex flex-col gap-2"
                      id={`${item.id}-inputs`}
                    >
                      {documnetFiles[item.id as keyof DocumentFiles].map(
                        (file, fileIndex) => (
                          <div className="flex items-center justify-between">
                            <input
                              onChange={(e) =>
                                handleFileChange(
                                  item.id as keyof DocumentFiles,
                                  fileIndex,
                                  e.target.files?.[0] as File
                                )
                              }
                              id={`${item.id}-input-0`}
                              type="file"
                              name={`${item.id}_files[]`}
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              className="w-full px-3 py-2 rounded-lg border border-white/10 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-purple-700 file:px-3 file:py-1 file:text-white hover:file:bg-purple-600"
                            />
                            {fileIndex > 0 && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleMinusDocument(
                                    item.id as keyof DocumentFiles,
                                    fileIndex
                                  )
                                }
                                className="p-2 text-red-500 hover:text-red-700 bg-red-100 rounded-lg transition-colors"
                              >
                                <MinusIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        )
                      )}
                    </div>
                    <p className="text-gray-400 text-xs mt-1">{item.hint}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center gap-4 px-6 py-4 border-t border-white/10 bg-white/5">
          <button
            onClick={handleBack}
            type="button"
            className="px-4 py-2 rounded-lg font-bold text-gray-400 border border-white/10"
          >
            {t("back")}
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleNext}
              type="button"
              disabled={loading}
              className="px-4 py-2 rounded-lg font-bold text-gray-400 border border-white/10 disabled:opacity-60"
            >
              {t("next")}
            </button>
            <button
              onClick={handleSubmit}
              type="button"
              disabled={loading}
              className="px-4 py-2 rounded-lg font-bold text-white bg-gradient-to-b from-purple-600 to-purple-800 shadow-lg disabled:opacity-60"
            >
              {t("submit_case")}
            </button>
          </div>
        </div>
      </form>
      <section
        className={cn(
          "rounded-2xl border border-white/10 bg-white/60 backdrop-blur-sm p-6 shadow-xl",
          mainTab !== "history" && "hidden"
        )}
      >
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {t("legal_cases_history")}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {t("legal_cases_history_description")}
          </p>

          {casesLoading ? (
            <div className="mt-6 space-y-4">
              {[0, 1].map((index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-white/60 p-6 shadow-sm"
                >
                  <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                  <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-gray-200" />
                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, metaIndex) => (
                      <div key={metaIndex} className="space-y-2">
                        <div className="h-2 w-16 animate-pulse rounded bg-gray-200" />
                        <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 h-24 animate-pulse rounded-xl bg-gray-100" />
                </div>
              ))}
            </div>
          ) : userCases.length === 0 ? (
            <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-purple-200 bg-purple-50/70 px-6 py-12 text-center text-purple-700">
              <DocumentPlusIcon className="h-10 w-10" />
              <p className="text-sm font-semibold">{t("legal_case_no_cases")}</p>
              <p className="text-xs text-purple-600">{t("legal_case_no_cases_hint")}</p>
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              {userCases.map((caseItem, index) => {
                const caseKey = caseItem.id ?? `case-${index}`;
                const responses = responsesByCase.get(caseItem.id ?? "") || [];
                const [latestResponse, ...olderResponses] = responses;
                const subject = caseItem.subject?.trim()
                  ? caseItem.subject
                  : t("notifications_case_unknown_subject");
                const statusLabel =
                  formatCaseStatus(caseItem.status) || t("case_status_submitted");
                const defendantLabel = caseItem.defendant_name?.trim()
                  ? caseItem.defendant_name
                  : t("notifications_case_unknown_defendant");
                const plaintiffLabel =
                  caseItem.plaintiff_type === "company"
                    ? t("legal_case_plaintiff_company")
                    : t("legal_case_plaintiff_individual");
                const lawyerId =
                  caseItem.assigned_to ??
                  latestResponse?.lawyer_id ??
                  olderResponses.find((response) => response.lawyer_id)?.lawyer_id ??
                  null;
                const caseIdentifier = caseItem.id || caseKey;

                return (
                  <article
                    key={caseKey}
                    className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg"
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500/0 via-purple-500 to-purple-500/0" />
                    <div className="p-5 sm:p-6">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-400">
                            <ClockIcon className="h-4 w-4 text-purple-500" />
                            {t("legal_case_last_update")}:{" "}
                            {formatDate(caseItem.updated_at || caseItem.created_at)}
                          </div>
                          <h3 className="mt-1 text-lg font-semibold text-gray-900">
                            {subject}
                          </h3>
                          {caseItem.description && (
                            <p className="mt-2 text-sm text-gray-600">
                              {caseItem.description}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-3">
                          <span
                            className={cn(
                              "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
                              statusBadgeClass(caseItem.status)
                            )}
                          >
                            <span
                              className={cn(
                                "h-2.5 w-2.5 rounded-full",
                                statusAccentDot(caseItem.status)
                              )}
                            />
                            {statusLabel}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleMessageLawyer(caseIdentifier, lawyerId, subject)}
                            disabled={!lawyerId}
                            title={
                              !lawyerId
                                ? t("legal_case_message_lawyer_unavailable")
                                : undefined
                            }
                            className={cn(
                              "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition",
                              lawyerId
                                ? "bg-purple-600 text-white hover:bg-purple-700"
                                : "cursor-not-allowed bg-gray-200 text-gray-500"
                            )}
                          >
                            <PaperAirplaneIcon className="h-4 w-4" />
                            {t("legal_case_message_lawyer")}
                          </button>
                        </div>
                      </div>

                      <dl className="mt-6 grid grid-cols-1 gap-4 text-sm text-gray-700 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            {t("created")}
                          </dt>
                          <dd className="mt-1">{formatDate(caseItem.created_at)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            {t("legal_case_last_update")}
                          </dt>
                          <dd className="mt-1">
                            {formatDate(caseItem.updated_at || caseItem.created_at)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            {t("defendant")}
                          </dt>
                          <dd className="mt-1">{defendantLabel}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            {t("plaintiff_type")}
                          </dt>
                          <dd className="mt-1">{plaintiffLabel}</dd>
                        </div>
                      </dl>

                      <div className="mt-6 rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 via-white to-white p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                              <ChatBubbleLeftRightIcon className="h-5 w-5" />
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {t("legal_case_response")}
                              </p>
                              {latestResponse?.created_at && (
                                <p className="text-xs text-gray-500">
                                  {t("legal_case_response_at", {
                                    date: formatDate(latestResponse.created_at),
                                  })}
                                </p>
                              )}
                            </div>
                          </div>
                          {latestResponse && (
                            <div className="flex flex-wrap gap-2 text-xs text-purple-700">
                              {typeof latestResponse.price === "number" && (
                                <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 font-medium">
                                  {t("legal_case_price", {
                                    price: formatPrice(latestResponse.price),
                                  })}
                                </span>
                              )}
                              {latestResponse.delivery_date && (
                                <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 font-medium">
                                  {t("legal_case_delivery_date", {
                                    deliveryDate: formatDate(latestResponse.delivery_date),
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
                            {t("legal_case_no_response")}
                          </div>
                        )}
                      </div>

                      {olderResponses.length > 0 && (
                        <div className="mt-6">
                          <p className="flex items-center gap-2 text-sm font-medium text-gray-900">
                            <ClockIcon className="h-4 w-4 text-purple-500" />
                            {t("legal_case_responses_timeline")}
                          </p>
                          <div className="relative mt-4 pl-5">
                            <div className="absolute left-1.5 top-2 bottom-2 w-px bg-purple-100" />
                            <div className="space-y-4">
                              {olderResponses.map((response) => {
                                const priceText =
                                  typeof response.price === "number"
                                    ? formatPrice(response.price)
                                    : null;
                                const deliveryText = response.delivery_date
                                  ? formatDate(response.delivery_date)
                                  : null;
                                return (
                                  <div key={response.id} className="relative pl-4">
                                    <span className="absolute left-[-14px] top-3 h-3 w-3 rounded-full border-2 border-purple-400 bg-white" />
                                    <div className="rounded-xl border border-purple-100 bg-white p-4 shadow-sm">
                                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
                                          {formatDate(response.created_at)}
                                        </p>
                                        <div className="flex flex-wrap gap-2 text-xs text-purple-600">
                                          {priceText && (
                                            <span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 font-medium">
                                              {t("legal_case_price", { price: priceText })}
                                            </span>
                                          )}
                                          {deliveryText && (
                                            <span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 font-medium">
                                              {t("legal_case_delivery_date", {
                                                deliveryDate: deliveryText,
                                              })}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      {response.response && (
                                        <p className="mt-3 whitespace-pre-line text-sm text-gray-600">
                                          {response.response}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
      {messageTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={closeMessageModal}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t("legal_case_message_lawyer_title")}
                </h3>
                {messageTarget.subject && (
                  <p className="mt-1 text-xs text-gray-500">
                    {t("legal_case_message_lawyer_about_case", {
                      subject: messageTarget.subject,
                    })}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={closeMessageModal}
                disabled={messageSending}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSendLawyerMessage} className="space-y-4 px-6 py-5">
              <p className="text-sm text-gray-600">
                {t("legal_case_message_lawyer_instruction")}
              </p>
              <textarea
                value={messageDraft}
                onChange={(event) => setMessageDraft(event.target.value)}
                rows={6}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                placeholder={t("legal_case_message_lawyer_placeholder")}
                disabled={messageSending}
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeMessageModal}
                  disabled={messageSending}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed"
                >
                  {t("legal_case_message_lawyer_cancel")}
                </button>
                <button
                  type="submit"
                  disabled={messageSending}
                  className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-purple-400"
                >
                  {messageSending ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-b-transparent" />
                      {t("legal_case_message_lawyer_send")}
                    </span>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="h-4 w-4" />
                      {t("legal_case_message_lawyer_send")}
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

export default LegalIssuePage;
