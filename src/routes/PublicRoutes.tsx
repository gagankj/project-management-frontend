import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface PublicRoutesProps {
  token: string | null;
}

/**
 * PublicRoutes — wraps login/register pages.
 * Redirects already-authenticated users to the dashboard so they
 * cannot see login or register pages while logged in.
 */
const PublicRoutes: React.FC<PublicRoutesProps> = ({ token }) => {
  if (token) {
    return <Navigate to="/dashboard/projects" replace />;
  }

  return <Outlet />;
};

export default PublicRoutes;
