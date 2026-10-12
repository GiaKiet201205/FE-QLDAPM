import React, { useState } from 'react';
import { toast } from 'react-toastify';
import AccountToolbar from '../components/accounts/AccountToolbar';
import AccountTable from '../components/accounts/AccountTable';
import AccountDetailPanel from '../components/accounts/AccountDetailPanel';
import AddAccountModal from '../components/accounts/AddAccountModal';
import ChangeRoleModal from '../components/accounts/ChangeRoleModal';
import { useAccounts } from '../features/accounts/hooks/useAccounts';

const AccountManagement = () => {
  const {
    accounts, nextAccountCode,
    searchTerm, selectedRole, selectedStatus,
    currentPage, totalItems, paginatedAccounts, itemsPerPage,
    handleSearch, handleFilterRole, handleFilterStatus,
    handlePageChange, handleExport, handleAddAccount,
    handleToggleLock, handleChangeRole,
  } = useAccounts();

  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const selectedAccount = accounts.find(account => account.id === selectedAccountId) || null;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false);

  const onToggleLockAccount = () => {
    if (!selectedAccount) return;
    handleToggleLock(selectedAccount.id);
    
    const newStatus = selectedAccount.status === 'Active' ? 'Locked' : 'Active';
    
    toast.success(`Đã ${newStatus === 'Locked' ? 'khóa' : 'mở khóa'} tài khoản ${selectedAccount.user}`);
  };

  const onChangeRoleSubmit = (newRole) => {
    if (!selectedAccount) return;
    return handleChangeRole(selectedAccount.id, newRole);
  };

  return (
    <div className={`grid items-start gap-4 ${selectedAccount ? 'xl:grid-cols-[minmax(0,1fr)_350px]' : 'grid-cols-1'}`}>
      <div className="min-w-0">
        
        <AccountToolbar 
          searchTerm={searchTerm}
          onSearch={handleSearch}
          selectedRole={selectedRole}
          onRoleChange={handleFilterRole}
          selectedStatus={selectedStatus}
          onStatusChange={handleFilterStatus}
          onExport={handleExport}
          onAddClick={() => setIsAddModalOpen(true)}
        />
        
          <AccountTable 
            accounts={paginatedAccounts} 
            onRowClick={(account) => setSelectedAccountId(account.id)}
            selectedAccountId={selectedAccount?.id}
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
      </div>

      {selectedAccount && (
        <div className="min-w-0">
          <AccountDetailPanel 
            account={selectedAccount} 
            key={selectedAccount.id}
            onClose={() => setSelectedAccountId(null)}
            onToggleLock={onToggleLockAccount}
            onChangeRoleClick={() => setIsChangeRoleModalOpen(true)}
          />
        </div>
      )}

      {isAddModalOpen && <AddAccountModal
        onClose={() => setIsAddModalOpen(false)} 
        onSubmit={handleAddAccount} 
        nextAccountCode={nextAccountCode}
      />}

      {isChangeRoleModalOpen && selectedAccount && <ChangeRoleModal
        onClose={() => setIsChangeRoleModalOpen(false)}
        onSubmit={onChangeRoleSubmit}
        currentRole={selectedAccount?.role}
        accountName={selectedAccount?.user}
      />}

    </div>
  );
};

export default AccountManagement;
