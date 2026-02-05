import { useState } from 'react';
import { Search, Filter, X, MapPin, Home, DollarSign, Layers, SlidersHorizontal } from 'lucide-react';

const HostelFilter = ({ onFilterChange, loading }) => {
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    hostelType: '',
    roomType: '',
    minPrice: '',
    maxPrice: '',
    amenities: []
  });

  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad'];
  const amenitiesList = ['WiFi', 'Mess', 'Laundry', 'Security', 'Gym', 'AC', 'Parking'];

  const handleInputChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleAmenityToggle = (amenity) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    const newFilters = { ...filters, amenities: newAmenities };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      city: '',
      hostelType: '',
      roomType: '',
      minPrice: '',
      maxPrice: '',
      amenities: []
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
            <Filter className="w-4 h-4" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Filter Options</h3>
        </div>
        <button
          onClick={clearFilters}
          className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
        >
          <X className="w-3 h-3" /> Clear All
        </button>
      </div>

      <div className="space-y-6">
        {/* Search */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Search Hostel</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleInputChange('search', e.target.value)}
              placeholder="Search by name, area..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm transition-all"
            />
          </div>
        </div>

        {/* City */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">City</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <select
              value={filters.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm appearance-none cursor-pointer"
            >
              <option value="">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Hostel Type */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Type</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'boys', label: 'Boys', icon: <Home className="w-4 h-4 text-blue-500" /> },
              { id: 'girls', label: 'Girls', icon: <Home className="w-4 h-4 text-pink-500" /> },
              { id: 'co-ed', label: 'Co-Ed', icon: <Home className="w-4 h-4 text-purple-500" /> }
            ].map((opt) => (
               <label key={opt.id} className={`
                 flex items-center justify-center p-2 rounded-xl border cursor-pointer transition-all
                 ${filters.hostelType === opt.id ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-gray-200 hover:border-gray-300'}
               `}>
                  <input type="radio" name="type" value={opt.id} checked={filters.hostelType === opt.id} onChange={(e) => handleInputChange('hostelType', e.target.value)} className="sr-only" />
                  {opt.icon}
                  <span className={`text-xs font-medium ml-2 ${filters.hostelType === opt.id ? 'text-indigo-700' : 'text-gray-600'}`}>{opt.label}</span>
               </label>
            ))}
          </div>
        </div>

        {/* Room Type */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Room Type</label>
          <div className="relative">
            <Layers className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <select
              value={filters.roomType}
              onChange={(e) => handleInputChange('roomType', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm appearance-none cursor-pointer"
            >
              <option value="">Any</option>
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="triple">Triple</option>
              <option value="dormitory">Dormitory</option>
            </select>
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Price Range (₹)</label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <DollarSign className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleInputChange('minPrice', e.target.value)}
                placeholder="Min"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm"
              />
            </div>
            <SlidersHorizontal className="text-gray-300" />
            <div className="relative flex-1">
              <DollarSign className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                placeholder="Max"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Amenities</label>
          <div className="grid grid-cols-3 gap-2">
            {amenitiesList.map(amenity => (
              <label key={amenity} className={`
                flex items-center justify-center p-2.5 rounded-lg border cursor-pointer transition-all text-xs font-medium
                ${filters.amenities.includes(amenity) 
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-200' 
                  : 'bg-white border-gray-200 hover:border-indigo-300 text-gray-600'}
              `}>
                <input
                  type="checkbox"
                  checked={filters.amenities.includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                  className="sr-only"
                />
                {amenity}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostelFilter;