// User roles
export const USER_ROLES = {
  STUDENT: 'student',
  OWNER: 'owner',
  STAFF: 'staff'
}

// Hostel types
export const HOSTEL_TYPES = {
  BOYS: 'boys',
  GIRLS: 'girls',
  CO_ED: 'co-ed'
}

// Room types
export const ROOM_TYPES = {
  SINGLE: 'single',
  DOUBLE: 'double',
  TRIPLE: 'triple',
  DORMITORY: 'dormitory'
}

// Booking status
export const BOOKING_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
}

// Payment status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
}

// Payment types
export const PAYMENT_TYPES = {
  ADVANCE: 'advance',
  MONTHLY: 'monthly',
  SECURITY_DEPOSIT: 'security_deposit',
  MAINTENANCE: 'maintenance',
  LATE_FEE: 'late_fee',
  OTHER: 'other'
}

// Maintenance status
export const MAINTENANCE_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
}

// Maintenance categories
export const MAINTENANCE_CATEGORIES = {
  ELECTRICAL: 'electrical',
  PLUMBING: 'plumbing',
  CLEANING: 'cleaning',
  FURNITURE: 'furniture',
  APPLIANCE: 'appliance',
  INTERNET: 'internet',
  OTHER: 'other'
}

// Maintenance priorities
export const MAINTENANCE_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
}

// Notification types
export const NOTIFICATION_TYPES = {
  BOOKING_REQUEST: 'booking_request',
  BOOKING_APPROVED: 'booking_approved',
  BOOKING_REJECTED: 'booking_rejected',
  PAYMENT_DUE: 'payment_due',
  PAYMENT_SUCCESS: 'payment_success',
  MAINTENANCE_REQUEST: 'maintenance_request',
  MAINTENANCE_ASSIGNED: 'maintenance_assigned',
  MAINTENANCE_COMPLETED: 'maintenance_completed',
  ROOM_ALLOCATED: 'room_allocated',
  GENERAL: 'general'
}

// Status colors for UI
export const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
  completed: 'bg-green-100 text-green-800',
  assigned: 'bg-purple-100 text-purple-800',
  in_progress: 'bg-orange-100 text-orange-800',
  failed: 'bg-red-100 text-red-800',
  processing: 'bg-blue-100 text-blue-800'
}

// Priority colors
export const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
}

// Default amenities
export const DEFAULT_AMENITIES = [
  'WiFi',
  'Mess',
  'Laundry',
  'Security',
  'Parking',
  'Common Room',
  'Study Room',
  'Gym',
  'Medical Facility',
  'Power Backup'
]

// Indian cities
export const INDIAN_CITIES = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Surat',
  'Lucknow',
  'Kanpur',
  'Nagpur',
  'Indore',
  'Thane',
  'Bhopal',
  'Visakhapatnam',
  'Pimpri-Chinchwad',
  'Patna',
  'Vadodara'
]

// Months
export const MONTHS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' }
]

// Years (current year + 5 years)
export const YEARS = Array.from({ length: 6 }, (_, i) => {
  const year = new Date().getFullYear() + i
  return { value: year, label: year.toString() }
})

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
}

// File upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
}

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  VERIFY_OTP: '/verify-otp',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  HOSTELS: '/hostels',
  HOSTEL_DETAILS: '/hostels/:id',
  DASHBOARD: '/dashboard',
  STUDENT_DASHBOARD: '/dashboard/student',
  OWNER_DASHBOARD: '/dashboard/owner',
  STAFF_DASHBOARD: '/dashboard/staff'
}