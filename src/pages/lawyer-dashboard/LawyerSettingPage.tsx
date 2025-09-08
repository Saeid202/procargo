import React, { useState } from 'react';
import { 
  ShieldCheckIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  InformationCircleIcon,
  PhotoIcon,
  GlobeAltIcon,
  FlagIcon
} from '@heroicons/react/24/outline';

const LawyerSettingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('new-analysis');
  const [formData, setFormData] = useState({
    productName: '',
    productCategory: '',
    productDescription: '',
    originCountry: '',
    destinationCountry: '',
    productImage: null as File | null
  });

  const productCategories = [
    'Electronics',
    'Textiles & Apparel',
    'Machinery & Equipment',
    'Chemicals',
    'Food & Beverages',
    'Automotive',
    'Pharmaceuticals',
    'Construction Materials',
    'Agricultural Products',
    'Other'
  ];

  const countries = [
    'China',
    'Canada',
    'United States',
    'Germany',
    'Japan',
    'United Kingdom',
    'France',
    'Australia',
    'Brazil',
    'India'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, productImage: file }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission for compliance analysis
    console.log('Submitting compliance analysis:', formData);
  };

  return (
    <div id="settings" className="tab-content">
          {/* <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
            <p className="text-gray-600 mt-1">Configure your dashboard preferences and account settings.</p>
          </div> */}
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input type="text" value="Agent User" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" value="agent@cargobridge.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" checked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">Email notifications for new orders</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" checked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">SMS alerts for urgent updates</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">Weekly summary reports</span>
                  </label>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
  );
};

export default LawyerSettingPage;
