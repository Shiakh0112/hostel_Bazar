import { useState } from 'react';

const PaymentMethodSelector = ({ onMethodSelect, selectedMethod }) => {
  const [isOpen, setIsOpen] = useState(false);

  const paymentMethods = [
    { id: 'razorpay', name: 'Razorpay', icon: '💳', description: 'Cards, UPI, Wallets', color: 'from-blue-500 to-blue-600' },
    { id: 'stripe', name: 'Stripe', icon: '💎', description: 'International Cards', color: 'from-purple-500 to-purple-600' },
    { id: 'phonepe', name: 'PhonePe', icon: '📱', description: 'PhonePe Wallet', color: 'from-purple-600 to-indigo-600' },
    { id: 'upi', name: 'UPI', icon: '🏦', description: 'Direct UPI Transfer', color: 'from-green-500 to-green-600' },
    { id: 'googlepay', name: 'Google Pay', icon: '🔵', description: 'Google Pay', color: 'from-blue-400 to-blue-500' },
    { id: 'fake_card', name: 'Test Card', icon: '🧪', description: 'For Testing Only', color: 'from-gray-500 to-gray-600' }
  ];

  const selectedMethodData = paymentMethods.find(method => method.id === selectedMethod);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white/80 backdrop-blur border border-slate-200 rounded-xl hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm"
      >
        <div className="flex items-center space-x-4">
          {selectedMethodData ? (
            <>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${selectedMethodData.color} flex items-center justify-center text-white shadow-lg`}>
                <span className="text-lg">{selectedMethodData.icon}</span>
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-800">{selectedMethodData.name}</div>
                <div className="text-sm text-slate-500">{selectedMethodData.description}</div>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-slate-500 font-medium">Select Payment Method</span>
            </>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-20 w-full mt-2 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-fade-in">
          {paymentMethods.map((method, index) => (
            <button
              key={method.id}
              type="button"
              onClick={() => {
                onMethodSelect(method.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center space-x-4 px-5 py-4 text-left hover:bg-slate-50/80 transition-all duration-200 ${
                selectedMethod === method.id 
                  ? 'bg-blue-50/80 border-l-4 border-blue-500' 
                  : index !== paymentMethods.length - 1 ? 'border-b border-slate-100' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${method.color} flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                <span className="text-lg">{method.icon}</span>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-slate-800">{method.name}</div>
                <div className="text-sm text-slate-500">{method.description}</div>
              </div>
              {selectedMethod === method.id && (
                <div className="text-blue-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;