import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-agri-500/20 border-t-agri-500 rounded-full animate-spin" />
          <p className="text-agri-500 font-black text-[10px] uppercase tracking-[0.2em] animate-pulse">Verificando Permisos...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard/inicio" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
