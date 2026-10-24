<<<<<<< HEAD
import {
  Bell,
  LogOut,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { useAccountData } from '../../features/accounts/hooks/useAccountData';
=======
import { Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAccountData } from "../../features/accounts/hooks/useAccountData";
>>>>>>> main

export default function Topbar({
  role,
  pageTitle,
  pageSubtitle,
}) {
  const navigate = useNavigate();
<<<<<<< HEAD

=======
>>>>>>> main
  const { authUser, logout } = useAccountData();

  const handleLogout = () => {
    logout();

<<<<<<< HEAD
    navigate('/login', {
=======
    navigate("/login", {
>>>>>>> main
      replace: true,
    });
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
<<<<<<< HEAD
        <h1 className="text-[15px] font-semibold text-slate-900 leading-tight">
=======
        <h1 className="text-[15px] font-semibold leading-tight text-slate-900">
>>>>>>> main
          {pageTitle}
        </h1>

        {pageSubtitle && (
<<<<<<< HEAD
          <p className="text-xs text-slate-400 leading-tight">
=======
          <p className="text-xs leading-tight text-slate-400">
>>>>>>> main
            {pageSubtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
<<<<<<< HEAD
        <button className="text-[11px] font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-600">
=======
        <button className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-[11px] font-medium text-slate-600">
>>>>>>> main
          GMT+7 · EN
        </button>

        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100">
          <Bell size={16} />

<<<<<<< HEAD
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <button
            onClick={() => navigate(`/${role.key.toLowerCase()}/profile`)}
            className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-semibold cursor-pointer"
=======
          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-2.5 border-l border-slate-200 pl-3">
          <button
            type="button"
            onClick={() =>
              navigate(`/${role.key.toLowerCase()}/profile`)
            }
            className="flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full text-xs font-semibold text-white"
>>>>>>> main
            style={{ backgroundColor: role.color }}
          >
            {authUser?.avatar ? (
              <img
                src={authUser.avatar}
                alt="Avatar"
<<<<<<< HEAD
                className="w-full h-full object-cover"
=======
                className="h-full w-full object-cover"
>>>>>>> main
              />
            ) : (
              authUser?.initials || role.shortLabel
            )}
          </button>

<<<<<<< HEAD
          <div className="leading-tight mr-2">
            <div className="text-xs font-semibold text-slate-800">
              {authUser?.user ||
                'User'}
=======
          <div className="mr-2 leading-tight">
            <div className="text-xs font-semibold text-slate-800">
              {authUser?.user || "User"}
>>>>>>> main
            </div>

            <div className="text-[11px] text-slate-400">
              {role.label}
            </div>
          </div>

          <button
<<<<<<< HEAD
            onClick={handleLogout}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
=======
            type="button"
            onClick={handleLogout}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
>>>>>>> main
            title="Đăng xuất"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> main
