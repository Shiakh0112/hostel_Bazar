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

export const store = configureStore({
  reducer: {
    auth: authSlice,
    hostel: hostelSlice,
    booking: bookingSlice,
    room: roomSlice,
    payment: paymentSlice,
    monthlyPayment: monthlyPaymentSlice,
    maintenance: maintenanceSlice,
    notification: notificationSlice,
    report: reportSlice,
    staff: staffSlice,
    expense: expenseSlice,
    discount: discountSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})