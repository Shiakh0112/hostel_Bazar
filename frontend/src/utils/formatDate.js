import moment from 'moment'

// Format date to readable string
export const formatDate = (date, format = 'DD MMM YYYY') => {
  if (!date) return '-'
  return moment(date).format(format)
}

// Format date with time
export const formatDateTime = (date, format = 'DD MMM YYYY, hh:mm A') => {
  if (!date) return '-'
  return moment(date).format(format)
}

// Get relative time (e.g., "2 hours ago")
export const getRelativeTime = (date) => {
  if (!date) return '-'
  return moment(date).fromNow()
}

// Check if date is today
export const isToday = (date) => {
  if (!date) return false
  return moment(date).isSame(moment(), 'day')
}

// Check if date is yesterday
export const isYesterday = (date) => {
  if (!date) return false
  return moment(date).isSame(moment().subtract(1, 'day'), 'day')
}

// Get date range string
export const getDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return '-'
  
  const start = moment(startDate)
  const end = moment(endDate)
  
  if (start.isSame(end, 'day')) {
    return start.format('DD MMM YYYY')
  }
  
  if (start.isSame(end, 'month')) {
    return `${start.format('DD')} - ${end.format('DD MMM YYYY')}`
  }
  
  if (start.isSame(end, 'year')) {
    return `${start.format('DD MMM')} - ${end.format('DD MMM YYYY')}`
  }
  
  return `${start.format('DD MMM YYYY')} - ${end.format('DD MMM YYYY')}`
}

// Get month name
export const getMonthName = (monthNumber) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return months[parseInt(monthNumber) - 1] || '-'
}

// Get days between two dates
export const getDaysBetween = (startDate, endDate) => {
  if (!startDate || !endDate) return 0
  return moment(endDate).diff(moment(startDate), 'days')
}

// Get months between two dates
export const getMonthsBetween = (startDate, endDate) => {
  if (!startDate || !endDate) return 0
  return moment(endDate).diff(moment(startDate), 'months')
}

// Check if date is in past
export const isPastDate = (date) => {
  if (!date) return false
  return moment(date).isBefore(moment(), 'day')
}

// Check if date is in future
export const isFutureDate = (date) => {
  if (!date) return false
  return moment(date).isAfter(moment(), 'day')
}

// Get current month and year
export const getCurrentMonthYear = () => {
  const now = moment()
  return {
    month: now.format('MM'),
    year: now.year(),
    monthName: now.format('MMMM'),
    monthYear: now.format('MMMM YYYY')
  }
}

// Get previous month and year
export const getPreviousMonthYear = () => {
  const prev = moment().subtract(1, 'month')
  return {
    month: prev.format('MM'),
    year: prev.year(),
    monthName: prev.format('MMMM'),
    monthYear: prev.format('MMMM YYYY')
  }
}

// Format date for input fields
export const formatDateForInput = (date) => {
  if (!date) return ''
  return moment(date).format('YYYY-MM-DD')
}

// Parse date from input
export const parseDateFromInput = (dateString) => {
  if (!dateString) return null
  return moment(dateString).toDate()
}

// Get age from date of birth
export const getAge = (dateOfBirth) => {
  if (!dateOfBirth) return 0
  return moment().diff(moment(dateOfBirth), 'years')
}

// Check if date is valid
export const isValidDate = (date) => {
  return moment(date).isValid()
}

// Get start and end of month
export const getMonthRange = (month, year) => {
  const start = moment(`${year}-${month}-01`)
  const end = start.clone().endOf('month')
  return {
    start: start.toDate(),
    end: end.toDate(),
    startFormatted: start.format('YYYY-MM-DD'),
    endFormatted: end.format('YYYY-MM-DD')
  }
}