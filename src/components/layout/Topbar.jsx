import {
  Bell,
  LogOut,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { useAccountData } from '../../features/accounts/hooks/useAccountData';

export default function Topbar({
  role,
  pageTitle,
  pageSubtitle,
}) {
  const navigate = useNavigate();

  const { authUser, logout } = useAccountData();

  const handleLogout = () => {
    logout();

    navigate('/login', {
      replace: true,
    });
  };

  return (
    <header className="h-16 shrink-0 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      <div>
        <h1 className="text-[15px] font-semibold text-slate-900 leading-tight">
          {pageTitle}
        </h1>

        {pageSubtitle && (
          <p className="text-xs text-slate-400 leading-tight">
            {pageSubtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button className="text-[11px] font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-600">
          GMT+7 · EN
        </button>

        <button className="relative w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100">
          <Bell size={16} />

          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <button
            onClick={() => navigate(`/${role.key.toLowerCase()}/profile`)}
            className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-semibold cursor-pointer"
            style={{ backgroundColor: role.color }}
          >
            {authUser?.avatar ? (
              <img
                src={authUser.avatar}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              authUser?.initials || role.shortLabel
            )}
          </button>

          <div className="leading-tight mr-2">
            <div className="text-xs font-semibold text-slate-800">
              {authUser?.user ||
                'User'}
            </div>

            <div className="text-[11px] text-slate-400">
              {role.label}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Đăng xuất"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
