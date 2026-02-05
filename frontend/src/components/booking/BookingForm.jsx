import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createBookingRequest } from '../../app/slices/bookingSlice';

const BookingForm = ({ hostel, onClose }) => {
  const dispatch = useDispatch();
  const { isLoading: loading } = useSelector((state) => state.booking);
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    mobile: user?.mobile || '',
    email: user?.email || '',
    idProof: '',
    preferredRoomType: hostel?.structure?.roomType || '',
    checkInDate: '',
    expectedCheckOutDate: '',
    numberOfPersons: 1,
    notes: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.mobile.trim()) newErrors.mobile = 'Mobile number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.idProof.trim()) newErrors.idProof = 'ID proof is required';
    if (!formData.checkInDate) newErrors.checkInDate = 'Check-in date is required';
    if (!formData.expectedCheckOutDate) newErrors.expectedCheckOutDate = 'Expected check-out date is required';

    // Validate dates
    if (formData.checkInDate && new Date(formData.checkInDate) < new Date()) {
      newErrors.checkInDate = 'Check-in date cannot be in the past';
    }
    if (formData.checkInDate && formData.expectedCheckOutDate && 
        new Date(formData.expectedCheckOutDate) <= new Date(formData.checkInDate)) {
      newErrors.expectedCheckOutDate = 'Check-out date must be after check-in date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await dispatch(createBookingRequest({
        hostelId: hostel._id,
        bookingDetails: formData
      })).unwrap();
      onClose();
    } catch (error) {
      console.error('Booking request failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.fullName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
          <input
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.mobile ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ID Proof *</label>
          <input
            type="text"
            name="idProof"
            value={formData.idProof}
            onChange={handleChange}
            placeholder="Aadhar/PAN/Passport Number"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.idProof ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.idProof && <p className="text-red-500 text-xs mt-1">{errors.idProof}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Room Type</label>
          <select
            name="preferredRoomType"
            value={formData.preferredRoomType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="triple">Triple</option>
            <option value="quad">Quad</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Number of Persons</label>
          <input
            type="number"
            name="numberOfPersons"
            value={formData.numberOfPersons}
            onChange={handleChange}
            min="1"
            max="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date *</label>
          <input
            type="date"
            name="checkInDate"
            value={formData.checkInDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.checkInDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.checkInDate && <p className="text-red-500 text-xs mt-1">{errors.checkInDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expected Check-out Date *</label>
          <input
            type="date"
            name="expectedCheckOutDate"
            value={formData.expectedCheckOutDate}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.expectedCheckOutDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.expectedCheckOutDate && <p className="text-red-500 text-xs mt-1">{errors.expectedCheckOutDate}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Special Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="3"
          placeholder="Any special requirements or preferences..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
};

export default BookingForm;