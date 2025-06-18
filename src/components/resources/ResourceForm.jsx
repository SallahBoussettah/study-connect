import React, { useState, useRef, useEffect } from 'react';
import { FaUpload, FaTimes, FaSpinner, FaLink } from 'react-icons/fa';

const ResourceForm = ({ resource, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Document',
    url: '',
    file: null,
    fileRequired: !resource
  });
  const [isUrlResource, setIsUrlResource] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (resource) {
      setFormData({
        title: resource.title || '',
        description: resource.description || '',
        type: resource.type || 'Document',
        url: resource.url || '',
        file: null,
        fileRequired: false
      });
      setIsUrlResource(!!resource.url && !resource.filePath);
    }
  }, [resource]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData(prev => ({
      ...prev,
      file,
      fileRequired: false
    }));
    
    // Set file type based on mime type
    const fileType = getFileType(file.type);
    if (fileType) {
      setFormData(prev => ({
        ...prev,
        type: fileType
      }));
    }

    // Create a preview for image files
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const getFileType = (mimeType) => {
    if (mimeType.startsWith('image/')) return 'Image';
    if (mimeType === 'application/pdf') return 'PDF';
    if (mimeType.includes('document') || mimeType.includes('text')) return 'Document';
    return 'Other';
  };

  const handleResourceTypeToggle = () => {
    setIsUrlResource(prev => !prev);
    setFormData(prev => ({
      ...prev,
      file: null,
      url: '',
      fileRequired: !isUrlResource && !resource
    }));
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeSelectedFile = () => {
    setFormData(prev => ({
      ...prev,
      file: null,
      fileRequired: !resource
    }));
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (isUrlResource && !formData.url.trim()) {
      newErrors.url = 'URL is required for link resources';
    } else if (isUrlResource && !isValidUrl(formData.url)) {
      newErrors.url = 'Please enter a valid URL';
    }
    
    if (!isUrlResource && formData.fileRequired && !formData.file) {
      newErrors.file = 'Please select a file to upload';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        ...formData,
        isUrlResource
      });
    }
  };

  const renderFilePreview = () => {
    if (!filePreview && formData.file) {
      return (
        <div className="flex items-center mt-2">
          <span className="text-secondary-700 bg-secondary-100 px-3 py-1 rounded-md text-sm">
            {formData.file.name} ({Math.round(formData.file.size / 1024)} KB)
          </span>
          <button
            type="button"
            onClick={removeSelectedFile}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            <FaTimes />
          </button>
        </div>
      );
    }
    
    if (filePreview) {
      return (
        <div className="mt-2 relative">
          <img src={filePreview} alt="Preview" className="max-h-40 rounded-md" />
          <button
            type="button"
            onClick={removeSelectedFile}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-700"
          >
            <FaTimes size={14} />
          </button>
        </div>
      );
    }
    
    return null;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="resourceType" className="block text-sm font-medium text-secondary-700">
            Resource Type
          </label>
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => !isUrlResource || handleResourceTypeToggle()}
            className={`flex-1 py-2 px-4 rounded-md border ${
              !isUrlResource
                ? 'bg-primary-50 border-primary-500 text-primary-700'
                : 'bg-white border-secondary-300 text-secondary-700'
            } focus:outline-none transition-colors`}
          >
            <div className="flex items-center justify-center">
              <FaUpload className="mr-2" />
              <span>Upload File</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => isUrlResource || handleResourceTypeToggle()}
            className={`flex-1 py-2 px-4 rounded-md border ${
              isUrlResource
                ? 'bg-primary-50 border-primary-500 text-primary-700'
                : 'bg-white border-secondary-300 text-secondary-700'
            } focus:outline-none transition-colors`}
          >
            <div className="flex items-center justify-center">
              <FaLink className="mr-2" />
              <span>External Link</span>
            </div>
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-secondary-700">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.title ? 'border-red-300' : 'border-secondary-300'
          } shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-secondary-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows="3"
          value={formData.description}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-secondary-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="Optional description of the resource"
        ></textarea>
      </div>

      {isUrlResource ? (
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-secondary-700">
            URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            id="url"
            name="url"
            value={formData.url}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border ${
              errors.url ? 'border-red-300' : 'border-secondary-300'
            } shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
            placeholder="https://example.com"
          />
          {errors.url && <p className="mt-1 text-sm text-red-600">{errors.url}</p>}
        </div>
      ) : (
        <div>
          <label htmlFor="file" className="block text-sm font-medium text-secondary-700">
            File {formData.fileRequired && <span className="text-red-500">*</span>}
          </label>
          <div className="mt-1">
            <div
              className={`flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                errors.file ? 'border-red-300 bg-red-50' : 'border-secondary-300 hover:border-primary-500'
              }`}
            >
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-secondary-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-secondary-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,application/zip"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-secondary-500">
                  PDF, Word, Excel, Images, Text up to 10MB
                </p>
              </div>
            </div>
          </div>
          {renderFilePreview()}
          {errors.file && <p className="mt-1 text-sm text-red-600">{errors.file}</p>}
        </div>
      )}

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-secondary-700">
          Resource Type
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-secondary-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="Document">Document</option>
          <option value="PDF">PDF</option>
          <option value="Image">Image</option>
          <option value="Spreadsheet">Spreadsheet</option>
          <option value="Presentation">Presentation</option>
          <option value="Code">Code</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center py-2 px-4 border border-secondary-300 shadow-sm text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="inline-flex items-center">
              <FaSpinner className="animate-spin mr-2" />
              {resource ? 'Updating...' : 'Uploading...'}
            </span>
          ) : resource ? (
            'Update Resource'
          ) : (
            'Add Resource'
          )}
        </button>
      </div>
    </form>
  );
};

export default ResourceForm; 