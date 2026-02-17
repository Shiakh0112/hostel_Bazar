import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import hostelSlice from './slices/hostelSlice'
import bookingSlice from './slices/bookingSlice'
import roomSlice from './slices/roomSlice'
import paymentSlice from './slices/paymentSlice'
import monthlyPaymentSlice from './slices/monthlyPaymentSlice'
import maintenanceSlice from './slices/maintenanceSlice'
import notificationSlice from './slices/notificationSlice'
import reportSlice from './slices/reportSlice'
import staffSlice from './slices/staffSlice'
import expenseSlice from './slices/expenseSlice'
import discountSlice from './slices/discountSlice'

// Listen to logout action and clear all report state
const rootReducer = (state, action) => {
  if (action.type === 'auth/logout') {
    // Clear all report data on logout
    state = {
      ...state,
      report: undefined,
      hostel: undefined,
      booking: undefined,
      room: undefined,
      payment: undefined,
      monthlyPayment: undefined,
      maintenance: undefined,
      notification: undefined,
      staff: undefined,
      expense: undefined,
      discount: undefined,
    }
  }
  return {
    auth: authSlice(state?.auth, action),
    hostel: hostelSlice(state?.hostel, action),
    booking: bookingSlice(state?.booking, action),
    room: roomSlice(state?.room, action),
    payment: paymentSlice(state?.payment, action),
    monthlyPayment: monthlyPaymentSlice(state?.monthlyPayment, action),
    maintenance: maintenanceSlice(state?.maintenance, action),
    notification: notificationSlice(state?.notification, action),
    report: reportSlice(state?.report, action),
    staff: staffSlice(state?.staff, action),
    expense: expenseSlice(state?.expense, action),
    discount: discountSlice(state?.discount, action),
  }
}

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})