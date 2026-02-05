import React from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "../../utils/priceFormatter";
import AvailabilityBadge from "./AvailabilityBadge";
import {
  MapPin,
  Star,
  Wifi,
  Coffee,
  Users,
  Utensils,
  ArrowRight,
  Edit,
  Settings,
  Building2,
} from "lucide-react";

const HostelCard = ({ hostel, isOwner = false }) => {
  const {
    _id,
    name,
    description,
    address,
    hostelType,
    pricing,
    totalBeds,
    availableBeds,
    occupiedBeds,
    rating,
    images,
    amenities,
  } = hostel;

  const mainImage =
    hostel.mainImage ||
    images?.find((img) => img.type === "building")?.url ||
    images?.[0]?.url ||
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

  const occupancyRate =
    totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 min-w-[320px] w-full max-w-sm">
      {/* Image Section */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={mainImage}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <AvailabilityBadge availableBeds={availableBeds} />
          <span className="bg-white/95 backdrop-blur-md text-gray-800 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm capitalize flex items-center gap-1 w-fit">
            <Building2 className="w-3 h-3" /> {hostelType}
          </span>
        </div>

        {/* Owner Badge */}
        {isOwner && (
          <div className="absolute top-4 right-4">
            <span className="bg-indigo-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md shadow-indigo-500/40">
              Managed by You
            </span>
          </div>
        )}

        {/* Price Float */}
        <div className="absolute bottom-4 left-4 text-white">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold drop-shadow-lg">
              {formatPrice((pricing?.monthlyRent || 0) + (pricing?.electricityCharges || 0))}
            </span>
            <span className="text-sm opacity-90 drop-shadow-lg">/mo</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 pr-3">
            <h3 className="text-xl font-bold text-gray-900 leading-tight line-clamp-1 group-hover:text-indigo-600 transition-colors mb-1">
              {name}
            </h3>
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">
                {address?.area}, {address?.city}
              </span>
            </div>
          </div>
          {rating?.average > 0 && (
            <div className="flex flex-col items-center bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 flex-shrink-0">
              <div className="flex items-center text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-bold text-gray-800 ml-1">
                  {rating.average.toFixed(1)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Quick Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-5 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div className="flex items-center gap-4">
            <span className="flex items-center">
              <Users className="w-4 h-4 mr-1 text-indigo-500" />
              <span className="font-medium">{availableBeds}/{totalBeds}</span>
            </span>
            <span className="w-px h-5 bg-gray-300"></span>
            <span className="font-medium text-gray-700">
              {occupancyRate}% Occupied
            </span>
          </div>
          {amenities?.length > 0 && (
            <div className="flex -space-x-1">
              {amenities.slice(0, 3).map((a, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-sm"
                  title={a}
                >
                  {a === "WiFi" ? (
                    <Wifi className="w-3.5 h-3.5 text-blue-500" />
                  ) : a === "Mess" ? (
                    <Utensils className="w-3.5 h-3.5 text-orange-500" />
                  ) : a === "AC" ? (
                    <Coffee className="w-3.5 h-3.5 text-cyan-500" />
                  ) : (
                    <div className="w-2.5 h-2.5 bg-gray-300 rounded-full" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-400">Updated Recently</div>
          {isOwner ? (
            <div className="flex gap-2 flex-wrap">
              <Link
                to={`/dashboard/owner/hostels/${_id}/edit`}
                className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors"
              >
                <Edit className="w-3 h-3 mr-1" /> Edit
              </Link>
              <Link
                to={`/dashboard/owner/hostels/${_id}/manage`}
                className="flex items-center px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
              >
                <Settings className="w-3 h-3 mr-1" /> Manage
              </Link>
              <Link
                to={`/hostels/${_id}`}
                className="flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
              >
                View Details
              </Link>
            </div>
          ) : (
            <Link
              to={`/hostels/${_id}`}
              className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all transform active:scale-95 shadow-lg shadow-gray-200"
            >
              View Details
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostelCard;
