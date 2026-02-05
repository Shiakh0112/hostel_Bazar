import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createPaymentOrder } from '../../app/slices/paymentSlice';
import { fetchStudentMonthlyPayments } from '../../app/slices/monthlyPaymentSlice';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_dummy');

const MonthlyRentPayButton = ({ payment }) => {
  const dispatch = useDispatch();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      const orderResult = await dispatch(createPaymentOrder({
        amount: payment.amount,
        paymentType: 'monthly',
        hostelId: payment.hostel._id,
        bookingId: payment.booking,
        monthlyPaymentId: payment._id
      })).unwrap();

      const stripe = await stripePromise;
      
      const { error } = await stripe.redirectToCheckout({
        sessionId: orderResult.data.stripeSessionId
      });

      if (error) {
        toast.error(error.message);
        setIsProcessing(false);
      }
    } catch (error) {
      toast.error(error.message || 'Payment failed');
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={isProcessing}
      className={`px-4 py-2 rounded-md text-white ${
        payment.isOverdue 
          ? 'bg-red-600 hover:bg-red-700' 
          : 'bg-blue-600 hover:bg-blue-700'
      } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isProcessing ? 'Processing...' : 'Pay Now'}
    </button>
  );
};

export default MonthlyRentPayButton;
