import { useState } from 'react';

const PaymentForm = ({ paymentMethod, onSubmit, loading }) => {
  const [formData, setFormData] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderForm = () => {
    switch (paymentMethod) {
      case 'upi':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
              <input
                type="text"
                placeholder="yourname@paytm"
                value={formData.upiId || ''}
                onChange={(e) => setFormData({...formData, upiId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        );

      case 'fake_card':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
              <input
                type="text"
                placeholder="4111 1111 1111 1111"
                value={formData.cardNumber || ''}
                onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength="19"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={formData.expiry || ''}
                  onChange={(e) => setFormData({...formData, expiry: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength="5"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                <input
                  type="text"
                  placeholder="123"
                  value={formData.cvv || ''}
                  onChange={(e) => setFormData({...formData, cvv: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength="4"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={formData.cardholderName || ''}
                onChange={(e) => setFormData({...formData, cardholderName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        );

      case 'phonepe':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-6xl mb-4">📱</div>
              <p className="text-gray-600">You will be redirected to PhonePe to complete the payment</p>
            </div>
          </div>
        );

      case 'googlepay':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-6xl mb-4">🔵</div>
              <p className="text-gray-600">You will be redirected to Google Pay to complete the payment</p>
            </div>
          </div>
        );

      case 'razorpay':
      case 'stripe':
      default:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-6xl mb-4">💳</div>
              <p className="text-gray-600">
                {paymentMethod === 'stripe' 
                  ? 'You will be redirected to Stripe to complete the payment'
                  : 'You will be redirected to Razorpay to complete the payment'
                }
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {renderForm()}
      
      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : (
          'Proceed to Pay'
        )}
      </button>
    </form>
  );
};

export default PaymentForm;