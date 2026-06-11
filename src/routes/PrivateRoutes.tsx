import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
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
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500/10">
      <Sidebar user={user} onLogout={onLogout} />
      <main className="flex-1 overflow-y-auto p-8 relative">
        <Outlet />
      </main>
    </div>
  );
};

export default PrivateRoutes;
