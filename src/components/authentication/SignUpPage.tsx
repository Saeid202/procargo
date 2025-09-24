import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    subscribeToNewsletter: false,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.company.trim()) {
      newErrors.company = "Company name is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage("");

    try {
      // Prepare business data for the database
      const businessData = {
        companyName: formData.company,
        businessType: "Import/Export", // Default value
        taxId: "", // Will be filled later in profile
        address: "", // Will be filled later in profile
        importLicense: "",
        exportLicense: "",
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        subscribeToNewsletter: formData.subscribeToNewsletter,
      };

      // Call the signUp function from AuthContext
      const { error } = await signUp(
        formData.email,
        formData.password,
        businessData
      );

      if (error) {
        if (
          error.includes("already registered") ||
          error.includes("already exists")
        ) {
          setErrors({
            submit:
              "An account with this email already exists. Please sign in instead.",
          });
        } else {
          setErrors({
            submit:
              error || "An error occurred during signup. Please try again.",
          });
        }
      } else {
        // Success! Show confirmation message
        setSuccessMessage(
          "Account created successfully! Please check your email for confirmation."
        );

        // Clear form data
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          company: "",
          password: "",
          confirmPassword: "",
          agreeToTerms: false,
          subscribeToNewsletter: false,
        });

        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      setErrors({
        submit: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cargo-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center mb-6">
            <div className="w-10 h-10 bg-cargo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="ml-2 text-2xl font-bold text-gray-900">
              CargoBridge
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Your Account
          </h1>
          <p className="text-gray-600">
            Join thousands of businesses shipping between China and Canada
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-transparent transition-colors ${
                    errors.firstName ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-transparent transition-colors ${
                    errors.lastName ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-transparent transition-colors ${
                  errors.email ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="john@company.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-transparent transition-colors ${
                  errors.phone ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Company */}
            <div>
              <label
                htmlFor="company"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Company Name *
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-transparent transition-colors ${
                  errors.company ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Your Company Ltd."
              />
              {errors.company && (
                <p className="mt-1 text-sm text-red-600">{errors.company}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-transparent transition-colors ${
                    errors.password ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 8 characters long
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-transparent transition-colors ${
                    errors.confirmPassword
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Checkboxes */}
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-cargo-600 focus:ring-cargo-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="agreeToTerms" className="text-gray-700">
                    I agree to the{" "}
                    <a href="#" className="text-cargo-600 hover:text-cargo-500">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-cargo-600 hover:text-cargo-500">
                      Privacy Policy
                    </a>{" "}
                    *
                  </label>
                </div>
              </div>
              {errors.agreeToTerms && (
                <p className="ml-7 text-sm text-red-600">
                  {errors.agreeToTerms}
                </p>
              )}

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="subscribeToNewsletter"
                    name="subscribeToNewsletter"
                    type="checkbox"
                    checked={formData.subscribeToNewsletter}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-cargo-600 focus:ring-cargo-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="subscribeToNewsletter"
                    className="text-gray-700"
                  >
                    Subscribe to our newsletter for shipping updates and
                    industry insights
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-600">{successMessage}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-cargo-600 hover:bg-cargo-700 disabled:bg-cargo-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-cargo-600 hover:text-cargo-500 font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Why Sign Up?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-center justify-center">
              <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
              Free Quotes
            </div>
            <div className="flex items-center justify-center">
              <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
              Track Shipments
            </div>
            <div className="flex items-center justify-center">
              <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
              24/7 Support
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
