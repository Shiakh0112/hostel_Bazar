import React from 'react';
import { XCircle, AlertTriangle, CheckCircle } from 'lucide-react';

const AvailabilityBadge = ({ availableBeds, totalBeds }) => {
  const getAvailabilityStatus = () => {
    if (availableBeds === 0) {
      return {
        text: 'Fully Occupied',
        className: 'bg-red-50 text-red-600 border-red-100',
        icon: <XCircle className="w-3 h-3" />
      };
    } else if (availableBeds <= 5) {
      return {
        text: 'Filling Fast',
        className: 'bg-orange-50 text-orange-600 border-orange-100',
        icon: <AlertTriangle className="w-3 h-3" />
      };
    } else {
      return {
        text: 'Available',
        className: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        icon: <CheckCircle className="w-3 h-3" />
      };
    }
  };

  const status = getAvailabilityStatus();

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm ${status.className}`}>
      {status.icon}
      {status.text}
      {availableBeds > 0 && (
        <span className="bg-white/50 px-1.5 rounded-md ml-1">({availableBeds})</span>
      )}
    </span>
  );
};

export default AvailabilityBadge;