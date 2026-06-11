import React from 'react';
import { NavLink } from 'react-router-dom';
import { FolderKanban, CheckSquare, User, LogOut, Shield } from 'lucide-react';

interface SidebarProps {
  user: {
    name: string;
    email: string;
  } | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, onLogout }) => {
  const navItems = [
    {
      to: '/dashboard/projects',
      label: 'Projects',
      icon: <FolderKanban className="h-5 w-5" />,
    },
    {
      to: '/dashboard/my-tasks',
      label: 'My Tasks',
      icon: <CheckSquare className="h-5 w-5" />,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen shrink-0 sticky top-0">
   
      <div className="p-6 border-b border-slate-200 flex items-center gap-3">
        <Shield className="h-6 w-6 text-indigo-600 shrink-0" />
        <span className="font-black tracking-wider text-sm text-indigo-600">
          PROJMANAGER
        </span>
      </div>

      
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600 rounded-l-none'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

    
      {user && (
        <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-850 truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full cursor-pointer flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-rose-50 hover:border-rose-250 hover:text-rose-600 text-xs font-bold transition-all duration-150 bg-white"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
