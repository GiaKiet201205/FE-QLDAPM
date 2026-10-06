import { useState, useMemo } from 'react';
import { mockAccounts } from '../data/mockAccounts';
import { toast } from 'react-toastify';

export const useAccounts = () => {
  const [accounts, setAccounts] = useState(mockAccounts); 
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 

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

  const paginatedAccounts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAccounts.slice(start, start + itemsPerPage);
  }, [filteredAccounts, currentPage]);

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
      [acc.code, acc.user, acc.username, acc.email, acc.role, acc.status, acc.department].join(',')
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
    
    toast.success('Xuất file thành công!');
  };

  const handleAddAccount = (formData) => {
    const newId = accounts.length > 0 ? Math.max(...accounts.map(a => a.id)) + 1 : 1;
    const newCode = `ACC-${1000 + newId}`;
    const nameParts = formData.user.split(' ');
    const initials = nameParts.length > 1 
      ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : formData.user.substring(0, 2).toUpperCase();

    const newAccount = {
      id: newId,
      code: newCode,
      initials,
      status: 'Active',
      lastLogin: 'Chưa đăng nhập',
      createdDate: new Date().toISOString().split('T')[0],
      ipAddress: '-',
      ...formData
    };

    setAccounts([newAccount, ...accounts]);
    toast.success('Thêm tài khoản thành công!');
  };

  // HÀM KHÓA/MỞ KHÓA TÀI KHOẢN
  const handleToggleLock = (accountId) => {
    setAccounts(prevAccounts => prevAccounts.map(acc => {
      if (acc.id === accountId) {
        return { ...acc, status: acc.status === 'Active' ? 'Locked' : 'Active' };
      }
      return acc;
    }));
  };

  // HÀM ĐỔI VAI TRÒ
  const handleChangeRole = (accountId, newRole) => {
    setAccounts(prevAccounts => prevAccounts.map(acc => {
      if (acc.id === accountId) {
        return { ...acc, role: newRole };
      }
      return acc;
    }));
    toast.success('Cập nhật vai trò thành công!');
  };

  //  CHỈNH SỬA TÀI KHOẢN
  const handleEditAccount = (updatedData) => {
    setAccounts(prevAccounts => prevAccounts.map(acc => {
      if (acc.id === updatedData.id) {
        return { ...acc, ...updatedData };
      }
      return acc;
    }));
    toast.success('Cập nhật thông tin tài khoản thành công!');
  };

  return {
    searchTerm, selectedRole, selectedStatus, currentPage, totalPages, totalItems, paginatedAccounts, itemsPerPage,
    handleSearch, handleFilterRole, handleFilterStatus, handlePageChange, handleExport, handleAddAccount,
    handleToggleLock, handleChangeRole, handleEditAccount
  };
};