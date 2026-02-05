import React from 'react'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import RoleRoute from './RoleRoute'
import TestDashboard from '../components/TestDashboard'

// Public Pages
import Home from '../pages/Home'
import HostelList from '../pages/HostelList'
import HostelDetails from '../pages/HostelDetails'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import VerifyOTP from '../pages/VerifyOTP'
import ForgotPassword from '../pages/ForgotPassword'
import ResetPassword from '../pages/ResetPassword'

const AppRoutesTest = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/hostels" element={<HostelList />} />
      <Route path="/hostels/:id" element={<HostelDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Test Dashboard Routes - Simple version without layouts */}
      <Route
        path="/dashboard/owner"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['owner']}>
              <div className="min-h-screen bg-gray-50 p-4">
                <h1 className="text-2xl font-bold mb-4">Owner Dashboard Test</h1>
                <TestDashboard />
              </div>
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/student"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['student']}>
              <div className="min-h-screen bg-gray-50 p-4">
                <h1 className="text-2xl font-bold mb-4">Student Dashboard Test</h1>
                <TestDashboard />
              </div>
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/staff"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['staff']}>
              <div className="min-h-screen bg-gray-50 p-4">
                <h1 className="text-2xl font-bold mb-4">Staff Dashboard Test</h1>
                <TestDashboard />
              </div>
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Fallback Route */}
      <Route path="*" element={
        <div className="p-8 text-center min-h-screen flex flex-col items-center justify-center">
          <h1 className="text-6xl mb-4">❌</h1>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Page Not Found (404)</h2>
          <p className="text-gray-600 mb-4">The route you're trying to access doesn't exist.</p>
          <p className="text-sm text-gray-500">Current path: {window.location.pathname}</p>
        </div>
      } />
    </Routes>
  )
}

export default AppRoutesTest