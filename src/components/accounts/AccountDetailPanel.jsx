import React, { useState } from 'react';
import { toast } from 'react-toastify';
import DetailPanel from '../ui/DetailPanel';
import Button from '../ui/Button';

const AccountDetailPanel = ({ account, onClose, onToggleLock, onChangeRoleClick }) => {
  const [activeTab, setActiveTab] = useState('Overview');

  if (!account) return null;

  const handleResetPassword = () => {
    toast.info('Đặt lại mật khẩu chưa được kết nối. Chưa có email nào được gửi.');
  };

  const tabs = [
    { key: 'Overview', label: 'Overview' },
    { key: 'Roles', label: 'Roles' },
    { key: 'Activity', label: 'Activity' },
  ];

  const footer = (
    <div className="space-y-2">
      <Button
        variant="primary"
        className="w-full"
        onClick={handleResetPassword}
      >
        Reset Password
      </Button>

      <Button
        className="w-full"
        onClick={onChangeRoleClick}
      >
        Change Role
      </Button>

      <button
        onClick={onToggleLock}
        className={`w-full py-2 text-sm font-medium ${
          account.status === 'Active'
            ? 'text-red-500'
            : 'text-green-600'
        }`}
      >
        {account.status === 'Active' ? 'Lock Account' : 'Unlock Account'}
      </button>
    </div>
  );

  const getPermissionsByRole = (role) => {
    const common = ['Truy cập Dashboard', 'Cập nhật thông tin cá nhân'];
    switch (role) {
      case 'Admin':
        return [...common, 'Toàn quyền quản trị hệ thống', 'Quản lý tài khoản', 'Cấu hình hệ thống'];
      case 'Teacher':
        return [...common, 'Xem lịch dạy', 'Quản lý lớp được phân công', 'Chấm điểm & đánh giá'];
      case 'Teaching Coordinator':
        return [...common, 'Quản lý giáo viên', 'Phân công lịch dạy', 'Quản lý công lương GV'];
      case 'Center Manager':
        return [...common, 'Quản lý cơ sở', 'Phân công Sale/CS', 'Quản lý công lương Sale/CS'];
      case 'Sale':
        return [...common, 'Đăng ký lịch rảnh', 'Xem lịch làm việc'];
      case 'CS Specialist':
        return [...common, 'Quản lý lớp học', 'Hỗ trợ vận hành cơ sở'];
      default:
        return common;
    }
  };

  return (
    <DetailPanel
      title="Account Detail"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onClose={onClose}
      footer={footer}
    >
      <div className="bg-gray-50 rounded-lg p-4 mb-6 flex items-center space-x-4 border border-gray-100">
        <div className="h-12 w-12 bg-[#1a365d] rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
          {account.initials}
        </div>

        <div className="overflow-hidden">
          <h3 className="font-bold text-gray-900 truncate">{account.user}</h3>

          <div className="text-[13px] text-gray-500 truncate mt-0.5">
            @{account.username} · {account.code}
          </div>

          <div className="flex items-center mt-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                account.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
              }`}
            />

            <span
              className={`text-xs font-medium ${
                account.status === 'Active' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {account.status} Account
            </span>
          </div>
        </div>
      </div>

      {/* Overview */}
        {activeTab === 'Overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Account Info */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Account Information</h4>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-[13px]"><span className="text-gray-500">Username</span><span className="font-medium text-gray-900">{account.username}</span></div>
                <div className="flex justify-between items-center text-[13px]"><span className="text-gray-500">Full Name</span><span className="font-medium text-gray-900">{account.user}</span></div>
                <div className="flex justify-between items-center text-[13px]"><span className="text-gray-500">Email</span><span className="font-medium text-gray-900 truncate ml-4">{account.email}</span></div>
                <div className="flex justify-between items-center text-[13px]"><span className="text-gray-500">Assigned Role</span><span className="font-medium text-gray-900">{account.role}</span></div>
                <div className="flex justify-between items-center text-[13px]"><span className="text-gray-500">Department</span><span className="font-medium text-gray-900">{account.department}</span></div>
                <div className="flex justify-between items-center text-[13px]"><span className="text-gray-500">Created Date</span><span className="font-medium text-gray-900">{account.createdDate}</span></div>
              </div>
            </div>

            {/* Security & Auth */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Security & Authentication</h4>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-medium flex items-center ${account.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${account.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {account.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[13px]"><span className="text-gray-500">MFA Status</span><span className="font-medium text-gray-900">{account.mfaStatus}</span></div>
                <div className="flex justify-between items-center text-[13px]"><span className="text-gray-500">Password Policy</span><span className="font-medium text-gray-900">{account.passwordPolicy}</span></div>
              </div>
            </div>
          </div>
        )}

        {/*  Roles */}
        {activeTab === 'Roles' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Current Role</h4>
              <div className="bg-[#1a365d]/5 border border-[#1a365d]/10 rounded-lg p-4">
                <div className="font-semibold text-[#1a365d] mb-1">{account.role}</div>
                <p className="text-xs text-gray-500">
                  Phân quyền cấp độ {account.role} tại cơ sở {account.department}.
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">System Permissions</h4>
              <ul className="space-y-3">
                {getPermissionsByRole(account.role).map((permission, index) => (
                  <li key={index} className="flex items-start text-[13px] text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-2.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {permission}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Activity  */}
        {activeTab === 'Activity' && (
          <div className="space-y-6 animate-fade-in">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Recent Activity</h4>
            
            <div className="relative border-l border-gray-200 ml-2.5 space-y-6 mt-4">
              
              {/* Last Login */}
              <div className="relative pl-5">
                <div className="absolute w-2.5 h-2.5 bg-green-500 rounded-full left-[-5.5px] top-1 border-2 border-white ring-2 ring-green-100"></div>
                <div className="text-[13px] font-medium text-gray-900">Đăng nhập thành công</div>
                <div className="text-xs text-gray-500 mt-0.5">{account.lastLogin}</div>
                <div className="text-[11px] text-gray-400 mt-1 font-mono bg-gray-50 inline-block px-1.5 py-0.5 rounded border border-gray-100">IP: {account.ipAddress}</div>
              </div>

              {/*  Password or Settings change */}
              <div className="relative pl-5">
                <div className="absolute w-2.5 h-2.5 bg-gray-300 rounded-full left-[-5.5px] top-1 border-2 border-white"></div>
                <div className="text-[13px] font-medium text-gray-900">
                  {account.mfaStatus === 'Enforced' ? 'Thiết lập MFA thành công' : 'Cập nhật hồ sơ'}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Sau khi tạo tài khoản vài ngày
                </div>
              </div>

              {/*  Account Created */}
              <div className="relative pl-5 pb-2">
                <div className="absolute w-2.5 h-2.5 bg-[#1a365d] rounded-full left-[-5.5px] top-1 border-2 border-white ring-2 ring-blue-50"></div>
                <div className="text-[13px] font-medium text-gray-900">Tạo tài khoản</div>
                <div className="text-xs text-gray-500 mt-0.5">{account.createdDate}</div>
                <div className="text-[11px] text-gray-400 mt-1">bởi System Admin</div>
              </div>

            </div>
          </div>
        )}
      </DetailPanel>
  );
};

export default AccountDetailPanel;
