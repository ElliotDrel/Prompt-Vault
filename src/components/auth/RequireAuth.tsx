import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Shield } from 'lucide-react';

interface RequireAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequireAuth({ children, fallback }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Shield className="h-12 w-12 text-blue-600 animate-pulse" />
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span className="text-sm text-gray-600">Checking authentication...</span>
            </div>
          </div>
        </div>
      )
    );
  }

  // Redirect to auth page if not authenticated
  if (!user) {
    return (
      <Navigate
        to="/auth"
        state={{ from: location }}
        replace
      />
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
}

// Higher-order component version for easier use
export function withRequireAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <RequireAuth>
        <Component {...props} />
      </RequireAuth>
    );
  };
}

// Hook for checking if current route requires auth
export function useAuthRedirect() {
  const { user, loading } = useAuth();
  const location = useLocation();

  const shouldRedirect = !loading && !user;
  const isAuthPage = location.pathname === '/auth';

  return {
    shouldRedirect: shouldRedirect && !isAuthPage,
    isAuthenticated: !!user,
    loading,
  };
}