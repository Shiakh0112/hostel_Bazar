import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  createPaymentOrder,
  verifyPayment,
} from "../../app/slices/paymentSlice";
import { formatPrice } from "../../utils/priceFormatter";
import toast from "react-hot-toast";
import api from "../../services/api";
import {
  X,
  CreditCard,
  Smartphone,
  Wallet,
  Lock,
  Calendar,
  User,
  Phone,
  AtSign,
  CheckCircle2,
} from "lucide-react";

const PaymentForm = ({ paymentData, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(
    paymentData.selectedMethod || "card",
  );
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    upiId: "",
    email: "",
    mobile: "",
    walletPin: "",
  });

  const [breakdown, setBreakdown] = useState({
    baseAmount: paymentData.amount || 0,
    electricityCharges: 0,
    maintenanceCharges: 0,
    total: paymentData.amount || 0,
  });

  useEffect(() => {
    if (paymentData.paymentType === "monthly") {
      calculateMonthlyCharges();
    }
  }, [paymentData]);

  const calculateMonthlyCharges = async () => {
    try {
      const response = await api.post("/monthly-payments/calculate-charges", {
        bookingId: paymentData.bookingId,
        month: paymentData.month,
        year: paymentData.year,
      });

      if (response.data.success) {
        const data = response.data.data;
        setBreakdown({
          baseAmount: paymentData.amount,
          electricityCharges: data.electricityCharges || 0,
          maintenanceCharges: data.maintenanceCharges || 0,
          total:
            paymentData.amount +
            (data.electricityCharges || 0) +
            (data.maintenanceCharges || 0),
        });
      }
    } catch (error) {
      console.error("Error calculating charges:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "cardNumber") {
      const formatted = value
        .replace(/\s/g, "")
        .replace(/(.{4})/g, "$1 ")
        .trim();
      if (formatted.length <= 19) {
        setFormData((prev) => ({ ...prev, [name]: formatted }));
      }
    } else if (name === "expiryDate") {
      const formatted = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "$1/$2");
      if (formatted.length <= 5) {
        setFormData((prev) => ({ ...prev, [name]: formatted }));
      }
    } else if (name === "cvv") {
      const formatted = value.replace(/\D/g, "");
      if (formatted.length <= 4) {
        setFormData((prev) => ({ ...prev, [name]: formatted }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (paymentMethod === "fake_card") {
      if (
        !formData.cardNumber ||
        formData.cardNumber.replace(/\s/g, "").length !== 16
      ) {
        toast.error("Please enter a valid 16-digit card number");
        return false;
      }
      if (!formData.expiryDate || formData.expiryDate.length !== 5) {
        toast.error("Please enter expiry date in MM/YY format");
        return false;
      }
      if (!formData.cvv || formData.cvv.length < 3) {
        toast.error("Please enter a valid CVV");
        return false;
      }
      if (!formData.cardholderName.trim()) {
        toast.error("Please enter cardholder name");
        return false;
      }
    } else if (paymentMethod === "upi") {
      if (!formData.upiId || !formData.upiId.includes("@")) {
        toast.error("Please enter a valid UPI ID");
        return false;
      }
    } else if (paymentMethod === "razorpay" || paymentMethod === "stripe") {
      if (
        !formData.cardNumber ||
        formData.cardNumber.replace(/\s/g, "").length !== 16
      ) {
        toast.error("Please enter a valid card number");
        return false;
      }
      if (!formData.expiryDate || formData.expiryDate.length !== 5) {
        toast.error("Please enter expiry date in MM/YY format");
        return false;
      }
      if (!formData.cvv || formData.cvv.length < 3) {
        toast.error("Please enter a valid CVV/CVC");
        return false;
      }
      if (!formData.cardholderName.trim()) {
        toast.error("Please enter cardholder name");
        return false;
      }
      if (
        paymentMethod === "stripe" &&
        (!formData.email?.trim() || !formData.email.includes("@"))
      ) {
        toast.error("Please enter a valid email address");
        return false;
      }
    } else if (paymentMethod === "phonepe" || paymentMethod === "googlepay") {
      if (!formData.mobile?.trim() || formData.mobile.length < 10) {
        toast.error("Please enter a valid mobile number");
        return false;
      }
      if (!formData.walletPin?.trim()) {
        toast.error(`Please enter your ${paymentMethod} PIN`);
        return false;
      }
    }
    return true;
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const orderData = {
        bookingId: paymentData.bookingId,
        amount: breakdown.total,
        paymentType: paymentData.paymentType,
        paymentMethod:
          paymentMethod === "fake_card" ? "fake_card" : paymentMethod,
        paymentId: paymentData.paymentId,
      };

      const orderResult = await dispatch(
        createPaymentOrder(orderData),
      ).unwrap();

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Verify payment
      const verifyData = {
        paymentId: orderResult.data?.paymentId || orderResult.paymentId,
        paymentMethod: paymentMethod,
      };

      if (paymentMethod === "fake_card") {
        verifyData.fakeCardNumber = formData.cardNumber;
        verifyData.fakeCardExpiry = formData.expiryDate;
        verifyData.fakeCardCvv = formData.cvv;
      } else if (paymentMethod === "upi") {
        verifyData.upiTransactionId = `upi_${Date.now()}`;
        verifyData.upiVpa = formData.upiId;
      } else if (paymentMethod === "stripe") {
        verifyData.stripePaymentIntentId =
          orderResult.paymentIntentId || `pi_${Date.now()}`;
      } else if (paymentMethod === "phonepe" || paymentMethod === "googlepay") {
        verifyData[`${paymentMethod}TransactionId`] =
          `${paymentMethod}_${Date.now()}`;
      } else if (paymentMethod === "razorpay") {
        verifyData.razorpayOrderId = `order_${Date.now()}`;
        verifyData.razorpayPaymentId = `pay_${Date.now()}`;
        verifyData.razorpaySignature = `sig_${Date.now()}`;
      }

      await dispatch(verifyPayment(verifyData)).unwrap();

      toast.success("Payment successful!");
      onSuccess && onSuccess();
      onClose && onClose();
    } catch (error) {
      toast.error(error.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* PAYMENT SUMMARY */}
      <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100/50 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <h4 className="text-sm font-bold text-slate-600 uppercase tracking-widest">Payment Summary</h4>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Base Amount</span>
            <span className="font-medium">{formatPrice(breakdown.baseAmount)}</span>
          </div>
          {paymentData.paymentType === "monthly" && (
            <>
              {breakdown.electricityCharges > 0 && (
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Electricity</span>
                  <span className="font-medium">{formatPrice(breakdown.electricityCharges)}</span>
                </div>
              )}
              {breakdown.maintenanceCharges > 0 && (
                <div className="flex justify-between text-sm text-orange-600">
                  <span>Maintenance</span>
                  <span className="font-medium">{formatPrice(breakdown.maintenanceCharges)}</span>
                </div>
              )}
            </>
          )}
          <div className="border-t border-slate-200 my-2"></div>
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-800">Total Payable</span>
            <span className="text-xl font-bold text-blue-600">{formatPrice(breakdown.total)}</span>
          </div>
        </div>
      </div>

      {/* SELECTED METHOD */}
      <div className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
            {paymentMethod === "upi" ? <Wallet className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-xs font-bold text-indigo-400 uppercase">Method</p>
            <p className="text-sm font-bold text-slate-700 capitalize">{paymentMethod.replace("_", " ")}</p>
          </div>
        </div>
        <CheckCircle2 className="w-5 h-5 text-green-500" />
      </div>

      {/* FORM */}
      <form onSubmit={handlePayment} className="space-y-5">
            
            {/* CARD FIELDS */}
            {(paymentMethod === "fake_card" ||
              paymentMethod === "card" ||
              paymentMethod === "razorpay" ||
              paymentMethod === "stripe") && (
              <div className="space-y-4">
                <div className="relative group">
                  <CreditCard
                    className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                    size={18}
                  />
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="Card Number"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 text-slate-700"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative group">
                    <Calendar
                      className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                      size={18}
                    />
                    <input
                      type="text"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 text-slate-700"
                      required
                    />
                  </div>
                  <div className="relative group">
                    <Lock
                      className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                      size={18}
                    />
                    <input
                      type="password"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="CVV"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 text-slate-700"
                      required
                    />
                  </div>
                </div>

                <div className="relative group">
                  <User
                    className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                    size={18}
                  />
                  <input
                    type="text"
                    name="cardholderName"
                    value={formData.cardholderName}
                    onChange={handleInputChange}
                    placeholder="Cardholder Name"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 text-slate-700"
                    required
                  />
                </div>
                
                {paymentMethod === "stripe" && (
                   <div className="relative group">
                    <AtSign
                      className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                      size={18}
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ""}
                      onChange={handleInputChange}
                      placeholder="Email Address"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 text-slate-700"
                      required
                    />
                  </div>
                )}
              </div>
            )}

            {/* UPI FIELD */}
            {paymentMethod === "upi" && (
              <div className="relative group">
                <AtSign
                  className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                  size={18}
                />
                <input
                  type="text"
                  name="upiId"
                  value={formData.upiId}
                  onChange={handleInputChange}
                  placeholder="UPI ID (e.g. user@upi)"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 text-slate-700"
                  required
                />
              </div>
            )}

            {/* WALLET FIELDS */}
            {(paymentMethod === "phonepe" || paymentMethod === "googlepay") && (
              <div className="space-y-4">
                <div className="relative group">
                  <Phone
                    className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                    size={18}
                  />
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile || ""}
                    onChange={handleInputChange}
                    placeholder="Linked Mobile Number"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 text-slate-700"
                    required
                  />
                </div>
                <div className="relative group">
                  <Lock
                    className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                    size={18}
                  />
                  <input
                    type="password"
                    name="walletPin"
                    value={formData.walletPin || ""}
                    onChange={handleInputChange}
                    placeholder="Enter PIN"
                    maxLength={paymentMethod === "googlepay" ? 6 : 4}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 text-slate-700"
                    required
                  />
                </div>
              </div>
            )}

        {/* ACTION BUTTONS */}
        <div className="pt-6 flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 px-6 rounded-xl text-slate-600 font-bold border border-slate-200 hover:bg-slate-50 transition-all"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3.5 px-6 rounded-xl text-white font-bold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg shadow-indigo-500/30 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:scale-100"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </div>
            ) : (
              `Pay ${formatPrice(breakdown.total)}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;