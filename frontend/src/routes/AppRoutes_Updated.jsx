import React from 'react'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import RoleRoute from './RoleRoute'

// Public Pages
import Home from '../pages/Home'
import HostelList from '../pages/HostelList'
import HostelDetails from '../pages/HostelDetails'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import VerifyOTP from '../pages/VerifyOTP'
import ForgotPassword from '../pages/ForgotPassword'
import ResetPassword from '../pages/ResetPassword'

// Dashboard Layouts
import OwnerLayout from '../components/dashboard/owner/OwnerLayout'
import StudentLayout from '../components/dashboard/student/StudentLayout'
import StaffLayout from '../components/dashboard/staff/StaffLayout'

// Owner Dashboard Pages
import OwnerOverview from '../components/dashboard/owner/Overview'
import OwnerHostels from '../components/dashboard/owner/Hostels'
import BookingRequests from '../components/dashboard/owner/BookingRequests'
import Students from '../components/dashboard/owner/Students'
import Staff from '../components/dashboard/owner/Staff'
import OwnerMaintenance from '../components/dashboard/owner/Maintenance'
import OwnerMonthlyPayments from '../components/dashboard/owner/MonthlyPayments'
import Expenses from '../components/dashboard/owner/Expenses'
import Discounts from '../components/dashboard/owner/Discounts'
import Reports from '../components/dashboard/owner/Reports'
import Charts from '../components/dashboard/owner/Charts'
import DataExport from '../components/dashboard/owner/DataExport'
import OwnerSettings from '../components/dashboard/owner/Settings'

// Student Dashboard Pages
import MyBookings from '../components/dashboard/student/MyBookings'
import MyRoom from '../components/dashboard/student/MyRoom'
import Payments from '../components/dashboard/student/Payments'
import StudentMonthlyPayments from '../components/dashboard/student/MonthlyPayments'
import PaymentPlans from '../components/dashboard/student/PaymentPlans'
import Maintenance from '../components/dashboard/student/Maintenance'
import EmergencyContacts from '../components/dashboard/student/EmergencyContacts'
import Checkout from '../components/dashboard/student/Checkout'
import StudentProfile from '../components/dashboard/student/Profile'

// Staff Dashboard Pages
import AssignedTasks from '../components/dashboard/staff/AssignedTasks'
import StaffMonthlyPayments from '../components/dashboard/staff/MonthlyPayments'
import StaffProfile from '../components/dashboard/staff/Profile'
import CheckoutManagement from '../components/dashboard/staff/CheckoutManagement'
import RoomTransferManagement from '../components/dashboard/staff/RoomTransferManagement'
import StudentManagement from '../components/dashboard/staff/StudentManagement'

const AppRoutes = () => {
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

      {/* Owner Dashboard Routes */}
      <Route
        path="/dashboard/owner"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['owner']}>
              <OwnerLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<OwnerOverview />} />
        <Route path="hostels" element={<OwnerHostels />} />
        <Route path="booking-requests" element={<BookingRequests />} />
        <Route path="students" element={<Students />} />
        <Route path="staff" element={<Staff />} />
        <Route path="monthly-payments" element={<OwnerMonthlyPayments />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="discounts" element={<Discounts />} />
        <Route path="reports" element={<Reports />} />
        <Route path="charts" element={<Charts />} />
        <Route path="checkout-requests" element={<Checkout />} />
        <Route path="payment-plans" element={<PaymentPlans />} />
        <Route path="room-transfers" element={<Checkout />} />
        <Route path="data-export" element={<DataExport />} />
        <Route path="system-management" element={<DataExport />} />
        <Route path="settings" element={<OwnerSettings />} />
      </Route>

      {/* Student Dashboard Routes */}
      <Route
        path="/dashboard/student"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['student']}>
              <StudentLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<MyBookings />} />
        <Route path="my-room" element={<MyRoom />} />
        <Route path="payments" element={<Payments />} />
        <Route path="monthly-payments" element={<StudentMonthlyPayments />} />
        <Route path="payment-plans" element={<PaymentPlans />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="emergency-contacts" element={<EmergencyContacts />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="room-transfer" element={<Checkout />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      {/* Staff Dashboard Routes */}
      <Route
        path="/dashboard/staff"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['staff']}>
              <StaffLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<AssignedTasks />} />
        <Route path="students" element={<StudentManagement />} />
        <Route path="checkout-management" element={<CheckoutManagement />} />
        <Route path="room-transfers" element={<RoomTransferManagement />} />
        <Route path="monthly-payments" element={<StaffMonthlyPayments />} />
        <Route path="profile" element={<StaffProfile />} />
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<div className="p-8 text-center">Page Not Found</div>} />
    </Routes>
  )
}

export default AppRoutes