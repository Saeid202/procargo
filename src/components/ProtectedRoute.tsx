import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/login'
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cargo-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />
  }

  if (user.role === 'AGENT' && !location.pathname?.includes('agent')) {
    return <Navigate to={'/dashboard/agent'} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
