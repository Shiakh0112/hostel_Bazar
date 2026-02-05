import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const RoleRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on user role
    const redirectRoutes = {
      student: '/dashboard/student',
      owner: '/dashboard/owner',
      staff: '/dashboard/staff'
    }
    
    const redirectTo = redirectRoutes[user?.role] || '/'
    return <Navigate to={redirectTo} replace />
  }

  return children
}

export default RoleRoute