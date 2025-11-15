import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";

const ForgotPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const langParam =
    searchParams.get("language") || (i18n.language?.startsWith("fa") ? "fa" : "en");
  const withLang = (href: string) =>
    `${href}${href.includes("?") ? "&" : "?"}language=${langParam}`;

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setError(t("forgot_password_email_required"));
      return;
    }

    setIsSubmitting(true);

    const { error: resetError } = await resetPassword(email.trim());

    if (resetError) {
      setError(resetError);
    } else {
      setSuccessMessage(t("forgot_password_success", { email }));
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cargo-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Link to={withLang("/")} className="inline-flex items-center mb-6">
            <div className="w-10 h-10 bg-cargo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="ml-2 text-2xl font-bold text-gray-900">
              CargoBridge
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("forgot_password_title")}
          </h1>
          <p className="text-gray-600">{t("forgot_password_subtitle")}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("forgot_password_email_label")}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-transparent transition-colors border-gray-300"
                placeholder={t("forgot_password_email_placeholder")}
                autoComplete="email"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-cargo-600 hover:bg-cargo-700 disabled:bg-cargo-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              {isSubmitting
                ? t("forgot_password_sending")
                : t("forgot_password_send_link")}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate(withLang("/login"))}
              className="text-cargo-600 hover:text-cargo-500 font-medium"
            >
              {t("forgot_password_back_to_login")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

