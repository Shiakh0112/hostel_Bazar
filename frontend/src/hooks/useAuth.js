import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout, checkAuth } from '../app/slices/authSlice'
import { useEffect } from 'react'

export const useAuth = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const { 
    user, 
    token, 
    isLoading, 
    isAuthenticated, 
    error 
  } = useSelector((state) => state.auth)

  // Check authentication on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken && !isAuthenticated) {
      dispatch(checkAuth())
    }
  }, [dispatch, isAuthenticated])

  // Logout function
  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role
  }

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(user?.role)
  }

  // Check if user is student
  const isStudent = () => {
    return user?.role === 'student'
  }

  // Check if user is owner
  const isOwner = () => {
    return user?.role === 'owner'
  }

  // Check if user is staff
  const isStaff = () => {
    return user?.role === 'staff'
  }

  // Get user's full name
  const getUserName = () => {
    return user?.name || 'User'
  }

  // Get user's email
  const getUserEmail = () => {
    return user?.email || ''
  }

  // Get user's role display name
  const getRoleDisplayName = () => {
    const roleNames = {
      student: 'Student',
      owner: 'Hostel Owner',
      staff: 'Staff Member'
    }
    return roleNames[user?.role] || 'User'
  }

  // Check if user profile is complete
  const isProfileComplete = () => {
    if (!user) return false
    
    const requiredFields = ['name', 'email', 'mobile']
    return requiredFields.every(field => user[field])
  }

  // Get dashboard route based on role
  const getDashboardRoute = () => {
    const routes = {
      student: '/dashboard/student',
      owner: '/dashboard/owner',
      staff: '/dashboard/staff'
    }
    return routes[user?.role] || '/dashboard'
  }

  // Redirect to appropriate dashboard
  const redirectToDashboard = () => {
    const route = getDashboardRoute()
    navigate(route)
  }

  // Check if user can access route
  const canAccessRoute = (requiredRoles) => {
    if (!isAuthenticated) return false
    if (!requiredRoles || requiredRoles.length === 0) return true
    return hasAnyRole(requiredRoles)
  }

  return {
    // State
    user,
    token,
    isLoading,
    isAuthenticated,
    error,
    
    // Actions
    handleLogout,
    redirectToDashboard,
    
    // Role checks
    hasRole,
    hasAnyRole,
    isStudent,
    isOwner,
    isStaff,
    
    // User info
    getUserName,
    getUserEmail,
    getRoleDisplayName,
    isProfileComplete,
    
    // Navigation
    getDashboardRoute,
    canAccessRoute
  }
}