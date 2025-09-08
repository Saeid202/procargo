import { useState } from "react";


import { cn } from "../../utils/cn";
import { MinusIcon } from "@heroicons/react/24/outline";
import Loading from "../../components/ui/Loading";
import { SupabaseService } from "../../services/supabaseService";
import { useAuth } from "../../contexts/AuthContext";

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
            });
            if (caseError) throw new Error(caseError);

            for (const contractFile of documnetFiles.contract) {
                const { error: documentsError } = await SupabaseService.createCaseDocuments((savedCase as any)?.id, {
                    case_id: (savedCase as any)?.id,
                    doc_type: 'contract',
                });
                if (documentsError) throw new Error(documentsError);
                const { error: uploadedDocumentsError } = await SupabaseService.uploadCaseDocuments((savedCase as any).id, contractFile, 'contract');
                if (uploadedDocumentsError) throw new Error(uploadedDocumentsError);
            }

            // const { documents: savedDocuments, error: documentsError } = await SupabaseService.createCaseDocuments((savedCase as any)?.id, documnetFiles);

            // if (documentsError || !savedDocuments) throw new Error(documentsError);
            // const { documents: uploadedDocuments, error: uploadedDocumentsError } = await SupabaseService.uploadCaseDocuments((savedCase as any).id, documnetFiles);

            // if (uploadedDocumentsError || !uploadedDocuments) throw new Error(uploadedDocumentsError);
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
                    <h1 className="text-xl font-bold">Submit Your Legal Issue</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Fill in the details and attach any supporting documents. Our lawyer agent will review your case.
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
                        Case Details
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
                        Documents Upload
                    </button>
                </div>

                {
                    activeTab == 'case-details' ? (
                        <section className="p-6">
                            {/* Plaintiff Info */}
                            <fieldset className="grid md:grid-cols-2 gap-6 border border-gray-300 p-4">
                                <legend className="text-gray-400 text-sm mb-2 font-semibold">
                                    Plaintiff Information
                                </legend>

                                <div>
                                    <label className="font-semibold block mb-2">Are you a company or an individual?</label>
                                    <div className="flex gap-4 flex-wrap">
                                        <label className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-300  cursor-pointer">
                                            <input type="radio" name="plaintiff_type" value="company" required className="accent-[#7d27c8]" checked={caseDetails.plaintiff_type === 'company'} onChange={() => setCaseDetails({ ...caseDetails, plaintiff_type: 'company' })} /> Company
                                        </label>
                                        <label className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-300  cursor-pointer">
                                            <input type="radio" name="plaintiff_type" value="individual" required className="accent-[#7d27c8]" checked={caseDetails.plaintiff_type === 'individual'} onChange={() => setCaseDetails({ ...caseDetails, plaintiff_type: 'individual' })} /> Individual
                                        </label>
                                    </div>
                                    <p className="text-gray-400 text-xs mt-1">Required</p>
                                </div>

                                <div>
                                    <label htmlFor="headquarter" className="font-semibold block mb-2">
                                        Where is your headquarter?
                                    </label>
                                    <input
                                        value={caseDetails.headquarter}
                                        onChange={(e) => setCaseDetails({ ...caseDetails, headquarter: e.target.value })}
                                        type="text"
                                        id="headquarter"
                                        name="headquarter"
                                        placeholder="City, Country"
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-white/10  focus:border-purple-600 focus:ring-2 focus:ring-purple-500/40 outline-none"
                                    />
                                    <p className="text-gray-400 text-xs mt-1">Example: Toronto, Canada</p>
                                </div>
                            </fieldset>

                            {/* Defendant Info */}
                            <fieldset className="grid gap-4 mt-8 border border-gray-300 p-4">
                                <legend className="text-gray-400 text-sm mb-2 font-semibold">
                                    Defendant Information
                                </legend>
                                <div>
                                    <label htmlFor="defendant-name" className="font-semibold block mb-2">
                                        Name of the company
                                    </label>
                                    <input
                                        value={caseDetails.defendant_name}
                                        onChange={(e) => setCaseDetails({ ...caseDetails, defendant_name: e.target.value })}
                                        type="text"
                                        id="defendant-name"
                                        name="defendant_name"
                                        placeholder="Defendant company name"
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-white/10  focus:border-purple-600 focus:ring-2 focus:ring-purple-500/40 outline-none"
                                    />
                                </div>
                            </fieldset>

                            {/* Case Summary */}
                            <fieldset className="grid gap-4 mt-8 border border-gray-300 p-4">
                                <legend className="text-gray-400 text-sm mb-2 font-semibold">Case Summary</legend>
                                <div>
                                    <label htmlFor="subject" className="font-semibold block mb-2">
                                        Subject of your issue
                                    </label>
                                    <input
                                        value={caseDetails.subject}
                                        onChange={(e) => setCaseDetails({ ...caseDetails, subject: e.target.value })}
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        placeholder="e.g., Non-payment dispute, Breach of contract"
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-white/10  focus:border-purple-600 focus:ring-2 focus:ring-purple-500/40 outline-none"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="description" className="font-semibold block mb-2">
                                        Explain your legal issue
                                    </label>
                                    <textarea
                                        value={caseDetails.description}
                                        onChange={(e) => setCaseDetails({ ...caseDetails, description: e.target.value })}
                                        id="description"
                                        name="description"
                                        placeholder="Please describe the facts, dates, and what outcome you want"
                                        minLength={20}
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-white/10  focus:border-purple-600 focus:ring-2 focus:ring-purple-500/40 outline-none min-h-[160px] resize-y"
                                    ></textarea>
                                    <p className="text-gray-400 text-xs mt-1">Minimum 20 characters</p>
                                </div>
                            </fieldset>
                        </section>
                    ) : (
                        <section className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { id: "contract", label: "Contract", hint: "Click + to add more. Allowed: PDF, DOC, DOCX, JPG, PNG." },
                                    { id: "proforma", label: "Proforma Invoice", hint: "Add all relevant invoices." },
                                    { id: "receipt", label: "Payment Receipt", hint: "Bank transfers, receipts, confirmations, etc." },
                                    { id: "shipping", label: "Shipping Document", hint: "B/L, airway bill, tracking, customs docs, etc." },
                                    { id: "other", label: "Other Document", hint: "Screenshots, emails, photos, etc." }
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
                        Back
                    </button>
                    <div className="flex gap-3">
                        <button onClick={handleNext} type="button" className="px-4 py-2 rounded-lg font-bold text-gray-400 border border-white/10">
                            Next
                        </button>
                        <button
                            onClick={handleSubmit}
                            type="button"
                            className="px-4 py-2 rounded-lg font-bold text-white bg-gradient-to-b from-purple-600 to-purple-800 shadow-lg"
                        >
                            Submit Case
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default LegalIssuePage;  