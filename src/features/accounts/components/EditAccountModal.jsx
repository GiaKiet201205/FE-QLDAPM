import React, { useState, useEffect } from 'react';

const EditAccountModal = ({ isOpen, onClose, onSubmit, account }) => {
  const [formData, setFormData] = useState({
    id: '', code: '', user: '', username: '', email: '', role: '', department: '',
    passwordPolicy: 'Standard', mfaStatus: 'Pending'
  });

  useEffect(() => {
    if (isOpen && account) {
      setFormData({
        id: account.id,
        code: account.code || '',
        user: account.user || '',
        username: account.username || '',
        email: account.email || '',
        role: account.role || 'Teacher',
        department: account.department || 'Hanoi Main Campus',
        passwordPolicy: account.passwordPolicy || 'Standard',
        mfaStatus: account.mfaStatus || 'Pending'
      });
    }
  }, [isOpen, account]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Edit Account</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="overflow-y-auto px-6 py-5">
          <form id="edit-account-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1.5">
                Account code <span className="text-xs text-gray-400 font-normal">(Không thể sửa)</span>
              </label>
              <input 
                type="text" name="code" value={formData.code} disabled
                className="w-full border border-gray-200 bg-gray-50 rounded px-3 py-2 text-sm text-gray-500 cursor-not-allowed" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1.5">Full name</label>
              <input 
                required type="text" name="user" value={formData.user} onChange={handleChange} 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a365d] focus:border-[#1a365d]" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">Username</label>
                <input 
                  required type="text" name="username" value={formData.username} onChange={handleChange} 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a365d] focus:border-[#1a365d]" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">Email</label>
                <input 
                  type="email" name="email" value={formData.email} onChange={handleChange} 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a365d] focus:border-[#1a365d]" 
                />
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-5">
              <h3 className="text-sm font-medium text-gray-900 ">Role & Department</h3>
              <p className="text-xs text-gray-500 mb-4">Assign the appropriate access level and primary working location for this account.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">Assigned Role</label>
                  <select name="role" value={formData.role} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a365d] focus:border-[#1a365d] bg-white">
                    <option value="Teacher">Teacher</option>
                    <option value="Teaching Coordinator">Teaching Coordinator</option>
                    <option value="CS Specialist">CS Specialist</option>
                    <option value="Center Manager">Center Manager</option>
                    <option value="Sale">Sale</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">Department</label>
                  <select name="department" value={formData.department} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a365d] focus:border-[#1a365d] bg-white">
                    <option value="Hanoi Main Campus">Hanoi Main Campus</option>
                    <option value="HCM Branch">HCM Branch</option>
                    <option value="Da Nang Branch">Da Nang Branch</option>
                    <option value="Headquarters">Headquarters</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-5">
              <h3 className="text-sm font-medium text-gray-900 ">Security & Authentication</h3>
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

          </form>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex justify-end space-x-3 bg-white rounded-b-lg">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-50">Cancel</button>
          <button type="submit" form="edit-account-form" className="px-4 py-2 bg-[#1a365d] text-white rounded text-sm font-medium hover:bg-[#122643]">Save Changes</button>
        </div>
        
      </div>
    </div>
  );
};

export default EditAccountModal;