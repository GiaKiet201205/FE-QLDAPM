import React from 'react';
import Button from '../ui/Button';
import { ACCOUNT_ROLE_OPTIONS } from '../../config/roles';
import { Download, Plus, Search } from 'lucide-react';
const AccountToolbar = ({ 
  searchTerm, onSearch, 
  selectedRole, onRoleChange, 
  selectedStatus, onStatusChange, 
  onExport,
  onAddClick
}) => {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
        {/* Khung tìm kiếm */}
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={onSearch}
            placeholder="Search accounts..." 
            aria-label="Search accounts"
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#1a365d]"
          />
        </div>

        <select 
            value={selectedRole} 
            aria-label="Filter by role"
            onChange={onRoleChange}
            className="border border-gray-300 rounded-md text-sm px-3 py-2 text-gray-600 focus:outline-none focus:border-[#1a365d]"
        >
            <option value="All Roles">Role: All Roles</option>
            {ACCOUNT_ROLE_OPTIONS.map(value => <option key={value} value={value}>{value}</option>)}
        </select>

        {/* Lọc Trạng thái */}
        <select 
          value={selectedStatus} 
          aria-label="Filter by status"
          onChange={onStatusChange}
          className="border border-gray-300 rounded-md text-sm px-3 py-2 text-gray-600 focus:outline-none focus:border-[#1a365d]"
        >
          <option value="All Status">Status: All Status</option>
          <option value="Active">Active</option>
          <option value="Locked">Locked</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={onExport}>
          <Download size={16} />
          Export
        </Button>

        <Button variant="primary" onClick={onAddClick}>
          <Plus size={16} /> Add Account
        </Button>
      </div>
    </div>
  );
};

export default AccountToolbar;
