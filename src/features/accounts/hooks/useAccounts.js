import { useState, useMemo } from 'react';
import { useAccountData } from './useAccountData';
import { toast } from 'react-toastify';

export const useAccounts = () => {
  const { accounts, addAccount, toggleLock, changeRole, nextAccountCode } = useAccountData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [requestedPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const matchSearch =
        acc.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = selectedRole === 'All Roles' || acc.role === selectedRole;
      const matchStatus = selectedStatus === 'All Status' || acc.status === selectedStatus;

      return matchSearch && matchRole && matchStatus;
    });
  }, [accounts, searchTerm, selectedRole, selectedStatus]);

  const totalItems = filteredAccounts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const currentPage = Math.min(requestedPage, totalPages);

  const paginatedAccounts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAccounts.slice(start, start + itemsPerPage);
  }, [filteredAccounts, currentPage, itemsPerPage]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterRole = (e) => {
    setSelectedRole(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterStatus = (e) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleExport = () => {
    if (filteredAccounts.length === 0) {
      toast.warning('Không có dữ liệu để xuất!');
      return;
    }
    const headers = ['Mã NV', 'Họ tên', 'Tên đăng nhập', 'Email', 'Vai trò', 'Trạng thái', 'Phòng ban'];
    const csvData = filteredAccounts.map(acc => 
      [acc.code, acc.user, acc.username, acc.email, acc.role, acc.status, acc.department]
        .map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')
    );
    const csvContent = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `danh_sach_tai_khoan_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Xuất file thành công!');
  };

  const handleAddAccount = (formData) => {
    const result = addAccount(formData);
    if (!result.ok) return result;
    setSearchTerm('');
    setSelectedRole('All Roles');
    setSelectedStatus('All Status');
    setCurrentPage(1);
    toast.success('Thêm tài khoản thành công!');
    return result;
  };

  // HÀM KHÓA/MỞ KHÓA TÀI KHOẢN
  const handleToggleLock = (accountId) => {
    toggleLock(accountId);
  };

  // HÀM ĐỔI VAI TRÒ
  const handleChangeRole = (accountId, newRole) => {
    const result = changeRole(accountId, newRole);
    if (!result.ok) { toast.error(result.reason); return result; }
    toast.success('Cập nhật vai trò thành công!');
    return result;
  };

  return {
    accounts, nextAccountCode,
    searchTerm, selectedRole, selectedStatus, currentPage, totalPages, totalItems, paginatedAccounts, itemsPerPage,
    handleSearch, handleFilterRole, handleFilterStatus, handlePageChange, handleExport, handleAddAccount,
    handleToggleLock, handleChangeRole
  };
};
