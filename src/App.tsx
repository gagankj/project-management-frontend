import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import api from './services/api';
import AppRoutes from './routes/AppRoutes';
import type { User } from './types/auth';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [globalLoading, setGlobalLoading] = useState(false);

  // Listen for global loading and unauthorized logout events dispatched by the API interceptor
  useEffect(() => {
    const handleGlobalLoading = (e: Event) => {
      setGlobalLoading((e as CustomEvent).detail);
    };

    const handleAuthLogout = () => {
      setUser(null);
      setToken(null);
      toast.error('Session expired. Please log in again.');
    };

    window.addEventListener('global-loading', handleGlobalLoading);
    window.addEventListener('auth-logout', handleAuthLogout);

    return () => {
      window.removeEventListener('global-loading', handleGlobalLoading);
      window.removeEventListener('auth-logout', handleAuthLogout);
    };
  }, []);

  // Verify token on mount and hydrate user state
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          const response = await api.get('/auth/me');
          setUser(response.data.user);
        } catch (error) {
          console.error('Session verification failed:', error);
          handleLogout(false);
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (loggedInUser: User, receivedToken: string) => {
    setUser(loggedInUser);
    setToken(receivedToken);
    localStorage.setItem('token', receivedToken);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
  };

  const handleLogout = (showNotification = true) => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (showNotification) {
      toast.success('Logged out successfully');
    }
  };

  // Full-screen loading state while verifying session on first load
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-900">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mx-auto" />
          <p className="text-slate-500 font-medium">Verifying Session...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500/10">

        
        {globalLoading && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 ">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
              <span className="text-xs font-semibold text-slate-600">Processing Request...</span>
            </div>
          </div>
        )}

        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
            },
            success: {
              iconTheme: {
                primary: '#6366f1',
                secondary: '#ffffff',
              },
            },
          }}
        />

        
        <AppRoutes
          token={token}
          user={user}
          onLoginSuccess={handleLoginSuccess}
          onLogout={handleLogout}
        />

      </div>
    </BrowserRouter>
  );
};

export default App;
