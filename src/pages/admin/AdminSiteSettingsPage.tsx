import React, { useState, useEffect } from "react";
import {
  ContentManagementService,
  SiteSettings,
} from "../../services/contentManagementService";
import { toast } from "react-hot-toast";
import {
  CogIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  PhotoIcon,
  ChartBarIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

const AdminSiteSettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    site_name: "",
    site_description: "",
    contact_email: "",
    contact_phone: "",
    address: "",
    social_facebook: "",
    social_twitter: "",
    social_linkedin: "",
    social_instagram: "",
    logo_url: "",
    favicon_url: "",
    analytics_code: "",
  });

  useEffect(() => {
    loadSiteSettings();
  }, []);

  const loadSiteSettings = async () => {
    setLoading(true);
    const { settings: data, error } =
      await ContentManagementService.getSiteSettings();
    if (error) {
      toast.error(error);
    } else {
      if (data) {
        setFormData({
          site_name: data.site_name || "",
          site_description: data.site_description || "",
          contact_email: data.contact_email || "",
          contact_phone: data.contact_phone || "",
          address: data.address || "",
          social_facebook: data.social_facebook || "",
          social_twitter: data.social_twitter || "",
          social_linkedin: data.social_linkedin || "",
          social_instagram: data.social_instagram || "",
          logo_url: data.logo_url || "",
          favicon_url: data.favicon_url || "",
          analytics_code: data.analytics_code || "",
        });
      }
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await ContentManagementService.updateSiteSettings(
        formData
      );
      if (error) {
        toast.error(error);
      } else {
        toast.success("Site settings updated successfully");
        loadSiteSettings();
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cargo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
            <p className="text-gray-600 mt-1">
              Configure your website's global settings
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <CheckCircleIcon className="h-4 w-4 text-green-500" />
            <span>Settings saved</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Settings */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center mb-6">
            <CogIcon className="h-6 w-6 text-cargo-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">
              General Settings
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={formData.site_name}
                onChange={(e) => handleInputChange("site_name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                placeholder="Your Company Name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Description
              </label>
              <textarea
                value={formData.site_description}
                onChange={(e) =>
                  handleInputChange("site_description", e.target.value)
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                placeholder="Brief description of your website"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center mb-6">
            <EnvelopeIcon className="h-6 w-6 text-cargo-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">
              Contact Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) =>
                  handleInputChange("contact_email", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                placeholder="contact@yourcompany.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone
              </label>
              <input
                type="tel"
                value={formData.contact_phone}
                onChange={(e) =>
                  handleInputChange("contact_phone", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                placeholder="Your company address"
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center mb-6">
            <GlobeAltIcon className="h-6 w-6 text-cargo-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">
              Social Media
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook URL
              </label>
              <input
                type="url"
                value={formData.social_facebook}
                onChange={(e) =>
                  handleInputChange("social_facebook", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                placeholder="https://facebook.com/yourcompany"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twitter URL
              </label>
              <input
                type="url"
                value={formData.social_twitter}
                onChange={(e) =>
                  handleInputChange("social_twitter", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                placeholder="https://twitter.com/yourcompany"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={formData.social_linkedin}
                onChange={(e) =>
                  handleInputChange("social_linkedin", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                placeholder="https://linkedin.com/company/yourcompany"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram URL
              </label>
              <input
                type="url"
                value={formData.social_instagram}
                onChange={(e) =>
                  handleInputChange("social_instagram", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                placeholder="https://instagram.com/yourcompany"
              />
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center mb-6">
            <PhotoIcon className="h-6 w-6 text-cargo-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Branding</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo URL
              </label>
              <input
                type="url"
                value={formData.logo_url}
                onChange={(e) => handleInputChange("logo_url", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                placeholder="https://yourdomain.com/logo.png"
              />
              {formData.logo_url && (
                <div className="mt-2">
                  <img
                    src={formData.logo_url}
                    alt="Logo preview"
                    className="h-16 w-auto object-contain border border-gray-200 rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Favicon URL
              </label>
              <input
                type="url"
                value={formData.favicon_url}
                onChange={(e) =>
                  handleInputChange("favicon_url", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                placeholder="https://yourdomain.com/favicon.ico"
              />
              {formData.favicon_url && (
                <div className="mt-2">
                  <img
                    src={formData.favicon_url}
                    alt="Favicon preview"
                    className="h-8 w-8 object-contain border border-gray-200 rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center mb-6">
            <ChartBarIcon className="h-6 w-6 text-cargo-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Analytics</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Analytics Code
            </label>
            <textarea
              value={formData.analytics_code}
              onChange={(e) =>
                handleInputChange("analytics_code", e.target.value)
              }
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500 font-mono text-sm"
              placeholder="<!-- Google Analytics or other tracking code -->"
            />
            <p className="mt-2 text-sm text-gray-500">
              Paste your Google Analytics, Google Tag Manager, or other tracking
              code here.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <InformationCircleIcon className="h-4 w-4" />
              <span>
                Changes are saved automatically when you submit the form
              </span>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-cargo-600 hover:bg-cargo-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminSiteSettingsPage;
