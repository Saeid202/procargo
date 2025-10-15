import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { RolesEnum } from '../../abstractions/enums/roles.enum'
import { useTranslation } from 'react-i18next'

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
  const { i18n } = useTranslation();

  // Build a path preserving existing query params and ensuring ?language
  const buildPath = (path: string) => {
    const params = new URLSearchParams(location.search);
    if (!params.has('language')) {
      const normalized = i18n.language?.startsWith('fa') ? 'fa' : 'en';
      params.set('language', normalized);
    }
    const qs = params.toString();
    return qs ? `${path}?${qs}` : path;
  };
 
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cargo-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to={buildPath(redirectTo)} replace />
  }

  if (user.role === RolesEnum.AGENT && !location.pathname?.includes('agent')) {
    return <Navigate to={buildPath('/dashboard/agent')} replace />
  }
  
  if (user.role === RolesEnum.LAWYER && !location.pathname?.includes('lawyer')) {
    return <Navigate to={buildPath('/dashboard/lawyer')} replace />
  }

  if (user.role === RolesEnum.ADMIN && !location.pathname?.includes('admin')) {
    return <Navigate to={buildPath('/dashboard/admin')} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
