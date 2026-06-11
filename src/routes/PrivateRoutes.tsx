import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Menu } from 'lucide-react';
import type { User } from '../types/auth';

interface PrivateRoutesProps {
  token: string | null;
  user: User | null;
  onLogout: (showNotification?: boolean) => void;
}

/**
 * PrivateRoutes — wraps all authenticated/dashboard pages.
 * Redirects unauthenticated users to /login.
 * Renders the Sidebar + main content layout for authenticated users.
 */
const PrivateRoutes: React.FC<PrivateRoutesProps> = ({ token, user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500/10 flex-col md:flex-row">
      <Sidebar 
        user={user} 
        onLogout={onLogout} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-hidden">
        {/* Mobile top navbar */}
        <header className="flex md:hidden items-center justify-between px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-35">
          <span className="font-black text-sm text-indigo-600">
            Project Management Tool
          </span>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none cursor-pointer"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PrivateRoutes;
