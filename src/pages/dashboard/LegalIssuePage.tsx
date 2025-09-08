const LegalIssuePage = () => {
    return (
        <div className="-mt-4">
            <form
                id="legal-issue-form"
                action="/submit-case"
                method="POST"
                encType="multipart/form-data"
                className="rounded-2xl shadow-xl overflow-hidden"
                noValidate
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
                        className="px-4 py-2 rounded-lg text-sm font-semibold border border-purple-600 shadow-[0_0_0_3px_rgba(125,39,200,0.4)]"
                        role="tab"
                        aria-selected="true"
                        type="button"
                    >
                        Case Details
                    </button>
                    <button
                        className="px-4 py-2 rounded-lg text-sm font-semibold border border-white/10 hover:-translate-y-0.5 transition"
                        role="tab"
                        aria-selected="false"
                        type="button"
                    >
                        Documents Upload
                    </button>
                </div>

                {/* Case Details Panel */}
                <section className="p-6">
                    {/* Plaintiff Info */}
                    <fieldset className="grid md:grid-cols-2 gap-6">
                        <legend className="text-gray-400 text-sm mb-2 font-semibold">
                            Plaintiff Information
                        </legend>

                        <div>
                            <label className="font-semibold block mb-2">Are you a company or an individual?</label>
                            <div className="flex gap-4 flex-wrap">
                                <label className="flex items-center gap-2 px-3 py-2 rounded-full border border-white/10  cursor-pointer">
                                    <input type="radio" name="plaintiff_type" value="company" required /> Company
                                </label>
                                <label className="flex items-center gap-2 px-3 py-2 rounded-full border border-white/10  cursor-pointer">
                                    <input type="radio" name="plaintiff_type" value="individual" required /> Individual
                                </label>
                            </div>
                            <p className="text-gray-400 text-xs mt-1">Required</p>
                        </div>

                        <div>
                            <label htmlFor="headquarter" className="font-semibold block mb-2">
                                Where is your headquarter?
                            </label>
                            <input
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
                    <fieldset className="grid gap-4 mt-8">
                        <legend className="text-gray-400 text-sm mb-2 font-semibold">
                            Defendant Information
                        </legend>
                        <div>
                            <label htmlFor="defendant-name" className="font-semibold block mb-2">
                                Name of the company
                            </label>
                            <input
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
                    <fieldset className="grid gap-4 mt-8">
                        <legend className="text-gray-400 text-sm mb-2 font-semibold">Case Summary</legend>
                        <div>
                            <label htmlFor="subject" className="font-semibold block mb-2">
                                Subject of your issue
                            </label>
                            <input
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

                {/* Footer */}
                <div className="flex justify-between items-center gap-4 px-6 py-4 border-t border-white/10 bg-white/5">
                    <button type="button" className="px-4 py-2 rounded-lg font-bold text-gray-400 border border-white/10">
                        Back
                    </button>
                    <div className="flex gap-3">
                        <button type="button" className="px-4 py-2 rounded-lg font-bold text-gray-400 border border-white/10">
                            Next
                        </button>
                        <button
                            type="submit"
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