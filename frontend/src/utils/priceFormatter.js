// Format price in Indian Rupees
export const formatPrice = (amount, showSymbol = true) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? '₹0' : '0'
  }

  const numAmount = Number(amount)
  
  // Format with Indian number system (lakhs, crores)
  const formatted = new Intl.NumberFormat('en-IN', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numAmount)

  return formatted
}

// Format price without currency symbol
export const formatPriceNumber = (amount) => {
  return formatPrice(amount, false)
}

// Format price with custom symbol
export const formatPriceWithSymbol = (amount, symbol = '₹') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${symbol}0`
  }

  const formatted = formatPriceNumber(amount)
  return `${symbol}${formatted}`
}

// Format price in compact form (e.g., 1.2L, 1.5Cr)
export const formatPriceCompact = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0'
  }

  const numAmount = Number(amount)

  if (numAmount >= 10000000) { // 1 Crore
    return `₹${(numAmount / 10000000).toFixed(1)}Cr`
  } else if (numAmount >= 100000) { // 1 Lakh
    return `₹${(numAmount / 100000).toFixed(1)}L`
  } else if (numAmount >= 1000) { // 1 Thousand
    return `₹${(numAmount / 1000).toFixed(1)}K`
  } else {
    return `₹${numAmount}`
  }
}

// Calculate percentage
export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0
  return Math.round((value / total) * 100)
}

// Format percentage
export const formatPercentage = (value, total, decimals = 1) => {
  const percentage = calculatePercentage(value, total)
  return `${percentage.toFixed(decimals)}%`
}

// Calculate discount percentage
export const calculateDiscountPercentage = (originalPrice, discountedPrice) => {
  if (!originalPrice || originalPrice === 0) return 0
  const discount = originalPrice - discountedPrice
  return Math.round((discount / originalPrice) * 100)
}

// Format discount
export const formatDiscount = (originalPrice, discountedPrice) => {
  const percentage = calculateDiscountPercentage(originalPrice, discountedPrice)
  return `${percentage}% OFF`
}

// Calculate EMI (Equated Monthly Installment)
export const calculateEMI = (principal, rate, tenure) => {
  if (!principal || !rate || !tenure) return 0
  
  const monthlyRate = rate / (12 * 100)
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
              (Math.pow(1 + monthlyRate, tenure) - 1)
  
  return Math.round(emi)
}

// Format EMI
export const formatEMI = (principal, rate, tenure) => {
  const emi = calculateEMI(principal, rate, tenure)
  return formatPrice(emi)
}

// Calculate total amount with tax
export const calculateWithTax = (amount, taxPercentage = 18) => {
  if (!amount) return 0
  return amount + (amount * taxPercentage / 100)
}

// Format amount with tax
export const formatWithTax = (amount, taxPercentage = 18) => {
  const total = calculateWithTax(amount, taxPercentage)
  return formatPrice(total)
}

// Calculate late fee
export const calculateLateFee = (amount, daysLate, feePercentage = 2) => {
  if (!amount || !daysLate || daysLate <= 0) return 0
  
  let lateFee = 0
  if (daysLate <= 7) {
    lateFee = amount * (feePercentage / 100) // 2% for first week
  } else {
    lateFee = amount * (feePercentage / 100) // 2% for first week
    lateFee += (daysLate - 7) * (amount * 0.01) // 1% per day after
  }
  
  // Cap at 50% of original amount
  const maxLateFee = amount * 0.5
  return Math.min(lateFee, maxLateFee)
}

// Format late fee
export const formatLateFee = (amount, daysLate, feePercentage = 2) => {
  const lateFee = calculateLateFee(amount, daysLate, feePercentage)
  return formatPrice(lateFee)
}

// Parse price from string (remove currency symbols and commas)
export const parsePrice = (priceString) => {
  if (!priceString) return 0
  
  const cleaned = priceString.toString().replace(/[₹,\s]/g, '')
  const parsed = parseFloat(cleaned)
  
  return isNaN(parsed) ? 0 : parsed
}

// Format price range
export const formatPriceRange = (minPrice, maxPrice) => {
  if (!minPrice && !maxPrice) return 'Price not available'
  if (!maxPrice || minPrice === maxPrice) return formatPrice(minPrice)
  
  return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
}

// Calculate security deposit (usually 1-2 months rent)
export const calculateSecurityDeposit = (monthlyRent, months = 2) => {
  return monthlyRent * months
}

// Format security deposit
export const formatSecurityDeposit = (monthlyRent, months = 2) => {
  const deposit = calculateSecurityDeposit(monthlyRent, months)
  return formatPrice(deposit)
}

// Calculate total cost (rent + deposit + charges)
export const calculateTotalCost = (monthlyRent, securityDeposit = 0, otherCharges = 0) => {
  return monthlyRent + securityDeposit + otherCharges
}

// Format total cost
export const formatTotalCost = (monthlyRent, securityDeposit = 0, otherCharges = 0) => {
  const total = calculateTotalCost(monthlyRent, securityDeposit, otherCharges)
  return formatPrice(total)
}