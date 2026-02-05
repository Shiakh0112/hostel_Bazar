const USER_ROLES = {
  STUDENT: 'student',
  OWNER: 'owner',
  STAFF: 'staff'
};

const HOSTEL_TYPES = {
  BOYS: 'boys',
  GIRLS: 'girls',
  CO_ED: 'co-ed'
};

const ROOM_TYPES = {
  SINGLE: 'single',
  DOUBLE: 'double',
  TRIPLE: 'triple',
  DORMITORY: 'dormitory'
};

const BOOKING_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
};

const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

const PAYMENT_TYPES = {
  ADVANCE: 'advance',
  MONTHLY: 'monthly',
  SECURITY_DEPOSIT: 'security_deposit',
  MAINTENANCE: 'maintenance',
  LATE_FEE: 'late_fee',
  OTHER: 'other'
};

const MAINTENANCE_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

const MAINTENANCE_CATEGORIES = {
  ELECTRICAL: 'electrical',
  PLUMBING: 'plumbing',
  CLEANING: 'cleaning',
  FURNITURE: 'furniture',
  APPLIANCE: 'appliance',
  INTERNET: 'internet',
  OTHER: 'other'
};

const MAINTENANCE_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

const NOTIFICATION_TYPES = {
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
};

const INVOICE_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled'
};

const DEFAULT_AMENITIES = [
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
];

const DEFAULT_PERMISSIONS = {
  STAFF: [
    'maintenance',
    'room_management',
    'student_management'
  ]
};

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'],
  UPLOAD_PATH: 'uploads/'
};

const EMAIL_TEMPLATES = {
  OTP_VERIFICATION: 'otp_verification',
  PASSWORD_RESET: 'password_reset',
  BOOKING_NOTIFICATION: 'booking_notification',
  PAYMENT_NOTIFICATION: 'payment_notification',
  MAINTENANCE_NOTIFICATION: 'maintenance_notification',
  WELCOME: 'welcome'
};

const RATE_LIMITS = {
  GENERAL: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100
  },
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5
  },
  PAYMENT: {
    windowMs: 60 * 1000, // 1 minute
    max: 3
  },
  UPLOAD: {
    windowMs: 60 * 1000, // 1 minute
    max: 10
  }
};

module.exports = {
  USER_ROLES,
  HOSTEL_TYPES,
  ROOM_TYPES,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  PAYMENT_TYPES,
  MAINTENANCE_STATUS,
  MAINTENANCE_CATEGORIES,
  MAINTENANCE_PRIORITIES,
  NOTIFICATION_TYPES,
  INVOICE_STATUS,
  DEFAULT_AMENITIES,
  DEFAULT_PERMISSIONS,
  PAGINATION,
  FILE_UPLOAD,
  EMAIL_TEMPLATES,
  RATE_LIMITS
};