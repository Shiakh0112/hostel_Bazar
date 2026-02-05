import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  createPaymentOrder,
  verifyPayment,
} from "../../app/slices/paymentSlice";
import { formatPrice } from "../../utils/priceFormatter";
import PaymentMethodSelector from "./PaymentMethodSelector";
import PaymentForm from "../payment/PaymentForm";

const PayNowButton = ({
  booking,
  onPaymentSuccess,
  paymentType = "advance",
  paymentId = null,
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("razorpay");
  const [step, setStep] = useState("select"); // 'select' or 'form'

  const handlePaymentMethodSelect = (method) => {
    setSelectedMethod(method);
    setStep("form");
  };

  const handlePayment = async (formData = {}) => {
    if (!booking?.advancePayment?.amount) return;

    setLoading(true);
    try {
      console.log("🔥 PAYMENT DEBUG - Starting payment process:", {
        bookingId: booking._id,
        amount: booking.advancePayment.amount,
        paymentType: paymentType,
        paymentMethod: selectedMethod,
        paymentId: paymentId,
      });

      const orderResult = await dispatch(
        createPaymentOrder({
          bookingId: booking._id,
          amount: booking.advancePayment.amount,
          paymentType: paymentType,
          paymentMethod: selectedMethod,
          paymentId: paymentId,
          ...formData,
        }),
      ).unwrap();

      console.log("🔥 PAYMENT DEBUG - Order created:", orderResult);

      switch (selectedMethod) {
        case "razorpay":
          await handleRazorpayPayment(orderResult);
          break;
        case "stripe":
          await handleStripePayment(orderResult);
          break;
        case "phonepe":
        case "googlepay":
          await handleWalletPayment(orderResult);
          break;
        case "upi":
          await handleUPIPayment(orderResult, formData);
          break;
        case "fake_card":
          await handleFakeCardPayment(orderResult, formData);
          break;
        default:
          throw new Error("Unsupported payment method");
      }
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async (orderResult) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: orderResult.amount,
      currency: orderResult.currency,
      name: "Hostel Management System",
      description: `Advance payment for ${booking.hostel?.name}`,
      order_id: orderResult.orderId,
      handler: async (response) => {
        try {
          await dispatch(
            verifyPayment({
              paymentId: orderResult.data.paymentId,
              paymentMethod: "razorpay",
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          ).unwrap();
          setShowPaymentModal(false);
          onPaymentSuccess?.();
        } catch (error) {
          console.error("Payment verification failed:", error);
          alert("Payment verification failed.");
        }
      },
      prefill: {
        name: booking.bookingDetails?.fullName,
        email: booking.bookingDetails?.email,
        contact: booking.bookingDetails?.mobile,
      },
      theme: { color: "#3B82F6" },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const handleStripePayment = async (orderResult) => {
    setTimeout(async () => {
      try {
        await dispatch(
          verifyPayment({
            paymentId: orderResult.data.paymentId,
            paymentMethod: "stripe",
            stripePaymentIntentId: orderResult.data.paymentIntentId,
          }),
        ).unwrap();
        setShowPaymentModal(false);
        onPaymentSuccess?.();
        alert("Stripe payment completed successfully!");
      } catch (error) {
        console.error("Stripe payment failed:", error);
        alert("Stripe payment failed.");
      }
    }, 2000);
  };

  const handleWalletPayment = async (orderResult) => {
    setTimeout(async () => {
      try {
        await dispatch(
          verifyPayment({
            paymentId: orderResult.data.paymentId,
            paymentMethod: selectedMethod,
            [`${selectedMethod}TransactionId`]: `${selectedMethod}_${Date.now()}`,
          }),
        ).unwrap();
        setShowPaymentModal(false);
        onPaymentSuccess?.();
        alert(`${selectedMethod} payment completed successfully!`);
      } catch (error) {
        console.error(`${selectedMethod} payment failed:`, error);
        alert(`${selectedMethod} payment failed.`);
      }
    }, 2000);
  };

  const handleUPIPayment = async (orderResult, formData) => {
    setTimeout(async () => {
      try {
        await dispatch(
          verifyPayment({
            paymentId: orderResult.data.paymentId,
            paymentMethod: "upi",
            upiTransactionId: `upi_${Date.now()}`,
            upiVpa: formData.upiId,
          }),
        ).unwrap();
        setShowPaymentModal(false);
        onPaymentSuccess?.();
        alert("UPI payment completed successfully!");
      } catch (error) {
        console.error("UPI payment failed:", error);
        alert("UPI payment failed.");
      }
    }, 2000);
  };

  const handleFakeCardPayment = async (orderResult, formData) => {
    setTimeout(async () => {
      try {
        await dispatch(
          verifyPayment({
            paymentId: orderResult.data.paymentId,
            paymentMethod: "fake_card",
            fakeCardNumber: formData.cardNumber,
            fakeCardExpiry: formData.expiry,
            fakeCardCvv: formData.cvv,
          }),
        ).unwrap();
        setShowPaymentModal(false);
        onPaymentSuccess?.();
        alert("Test card payment completed successfully!");
      } catch (error) {
        console.error("Fake card payment failed:", error);
        alert("Test card payment failed.");
      }
    }, 2000);
  };

  const closeModal = () => {
    setShowPaymentModal(false);
    setStep("select");
    setSelectedMethod("razorpay");
  };

  if (booking?.advancePayment?.status === "completed") {
    return (
      <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-md">
        ✓ Payment Completed
      </span>
    );
  }

  if (booking?.status !== "approved") {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowPaymentModal(true)}
        disabled={loading}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transform"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Pay Now - {formatPrice(booking?.advancePayment?.amount)}
      </button>

      {/* PREMIUM PAYMENT MODAL - POSITIONED RELATIVE TO BUTTON */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.25)] animate-scale-up border border-white/60 max-h-[95vh] overflow-hidden">
            {/* MODAL HEADER */}
            <div className="flex justify-between items-center p-8 border-b border-slate-100/50 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                  {step === "select" ? "Choose Payment Method" : "Complete Payment"}
                </h3>
                <p className="text-sm text-slate-600 font-medium mt-1 flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  256-bit SSL Encrypted & Secure Transaction
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-3 rounded-full hover:bg-white/50 text-slate-500 hover:text-slate-700 transition-all duration-200 hover:rotate-90 focus:outline-none group"
              >
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="p-8 overflow-y-auto custom-scrollbar max-h-[calc(95vh-120px)]">
              <div className="space-y-8">
                
                {/* PAYMENT AMOUNT DISPLAY */}
                <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100/50 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5"></div>
                  <div className="relative">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                      {formatPrice(booking?.advancePayment?.amount)}
                    </div>
                    <p className="text-slate-700 font-semibold text-lg mb-2">
                      {booking?.hostel?.name}
                    </p>
                    <div className="flex items-center justify-center gap-3 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Instant Processing
                      </div>
                      <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Bank Grade Security
                      </div>
                    </div>
                  </div>
                </div>

                {step === "select" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse"></div>
                      <h3 className="text-xl font-bold text-slate-800">
                        Select Your Preferred Payment Method
                      </h3>
                    </div>
                    <PaymentMethodSelector
                      selectedMethod={selectedMethod}
                      onMethodSelect={handlePaymentMethodSelect}
                    />
                  </div>
                )}

                {step === "form" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse"></div>
                      <h3 className="text-xl font-bold text-slate-800">
                        Complete Your Payment
                      </h3>
                    </div>
                    <PaymentForm
                      paymentData={{
                        bookingId: booking._id,
                        amount: booking?.advancePayment?.amount || 0,
                        paymentType,
                        paymentId,
                        selectedMethod,
                      }}
                      onClose={closeModal}
                      onSuccess={() => {
                        closeModal();
                        onPaymentSuccess?.();
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PayNowButton;
