import React, { useState } from 'react';
import { ACCOUNT_ROLE_OPTIONS } from '../../config/roles';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const ChangeRoleModal = ({ onClose, onSubmit, currentRole, accountName }) => {
  const [role, setRole] = useState(currentRole || 'Teacher');

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = onSubmit(role);
    if (result?.ok === false) return;
    onClose();
  };

  return (
    <Modal title="Change Role" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-500">
          Chọn vai trò mới cho tài khoản{' '}
          <span className="font-semibold text-slate-900">{accountName}</span>.
        </p>

        <div>
          <label className="block text-sm font-medium text-slate-900 mb-1.5">
            Assigned Role
          </label>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#173557] focus:border-[#173557]"
          >
            {ACCOUNT_ROLE_OPTIONS.map(value => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-3">
          <Button type="button" onClick={onClose}>
            Cancel
          </Button>

          <Button type="submit" variant="primary" disabled={role === currentRole}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ChangeRoleModal;
