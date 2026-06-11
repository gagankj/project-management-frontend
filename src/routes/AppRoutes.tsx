import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PublicRoutes from './PublicRoutes';
import PrivateRoutes from './PrivateRoutes';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ProjectsView from '../pages/ProjectsView';
import ProjectDetailsView from '../pages/ProjectDetailsView';
import MyTasksView from '../pages/MyTasksView';
import type { User } from '../types/auth';

interface AppRoutesProps {
  token: string | null;
  user: User | null;
  onLoginSuccess: (user: User, token: string) => void;
  onLogout: (showNotification?: boolean) => void;
}

/**
 * AppRoutes — single source of truth for all client-side routes.
 *
 * Structure:
 *  /login        → PublicRoutes → Login
 *  /register     → PublicRoutes → Register
 *  /dashboard/*  → PrivateRoutes (layout: Sidebar + main)
 *    projects          → ProjectsView
 *    projects/:id      → ProjectDetailsView
 *    my-tasks          → MyTasksView
 *    *                 → redirect to projects
 *  *             → redirect to /login
 */
const AppRoutes: React.FC<AppRoutesProps> = ({ token, user, onLoginSuccess, onLogout }) => {
  return (
    <Routes>
      <Route element={<PublicRoutes token={token} />}>
        <Route path="/login" element={<Login onLoginSuccess={onLoginSuccess} />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route
        path="/dashboard"
        element={<PrivateRoutes token={token} user={user} onLogout={onLogout} />}
      >
        <Route path="projects" element={<ProjectsView />} />
        <Route path="projects/:id" element={<ProjectDetailsView />} />
        <Route path="my-tasks" element={<MyTasksView />} />
        <Route path="*" element={<Navigate to="projects" replace />} />
      </Route>

      <Route path="/dashboard" element={<Navigate to="/dashboard/projects" replace />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
