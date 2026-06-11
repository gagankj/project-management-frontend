import React from 'react';
import { User, Mail, Calendar, ShieldCheck } from 'lucide-react';

interface ProfileViewProps {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt?: string;
  } | null;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user }) => {
  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">My Profile</h1>
        <p className="text-slate-400 mt-1">Manage your account information and preferences</p>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-slate-800">
          <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg shadow-indigo-500/20">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-2xl font-bold text-slate-100">{user.name}</h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-900/30 border border-indigo-700/30 text-xs font-semibold text-indigo-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Active Member
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-950/40 border border-slate-850">
            <div className="p-3 bg-slate-900 rounded-lg text-slate-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Full Name</span>
              <span className="text-sm font-semibold text-slate-200">{user.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-950/40 border border-slate-850">
            <div className="p-3 bg-slate-900 rounded-lg text-slate-400">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Email Address</span>
              <span className="text-sm font-semibold text-slate-200">{user.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-950/40 border border-slate-850">
            <div className="p-3 bg-slate-900 rounded-lg text-slate-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 block">User Account ID</span>
              <code className="text-xs font-mono text-indigo-300 select-all bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                {user.id || (user as any)._id}
              </code>
            </div>
          </div>

          {user.createdAt && (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-950/40 border border-slate-850">
              <div className="p-3 bg-slate-900 rounded-lg text-slate-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Joined Date</span>
                <span className="text-sm font-semibold text-slate-200">
                  {new Date(user.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
