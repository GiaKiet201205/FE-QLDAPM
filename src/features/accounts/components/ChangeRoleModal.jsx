import React, { useState, useEffect } from 'react';

const ChangeRoleModal = ({ isOpen, onClose, onSubmit, currentRole, accountName }) => {
  const [role, setRole] = useState(currentRole || 'Teacher');

  useEffect(() => {
    if (isOpen) setRole(currentRole);
  }, [isOpen, currentRole]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-60 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Change Role</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-500">
            Chọn vai trò mới cho tài khoản <span className="font-bold text-gray-900">{accountName}</span>.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">Assigned Role</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)} 
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a365d] focus:border-[#1a365d] bg-white"
            >
              <option value="Teacher">Teacher</option>
              <option value="Teaching Coordinator">Teaching Coordinator</option>
              <option value="CS Specialist">CS Specialist</option>
              <option value="Center Manager">Center Manager</option>
              <option value="Sale">Sale</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          
          <div className="pt-4 flex justify-end space-x-3 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-[#1a365d] text-white rounded text-sm font-medium hover:bg-[#122643]">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeRoleModal;