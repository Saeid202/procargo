import { useState } from "react";


import { cn } from "../../utils/cn";
import { MinusIcon } from "@heroicons/react/24/outline";
import Loading from "../../components/ui/Loading";
import { SupabaseService } from "../../services/supabaseService";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";

export interface DocumentFiles {
    contract: File[],
    proforma: File[],
    receipt: File[],
    shipping: File[],
    other: File[],
}

export interface CaseDetails {
    plaintiff_type: 'company' | 'individual',
    headquarter: string,
    defendant_name: string,
    subject: string,
    description: string,
}



const LegalIssuePage = () => {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('case-details');
    const [caseDetails, setCaseDetails] = useState<CaseDetails>({
        plaintiff_type: 'company',
        headquarter: '',
        defendant_name: '',
        subject: '',
        description: '',
    });
    const [documnetFiles, setDocumnetFiles] = useState<DocumentFiles>({
        contract: [new File([], '')],
        proforma: [new File([], '')],
        receipt: [new File([], '')],
        shipping: [new File([], '')],
        other: [new File([], '')],
    });

    const { user } = useAuth();
    const { t } = useTranslation();

    const handlePlusDocument = (type: keyof DocumentFiles) => {
        setDocumnetFiles(prev => ({ ...prev, [type]: [...prev[type], new File([], '')] }));
    };

    const handleMinusDocument = (type: keyof DocumentFiles, index: number) => {
        setDocumnetFiles(prev => ({ ...prev, [type]: prev[type].filter((_, i) => i !== index) }));
    };

    const handleToggleTab = (tab: string) => {
        setActiveTab(tab);
    };

    const handleBack = () => {
        setActiveTab('case-details');
    };

    const handleNext = () => {
        setActiveTab('documents-upload');
    };

    const handleFileChange = (type: keyof DocumentFiles, index: number, file: File) => {
        setDocumnetFiles(prev => ({ ...prev, [type]: prev[type].map((f, i) => i === index ? file : f) }));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            if (!user) throw new Error('User not found');
            const { case: savedCase, error: caseError } = await SupabaseService.createCase({
                user_id: user.id,
                assigned_to: null,
                plaintiff_type: caseDetails.plaintiff_type,
                headquarter: caseDetails.headquarter,
                defendant_name: caseDetails.defendant_name,
                subject: caseDetails.subject,
                description: caseDetails.description,
                status: 'SUBMITTED',
            });
            if (caseError) throw new Error(caseError);

            for (const contractFile of documnetFiles.contract) {
                const { error: documentsError } = await SupabaseService.createCaseDocuments((savedCase as any)?.id, {
                    case_id: (savedCase as any)?.id,
                    doc_type: 'contract',
                });
                if (documentsError) throw new Error(documentsError);
                const { error: uploadedDocumentsError } = await SupabaseService.uploadCaseDocuments((savedCase as any).id, contractFile, 'contract');
                if (uploadedDocumentsError) {
                    alert("Failed to upload contract file");
                }
            }

            for (const performaFile of documnetFiles.proforma) {
                const { error: documentsError } = await SupabaseService.createCaseDocuments((savedCase as any)?.id, {
                    case_id: (savedCase as any)?.id,
                    doc_type: 'proforma',
                });
                if (documentsError) throw new Error(documentsError);
                const { error: uploadedDocumentsError } = await SupabaseService.uploadCaseDocuments((savedCase as any).id, performaFile, 'proforma');
                if (uploadedDocumentsError) {
                    alert("Failed to upload proforma file");
                }
            }

            for (const receiptFile of documnetFiles.receipt) {
                const { error: documentsError } = await SupabaseService.createCaseDocuments((savedCase as any)?.id, {
                    case_id: (savedCase as any)?.id,
                    doc_type: 'receipt',
                });
                if (documentsError) throw new Error(documentsError);
                const { error: uploadedDocumentsError } = await SupabaseService.uploadCaseDocuments((savedCase as any).id, receiptFile, 'receipt');
                if (uploadedDocumentsError) {
                    alert("Failed to upload receipt file");
                }
            }

            for (const shippingFile of documnetFiles.shipping) {
                const { error: documentsError } = await SupabaseService.createCaseDocuments((savedCase as any)?.id, {
                    case_id: (savedCase as any)?.id,
                    doc_type: 'shipping',
                });
                if (documentsError) throw new Error(documentsError);
                const { error: uploadedDocumentsError } = await SupabaseService.uploadCaseDocuments((savedCase as any).id, shippingFile, 'shipping');
                if (uploadedDocumentsError) {
                    alert("Failed to upload shipping file");
                }
            }

            for (const otherFile of documnetFiles.other) {
                const { error: documentsError } = await SupabaseService.createCaseDocuments((savedCase as any)?.id, {
                    case_id: (savedCase as any)?.id,
                    doc_type: 'other',
                });
                if (documentsError) throw new Error(documentsError);
                const { error: uploadedDocumentsError } = await SupabaseService.uploadCaseDocuments((savedCase as any).id, otherFile, 'other');
                if (uploadedDocumentsError) {
                    alert("Failed to upload other file");
                }
            }

        } catch (error) {
            console.log(error)
            alert('Error submitting case. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <Loading />
    }

    return (
        <div className="-mt-4">
            <form
                className="rounded-2xl shadow-xl overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                    <h1 className="text-xl font-bold">{t("submit_your_legal_issue")}</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        {t("fill_in_the_details_and_attach_any_supporting_documents_our_lawyer_agent_will_review_your_case")}
                    </p>
                </div>

                <div className="h-1 bg-gradient-to-r from-transparent via-yellow-600 to-transparent" />

                {/* Tabs */}
                <div
                    className="flex gap-2 p-3 bg-white/5 border-b border-white/10 backdrop-blur-sm"
                    role="tablist"
                >
                    <button
                        onClick={() => handleToggleTab('case-details')}
                        className={
                            cn(
                                "px-4 py-2 rounded-lg text-sm font-semibold border ",
                                activeTab == 'case-details' ? 'border-purple-600 shadow-[0_0_0_3px_rgba(125,39,200,0.4)]' : 'border border-white/10'
                            )
                        }
                        role="tab"
                        aria-selected="true"
                        type="button"
                    >
                        {t("case_details")}
                    </button>
                    <button
                        onClick={() => handleToggleTab('documents-upload')}
                        className={
                            cn(
                                "px-4 py-2 rounded-lg text-sm font-semibold border ",
                                activeTab == 'documents-upload' ? 'border-purple-600 shadow-[0_0_0_3px_rgba(125,39,200,0.4)]' : 'border border-white/10'
                            )
                        }
                        role="tab"
                        aria-selected="false"
                        type="button"
                    >
                        {t("documents_upload")}
                    </button>
                </div>

                {
                    activeTab == 'case-details' ? (
                        <section className="p-6">
                            {/* Plaintiff Info */}
                            <fieldset className="grid md:grid-cols-2 gap-6 border border-gray-300 p-4">
                                <legend className="text-gray-400 text-sm mb-2 font-semibold">
                                    {t("plaintiff_information")}
                                </legend>

                                <div>
                                    <label className="font-semibold block mb-2">{t("are_you_a_company_or_an_individual")}</label>
                                    <div className="flex gap-4 flex-wrap">
                                        <label className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-300  cursor-pointer">
                                            <input type="radio" name="plaintiff_type" value="company" required className="accent-[#7d27c8]" checked={caseDetails.plaintiff_type === 'company'} onChange={() => setCaseDetails({ ...caseDetails, plaintiff_type: 'company' })} /> Company
                                        </label>
                                        <label className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-300  cursor-pointer">
                                            <input type="radio" name="plaintiff_type" value="individual" required className="accent-[#7d27c8]" checked={caseDetails.plaintiff_type === 'individual'} onChange={() => setCaseDetails({ ...caseDetails, plaintiff_type: 'individual' })} /> Individual
                                        </label>
                                    </div>
                                    <p className="text-gray-400 text-xs mt-1">{t("required")}</p>
                                </div>

                                <div>
                                    <label htmlFor="headquarter" className="font-semibold block mb-2">
                                        {t("where_is_your_headquarter")}
                                    </label>
                                    <input
                                        value={caseDetails.headquarter}
                                        onChange={(e) => setCaseDetails({ ...caseDetails, headquarter: e.target.value })}
                                        type="text"
                                        id="headquarter"
                                        name="headquarter"
                                        placeholder={t("city_country")}
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-white/10  focus:border-purple-600 focus:ring-2 focus:ring-purple-500/40 outline-none"
                                    />
                                    <p className="text-gray-400 text-xs mt-1">{t("example_city_country")}</p>
                                </div>
                            </fieldset>

                            {/* Defendant Info */}
                            <fieldset className="grid gap-4 mt-8 border border-gray-300 p-4">
                                <legend className="text-gray-400 text-sm mb-2 font-semibold">
                                    {t("defendant_information")}
                                </legend>
                                <div>
                                    <label htmlFor="defendant-name" className="font-semibold block mb-2">
                                        {t("name_of_the_company")}
                                    </label>
                                    <input
                                        value={caseDetails.defendant_name}
                                        onChange={(e) => setCaseDetails({ ...caseDetails, defendant_name: e.target.value })}
                                        type="text"
                                        id="defendant-name"
                                        name="defendant_name"
                                        placeholder={t("defendant_company_name")}
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-white/10  focus:border-purple-600 focus:ring-2 focus:ring-purple-500/40 outline-none"
                                    />
                                </div>
                            </fieldset>

                            {/* Case Summary */}
                            <fieldset className="grid gap-4 mt-8 border border-gray-300 p-4">
                                <legend className="text-gray-400 text-sm mb-2 font-semibold">{t("case_summary")}</legend>
                                <div>
                                    <label htmlFor="subject" className="font-semibold block mb-2">
                                        {t("subject_of_your_issue")}
                                    </label>
                                    <input
                                        value={caseDetails.subject}
                                        onChange={(e) => setCaseDetails({ ...caseDetails, subject: e.target.value })}
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        placeholder={t("example_subject_of_your_issue")}
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-white/10  focus:border-purple-600 focus:ring-2 focus:ring-purple-500/40 outline-none"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="description" className="font-semibold block mb-2">
                                        {t("explain_your_legal_issue")}
                                    </label>
                                    <textarea
                                        value={caseDetails.description}
                                        onChange={(e) => setCaseDetails({ ...caseDetails, description: e.target.value })}
                                        id="description"
                                        name="description"
                                        placeholder={t("please_describe_the_facts_dates_and_what_outcome_you_want")}
                                        minLength={20}
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-white/10  focus:border-purple-600 focus:ring-2 focus:ring-purple-500/40 outline-none min-h-[160px] resize-y"
                                    ></textarea>
                                    <p className="text-gray-400 text-xs mt-1">{t("minimum_20_characters")}</p>
                                </div>
                            </fieldset>
                        </section>
                    ) : (
                        <section className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { id: "contract", label: t("contract"), hint: t("click_to_add_more_allowed_pdf_doc_docx_jpg_png") },
                                    { id: "proforma", label: t("proforma_invoice"), hint: t("add_all_relevant_invoices") },
                                    { id: "receipt", label: t("payment_receipt"), hint: t("bank_transfers_receipts_confirmations_etc") },
                                    { id: "shipping", label: t("shipping_document"), hint: t("b_l_airway_bill_tracking_customs_docs_etc") },
                                    { id: "other", label: t("other_document"), hint: t("screenshots_emails_photos_etc") }
                                ].map((item, idx) => (
                                    <div key={item.id} className="grid grid-cols-[auto_1fr] gap-3 items-start p-4 border border-dashed border-gray-300 rounded-xl bg-white/5">
                                        <button
                                            onClick={() => handlePlusDocument(item.id as keyof DocumentFiles)}
                                            type="button"
                                            aria-label={`Add ${item.label.toLowerCase()}`}
                                            data-group={item.id}
                                            className="w-9 h-9 rounded-lg border border-white/10 font-bold text-lg flex items-center justify-center hover:shadow-[0_0_0_3px_rgba(125,39,200,0.4)] hover:-translate-y-0.5 transition bg-gray-200 text-white"
                                        >
                                            +
                                        </button>
                                        <div className="min-w-0">
                                            <label htmlFor={`${item.id}-input-0`} className="font-semibold block mb-2">
                                                {item.label}
                                            </label>
                                            <div className="flex flex-col gap-2" id={`${item.id}-inputs`}>
                                                {
                                                    documnetFiles[item.id as keyof DocumentFiles].map((file, fileIndex) => (
                                                        <div className="flex items-center justify-between" >
                                                            <input
                                                                onChange={(e) => handleFileChange(item.id as keyof DocumentFiles, fileIndex, e.target.files?.[0] as File)}
                                                                id={`${item.id}-input-0`}
                                                                type="file"
                                                                name={`${item.id}_files[]`}
                                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                                className="w-full px-3 py-2 rounded-lg border border-white/10 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-purple-700 file:px-3 file:py-1 file:text-white hover:file:bg-purple-600"
                                                            />
                                                            {
                                                                fileIndex > 0 && (
                                                                    <button type="button" onClick={() => handleMinusDocument(item.id as keyof DocumentFiles, fileIndex)} className="p-2 text-red-500 hover:text-red-700 bg-red-100 rounded-lg transition-colors">
                                                                        <MinusIcon className="h-4 w-4" />
                                                                    </button>
                                                                )
                                                            }
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                            <p className="text-gray-400 text-xs mt-1">{item.hint}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )
                }

                {/* Footer */}
                <div className="flex justify-between items-center gap-4 px-6 py-4 border-t border-white/10 bg-white/5">
                    <button onClick={handleBack} type="button" className="px-4 py-2 rounded-lg font-bold text-gray-400 border border-white/10">
                        {t("back")}
                    </button>
                    <div className="flex gap-3">
                        <button onClick={handleNext} type="button" className="px-4 py-2 rounded-lg font-bold text-gray-400 border border-white/10">
                            {t("next")}
                        </button>
                        <button
                            onClick={handleSubmit}
                            type="button"
                            className="px-4 py-2 rounded-lg font-bold text-white bg-gradient-to-b from-purple-600 to-purple-800 shadow-lg"
                        >
                            {t("submit_case")}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default LegalIssuePage;  