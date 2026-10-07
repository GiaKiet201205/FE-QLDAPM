import React, { useState } from 'react';
import { ACCOUNT_ROLE_OPTIONS } from '../../../config/roles';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';

const AddAccountModal = ({ onClose, onSubmit, nextAccountCode }) => {
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    code: nextAccountCode,
    user: '',
    username: '',
    email: '',
    role: 'Teacher',
    department: 'Hanoi Main Campus',
    passwordPolicy: 'Standard',
    mfaStatus: 'Pending'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = onSubmit(formData);
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
                  Email <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a365d] focus:border-[#1a365d]" 
                />
              </div>
            </div>

            {/*  Role & Department  */}
            <div className="border border-gray-200 rounded-lg p-5">
              <h3 className="text-sm font-medium text-gray-900 mb-1">Role & Department</h3>
              <p className="text-xs text-gray-500 mb-4">Assign the appropriate access level and primary working location for this account.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">Assigned Role</label>
                  <select 
                    name="role" 
                    value={formData.role} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a365d] focus:border-[#1a365d] bg-white"
                  >
                    {ACCOUNT_ROLE_OPTIONS.map(value => <option key={value} value={value}>{value}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">Department</label>
                  <select 
                    name="department" 
                    value={formData.department} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a365d] focus:border-[#1a365d] bg-white"
                  >
                    <option value="Hanoi Main Campus">Hanoi Main Campus</option>
                    <option value="HCM Branch">HCM Branch</option>
                    <option value="Da Nang Branch">Da Nang Branch</option>
                    <option value="Headquarters">Headquarters</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Security & Authentication */}
            <div className="border border-gray-200 rounded-lg p-5">
              <h3 className="text-sm font-medium text-gray-900 mb-1">Security & Authentication</h3>
              <p className="text-xs text-gray-500 mb-4">Configure password policies and multi-factor authentication requirements.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">Password Policy</label>
                  <select 
                    name="passwordPolicy" 
                    value={formData.passwordPolicy} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a365d] focus:border-[#1a365d] bg-white"
                  >
                    <option value="Standard">Standard</option>
                    <option value="SSO Managed">SSO Managed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">MFA Status</label>
                  <select 
                    name="mfaStatus" 
                    value={formData.mfaStatus} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a365d] focus:border-[#1a365d] bg-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Disabled">Disabled</option>
                    <option value="Enforced">Enforced</option>
                  </select>
                </div>
              </div>
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
