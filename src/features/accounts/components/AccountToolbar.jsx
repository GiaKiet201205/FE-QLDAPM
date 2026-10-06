import React from 'react';

const AccountToolbar = ({ 
  searchTerm, onSearch, 
  selectedRole, onRoleChange, 
  selectedStatus, onStatusChange, 
  onExport,
  onAddClick
}) => {
  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-t-lg border-b border-gray-200">
      <div className="flex items-center space-x-3 w-2/3">
        {/* Khung tìm kiếm */}
        <div className="relative w-64">
          <svg className="w-4 h-4 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            value={searchTerm}
            onChange={onSearch}
            placeholder="Search accounts..." 
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#1a365d]"
          />
        </div>

        <select 
            value={selectedRole} 
            onChange={onRoleChange}
            className="border border-gray-300 rounded-md text-sm px-3 py-2 text-gray-600 focus:outline-none focus:border-[#1a365d]"
        >
            <option value="All Roles">Role: All Roles</option>
            <option value="Teacher">Teacher</option>
            <option value="Teaching Coordinator">Teaching Coordinator</option>
            <option value="CS Specialist">CS Specialist</option>
            <option value="Center Manager">Center Manager</option>
            <option value="Sale">Sale</option>
            <option value="Admin">Admin</option>
        </select>

        {/* Lọc Trạng thái */}
        <select 
          value={selectedStatus} 
          onChange={onStatusChange}
          className="border border-gray-300 rounded-md text-sm px-3 py-2 text-gray-600 focus:outline-none focus:border-[#1a365d]"
        >
          <option value="All Status">Status: All Status</option>
          <option value="Active">Active</option>
          <option value="Locked">Locked</option>
        </select>
      </div>

      <div className="flex items-center space-x-3">
        {/* Nút Export */}
        <button 
          onClick={onExport}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          Export
        </button>
        <button onClick={onAddClick} className="flex items-center px-4 py-2 bg-[#1a365d] text-white rounded-md text-sm font-medium hover:bg-[#122643]">
          + Add Account
        </button>
      </div>
    </div>
  );
};

export default AccountToolbar;