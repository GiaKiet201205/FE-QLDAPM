import React, { useState } from 'react';
import { ACCOUNT_ROLE_OPTIONS } from '../../config/roles';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const AddAccountModal = ({ onClose, onSubmit, nextAccountCode }) => {
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    code: nextAccountCode,
    user: '',
    username: '',
    email: '',
    password: '',
    role: 'Teacher'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await onSubmit(formData);
    if (!result?.ok) {
      setErrors(result?.errors || { general: 'Không thể thêm tài khoản.' });
      return;
    }
    onClose();
  };

  return (
    <Modal title="Add Account" onClose={onClose} maxWidth="max-w-2xl">
      <form id="add-account-form" onSubmit={handleSubmit} className="space-y-5">
        
        {/* Body*/}
        <div className="space-y-5">
            
            {/* Account Code*/}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1.5">Account code</label>
              <input 
                type="text" 
                name="code" 
                value={formData.code} 
                readOnly
                aria-label="Account code"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a365d] focus:border-[#1a365d]" 
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1.5">Full name</label>
              <input 
                required 
                type="text" 
                name="user" 
                value={formData.user} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a365d] focus:border-[#1a365d]" 
              />
            </div>

            {/* Username & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">Username</label>
                <input 
                  required 
                  type="text" 
                  name="username" 
                  value={formData.username} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a365d] focus:border-[#1a365d]" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Email (required)
                </label>
                <input 
                  type="email"
                  required
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a365d] focus:border-[#1a365d]" 
                />
              </div>
            </div>

            <label className="block text-sm font-medium text-gray-900">
              Initial password (at least 8 characters)
              <input required type="password" name="password" minLength={8}
                autoComplete="new-password" value={formData.password}
                onChange={handleChange}
                className="mt-1.5 w-full border border-gray-300 rounded px-3 py-2 text-sm" />
              <span className="mt-1 block text-xs text-gray-500">
                Nhập mật khẩu riêng và chuyển cho nhân sự qua kênh bảo mật.
              </span>
            </label>
            <div className="rounded-lg border border-gray-200 p-4">
              <label className="block text-sm font-medium text-gray-900">
                Vai trò nhân sự
                <select name="role" value={formData.role} onChange={handleChange}
                  className="mt-1.5 w-full rounded border border-gray-300 bg-white px-3 py-2">
                  {ACCOUNT_ROLE_OPTIONS.filter(value => value !== "Admin").map(value =>
                    <option key={value} value={value}>{value}</option>)}
                </select>
              </label>
              <p className="mt-2 text-xs text-gray-500">
                Chỉ role, thông tin nhân sự và mật khẩu ban đầu được lưu trên BE.
                Department và MFA chưa có API cấu hình và không được giả lập.
              </p>
            </div>
        </div>
        {Object.values(errors).filter(Boolean).length > 0 && (
          <div role="alert" className="space-y-1 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {Object.entries(errors).filter(([, message]) => message).map(([field, message]) => <p key={field}>{message}</p>)}
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-200 pt-4 flex justify-end space-x-3">
          <Button type="button" onClick={onClose}>
            Cancel
          </Button>

          <Button type="submit" variant="primary">
            Add Account
          </Button>
        </div>
      </form>
  </Modal>
  );
};

export default AddAccountModal;
