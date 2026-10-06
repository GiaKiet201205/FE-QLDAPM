import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AccountToolbar from '../features/accounts/components/AccountToolbar';
import AccountTable from '../features/accounts/components/AccountTable';
import AccountDetailPanel from '../features/accounts/components/AccountDetailPanel';
import AddAccountModal from '../features/accounts/components/AddAccountModal';
import ChangeRoleModal from '../features/accounts/components/ChangeRoleModal'; // Import Modal mới
import EditAccountModal from '../features/accounts/components/EditAccountModal'; // 1. Import Component
import { useAccounts } from '../features/accounts/hooks/useAccounts';

const AccountManagement = () => {
  const {
    searchTerm, selectedRole, selectedStatus,
    currentPage, totalPages, totalItems, paginatedAccounts, itemsPerPage,
    handleSearch, handleFilterRole, handleFilterStatus,
    handlePageChange, handleExport, handleAddAccount,
    handleToggleLock, handleChangeRole, handleEditAccount,  
  } = useAccounts();

  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); 
  const [accountToEdit, setAccountToEdit] = useState(null); 

  const onToggleLockAccount = () => {
    if (!selectedAccount) return;
    handleToggleLock(selectedAccount.id);
    
    const newStatus = selectedAccount.status === 'Active' ? 'Locked' : 'Active';
    setSelectedAccount(prev => ({ ...prev, status: newStatus }));
    
    toast.success(`Đã ${newStatus === 'Locked' ? 'khóa' : 'mở khóa'} tài khoản ${selectedAccount.user}`);
  };

  const onChangeRoleSubmit = (newRole) => {
    if (!selectedAccount) return;
    handleChangeRole(selectedAccount.id, newRole);
    setSelectedAccount(prev => ({ ...prev, role: newRole }));
  };

  //  Wrapper hàm mở form Edit
  const handleOpenEditModal = (account) => {
    setAccountToEdit(account);
    setIsEditModalOpen(true);
  };

  // Wrapper hàm submit form Edit
  const onEditAccountSubmit = (updatedData) => {
    handleEditAccount(updatedData);
    if (selectedAccount && selectedAccount.id === updatedData.id) {
      setSelectedAccount(prev => ({ ...prev, ...updatedData }));
    }
  };

  return (
    <div className="flex h-full w-full bg-gray-50 p-6 overflow-hidden relative">
      <div className={`flex flex-col transition-all duration-300 ${selectedAccount ? 'w-[calc(100%-20rem)] pr-6' : 'w-full'}`}>
        
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
        
        <div className="bg-white shadow-sm rounded-b-lg border border-gray-200 border-t-0 overflow-hidden">
          <AccountTable 
            accounts={paginatedAccounts} 
            onRowClick={(account) => setSelectedAccount(account)} 
            selectedAccountId={selectedAccount?.id}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onEditClick={handleOpenEditModal}
          />
        </div>
      </div>

      {selectedAccount && (
        <div className="w-80 h-full bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 shrink-0 animate-fade-in-right">
          <AccountDetailPanel 
            account={selectedAccount} 
            onClose={() => setSelectedAccount(null)} 
            onToggleLock={onToggleLockAccount}
            onChangeRoleClick={() => setIsChangeRoleModalOpen(true)}
          />
        </div>
      )}

      <AddAccountModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSubmit={handleAddAccount} 
        totalAccounts={totalItems}
      />

      <ChangeRoleModal 
        isOpen={isChangeRoleModalOpen}
        onClose={() => setIsChangeRoleModalOpen(false)}
        onSubmit={onChangeRoleSubmit}
        currentRole={selectedAccount?.role}
        accountName={selectedAccount?.user}
      />

      <EditAccountModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={onEditAccountSubmit}
        account={accountToEdit}
      />
    </div>
  );
};

export default AccountManagement;