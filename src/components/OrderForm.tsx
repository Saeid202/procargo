import React, { useState } from 'react';
import { XMarkIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

interface OrderFormProps {
  onClose: () => void;
  onSubmit: (orderData: any) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ onClose, onSubmit }) => {
  const [supplierCount, setSupplierCount] = useState(1);
  const [supplierLinks, setSupplierLinks] = useState<{ [key: number]: string[] }>({ 0: [''] });
  const [supplierFiles, setSupplierFiles] = useState<{ [key: number]: File[] }>({ 0: [] });

  const addSupplier = () => {
    setSupplierCount(prev => prev + 1);
    setSupplierLinks(prev => ({ ...prev, [supplierCount]: [''] }));
    setSupplierFiles(prev => ({ ...prev, [supplierCount]: [] }));
  };

  const removeSupplier = (index: number) => {
    if (supplierCount > 1) {
      setSupplierCount(prev => prev - 1);
      const newLinks = { ...supplierLinks };
      const newFiles = { ...supplierFiles };
      delete newLinks[index];
      delete newFiles[index];
      setSupplierLinks(newLinks);
      setSupplierFiles(newFiles);
    }
  };

  const addLink = (supplierIndex: number) => {
    setSupplierLinks(prev => ({
      ...prev,
      [supplierIndex]: [...(prev[supplierIndex] || []), '']
    }));
  };

  const removeLink = (supplierIndex: number, linkIndex: number) => {
    setSupplierLinks(prev => ({
      ...prev,
      [supplierIndex]: prev[supplierIndex].filter((_, i) => i !== linkIndex)
    }));
  };

  const updateLink = (supplierIndex: number, linkIndex: number, value: string) => {
    setSupplierLinks(prev => ({
      ...prev,
      [supplierIndex]: prev[supplierIndex].map((link, i) => i === linkIndex ? value : link)
    }));
  };

  const addFile = (supplierIndex: number) => {
    setSupplierFiles(prev => ({
      ...prev,
      [supplierIndex]: [...(prev[supplierIndex] || []), null as any]
    }));
  };

  // Initialize supplier files if not exists
  React.useEffect(() => {
    if (!supplierFiles[0]) {
      setSupplierFiles(prev => ({ ...prev, 0: [] }));
    }
  }, []);

  const removeFile = (supplierIndex: number, fileIndex: number) => {
    setSupplierFiles(prev => ({
      ...prev,
      [supplierIndex]: prev[supplierIndex].filter((_, i) => i !== fileIndex)
    }));
  };

  const updateFile = (supplierIndex: number, fileIndex: number, file: File) => {
    setSupplierFiles(prev => ({
      ...prev,
      [supplierIndex]: prev[supplierIndex].map((f, i) => i === fileIndex ? file : f)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('OrderForm: Form submitted, processing data...');
    
    // Handle form submission
    const formData = new FormData(e.target as HTMLFormElement);
    const orderData = {
      suppliers: Array.from({ length: supplierCount }, (_, i) => ({
        productName: formData.get(`product_name_${i}`),
        supplierLinks: supplierLinks[i] || [],
        quantity: formData.get(`quantity_${i}`),
        unitType: formData.get(`unit_type_${i}`),
        unitPrice: formData.get(`unit_price_${i}`),
        logisticsType: formData.get(`logistics_type_${i}`),
        specialInstructions: formData.get(`special_instructions_${i}`),
        notes: formData.get(`notes_${i}`),
        files: supplierFiles[i] || []
      }))
    };
    
    console.log('OrderForm: Processed order data:', orderData);
    console.log('OrderForm: Calling onSubmit with data...');
    
    // Call the parent's onSubmit function
    onSubmit(orderData);
    
    console.log('OrderForm: onSubmit called successfully');
  };

  const renderSupplierSection = (index: number) => (
    <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 relative">
      <button
        type="button"
        onClick={() => removeSupplier(index)}
        className="absolute top-4 right-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
        disabled={supplierCount === 1}
      >
        <MinusIcon className="h-5 w-5" />
      </button>
      
      <h5 className="text-lg font-semibold text-gray-900 mb-4">Supplier {index + 1}</h5>

      {/* Product Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Name & Description (Optional)
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
          name={`product_name_${index}`}
          rows={2}
          placeholder="Enter product name and description..."
        />
      </div>

      {/* Supplier Links */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Supplier Links
        </label>
        <div className="space-y-2">
          {(supplierLinks[index] || ['']).map((link, linkIndex) => (
            <div key={linkIndex} className="flex items-center space-x-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                placeholder="Alibaba / 1688 link"
                value={link}
                onChange={(e) => updateLink(index, linkIndex, e.target.value)}
              />
              {(supplierLinks[index] || []).length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLink(index, linkIndex)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => addLink(index)}
          className="mt-2 px-3 py-1 text-sm text-cargo-600 hover:text-cargo-700 border border-cargo-300 hover:border-cargo-400 rounded-lg transition-colors flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Another Link
        </button>
      </div>

      {/* Quantity/Units/Price */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
            name={`quantity_${index}`}
            placeholder="Enter quantity"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Units</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
            name={`unit_type_${index}`}
          >
            <option value="Pcs">Pcs</option>
            <option value="Cartons">Cartons</option>
            <option value="Kg">Kg</option>
            <option value="Tons">Tons</option>
            <option value="CBM">CBM</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price (Optional)</label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
            name={`unit_price_${index}`}
            placeholder="Enter unit price"
            step="0.01"
          />
        </div>
      </div>

      {/* Logistics */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Logistics Type</label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
          name={`logistics_type_${index}`}
        >
          <option value="Air">Air Freight</option>
          <option value="Sea">Sea Freight</option>
          <option value="Express">Express</option>
          <option value="Consolidation">Consolidation</option>
        </select>
      </div>

      {/* Instructions & Notes */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions (Optional)</label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
          name={`special_instructions_${index}`}
          rows={2}
          placeholder="Enter special instructions..."
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
          name={`notes_${index}`}
          rows={2}
          placeholder="Enter additional notes..."
        />
      </div>

      {/* Uploads */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Files (Optional)</label>
        <div className="space-y-2">
          {supplierFiles[index] && supplierFiles[index].length > 0 ? (
            supplierFiles[index].map((file, fileIndex) => (
              <div key={fileIndex} className="flex items-center space-x-2">
                <input
                  type="file"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) {
                      updateFile(index, fileIndex, selectedFile);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeFile(index, fileIndex)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="flex items-center space-x-2">
              <input
                type="file"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) {
                    updateFile(index, 0, selectedFile);
                  }
                }}
              />
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => addFile(index)}
          className="mt-2 px-3 py-1 text-sm text-cargo-600 hover:text-cargo-700 border border-cargo-300 hover:border-cargo-400 rounded-lg transition-colors flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Another File
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-50 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Create New Order</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Suppliers Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
              {Array.from({ length: supplierCount }, (_, i) => renderSupplierSection(i))}
            </div>

            {/* Add Supplier Button */}
            <button
              type="button"
              onClick={addSupplier}
              className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-cargo-400 hover:text-cargo-600 transition-colors flex items-center justify-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Another Supplier
            </button>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-cargo-600 text-white rounded-lg hover:bg-cargo-700 transition-colors font-medium"
              >
                Submit Order
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
