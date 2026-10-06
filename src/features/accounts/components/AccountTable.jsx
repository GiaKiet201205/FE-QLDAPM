import React from 'react';

const AccountTable = ({ 
  accounts, onRowClick, selectedAccountId, 
  currentPage, totalPages, totalItems, onPageChange, itemsPerPage,
  onEditClick
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPaginationGroup = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    const pages = [];
    
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } 
    else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } 
    else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    
    return pages;
  };

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-10">
                <input type="checkbox" className="rounded border-gray-300" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Last Login</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {accounts.length > 0 ? accounts.map((acc) => (
              <tr 
                key={acc.id} 
                onClick={() => onRowClick(acc)}
                className={`hover:bg-blue-50 cursor-pointer ${selectedAccountId === acc.id ? 'bg-blue-50' : ''}`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input type="checkbox" className="rounded border-gray-300" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="shrink-0 h-10 w-10 bg-[#1a365d] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {acc.initials}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{acc.user}</div>
                      <div className="text-sm text-gray-500">{acc.code}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{acc.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="flex items-center text-sm">
                    <span className={`w-2 h-2 rounded-full mr-2 ${acc.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className={acc.status === 'Active' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>{acc.status}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{acc.lastLogin}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    <div className="flex space-x-3">
                        <button 
                        onClick={(e) => {
                            e.stopPropagation(); 
                            onRowClick(acc);
                        }}
                        className="hover:text-[#1a365d] transition-colors"
                        title="Xem chi tiết"
                        >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        </button>

                        <button 
                        onClick={(e) => {
                            e.stopPropagation(); 
                            onEditClick(acc);
                        }}
                        className="hover:text-[#1a365d] transition-colors"
                        title="Chỉnh sửa"
                        >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        </button>
                    </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  Không tìm thấy tài khoản nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex justify-between items-center p-4 text-sm text-gray-500 bg-white border-t border-gray-200">
        <span>Showing <span className="font-semibold">{startItem}-{endItem}</span> of <span className="font-semibold">{totalItems}</span> accounts</span>
        <div className="flex space-x-1">
          <button 
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >&lt;</button>
          
          {getPaginationGroup().map((item, index) => {
            if (item === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 py-1 text-gray-400 font-medium">
                  ...
                </span>
              );
            }
            return (
              <button 
                key={item}
                onClick={() => onPageChange(item)}
                className={`px-3 py-1 border rounded ${currentPage === item ? 'bg-[#1a365d] text-white border-[#1a365d]' : 'border-gray-300 hover:bg-gray-50'}`}
              >
                {item}
              </button>
            );
          })}

          <button 
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >&gt;</button>
        </div>
      </div>
    </div>
  );
};

export default AccountTable;