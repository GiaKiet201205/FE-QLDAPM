import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; 

const LoginPage = ({ setIsLoggedIn }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (userId === 'admin' && password === '123456') {
      setError('');
      
      toast.success('Đăng nhập thành công!'); 
      
      setIsLoggedIn(true);
      navigate('/'); 
    } else {
      toast.error('Tài khoản hoặc mật khẩu không chính xác!');
      setError('Tài khoản hoặc mật khẩu không chính xác.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 bg-white border-b">
        <div className="flex items-center space-x-2">
          <div className="bg-[#1a365d] text-white font-bold px-3 py-1 rounded">I</div>
          <span className="font-bold text-[#1a365d] text-lg">IIG Learning</span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-500 text-sm tracking-wider">ENTERPRISE ERP PORTAL</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span>System Operational</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-lg shadow-sm border border-gray-200 w-full max-w-md">
          <h1 className="text-2xl font-bold text-[#1a365d] mb-2">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-8">Sign in to access your ERP workspace</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Email or User ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1a365d] focus:border-[#1a365d] text-sm"
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1a365d] focus:border-[#1a365d] text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#1a365d] focus:ring-[#1a365d] border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-[#2b5c9e] hover:text-[#1a365d]">
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1a365d] hover:bg-[#122643] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1a365d]"
              >
                Sign In →
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Protected internal system. For access issues, contact your Campus Administrator or IT Helpdesk.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-4 bg-[#f8f9fa] flex justify-between items-center text-xs text-gray-500 border-t border-gray-200">
        <div>© 2024 IIG Learning ERP System. All rights reserved.</div>
        <div className="flex space-x-4">
          <span>v2.4.1</span>
          <span>•</span>
          <span>Internal Access Only</span>
          <span>•</span>
          <a href="#" className="hover:text-gray-700">Privacy & Compliance</a>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;