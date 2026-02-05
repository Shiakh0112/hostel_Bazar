import { useState } from "react";
import { useDispatch } from "react-redux";
import { createHostel } from "../../app/slices/hostelSlice";
import {
  Building,
  MapPin,
  Phone,
  Mail,
  Bed,
  CreditCard,
  Upload,
  X,
  Plus,
  Check,
  Image as ImageIcon,
  Wifi,
  Shield,
  Settings,
} from "lucide-react";

const HostelForm = ({ onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    hostelType: "boys",
    address: { street: "", area: "", city: "", state: "", pincode: "" },
    structure: {
      totalFloors: 3,
      roomsPerFloor: 4,
      bedsPerRoom: 2,
      roomType: "double",
      attachedBathroom: false,
    },
    pricing: {
      monthlyRent: "",
      securityDeposit: "",
      maintenanceCharges: 0,
      electricityCharges: 0,
      advancePayment: "",
    },
    contact: { phone: "", email: "", whatsapp: "" },
    amenities: [],
    rules: [],
  });

  const [amenitiesInput, setAmenitiesInput] = useState("");
  const [rulesInput, setRulesInput] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const amenitiesList = [
    "WiFi",
    "AC",
    "Mess",
    "Laundry",
    "Hot Water",
    "Pricing",
    "Security",
    "Power Backup",
    "TV",
    "Gym",
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]:
            type === "checkbox"
              ? checked
              : type === "number"
                ? Number(value)
                : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "number" ? Number(value) : value,
      }));
    }
  };

  const toggleAmenity = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const addCustomAmenity = () => {
    if (amenitiesInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, amenitiesInput.trim()],
      }));
      setAmenitiesInput("");
    }
  };

  const addRule = () => {
    if (rulesInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        rules: [...prev.rules, rulesInput.trim()],
      }));
      setRulesInput("");
    }
  };

  const removeRule = (index) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index),
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 10) {
      alert("Maximum 10 images allowed");
      return;
    }
    setImages((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        setImagePreviews((prev) => [
          ...prev,
          { url: reader.result, type: "building" },
        ]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const updateImageType = (index, type) => {
    setImagePreviews((prev) =>
      prev.map((img, i) => (i === index ? { ...img, type } : img)),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("description", formData.description);
      submitData.append("hostelType", formData.hostelType);
      Object.keys(formData.address).forEach((key) =>
        submitData.append(`address[${key}]`, formData.address[key]),
      );
      Object.keys(formData.structure).forEach((key) =>
        submitData.append(`structure[${key}]`, formData.structure[key]),
      );
      Object.keys(formData.pricing).forEach((key) =>
        submitData.append(`pricing[${key}]`, formData.pricing[key]),
      );
      Object.keys(formData.contact).forEach((key) =>
        submitData.append(`contact[${key}]`, formData.contact[key]),
      );
      formData.amenities.forEach((amenity) =>
        submitData.append("amenities[]", amenity),
      );
      formData.rules.forEach((rule) => submitData.append("rules[]", rule));
      images.forEach((image, index) => {
        submitData.append("images", image);
        submitData.append(
          `imageType_${index}`,
          imagePreviews[index]?.type || "building",
        );
      });

      await dispatch(createHostel(submitData)).unwrap();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to create hostel:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // FIX 1: Increased padding-bottom from pb-32 to pb-40 to prevent footer overlap
    <form onSubmit={handleSubmit} className="space-y-6 max-h-auto  pb-34 pr-2">
      {/* 1. Basic Details */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="p-2 bg-gray-50 rounded-lg text-gray-700">
            <Building className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Basic Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hostel Name
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
              placeholder="e.g. Sunrise Residency"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none text-sm"
              placeholder="Describe your hostel..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["Boys", "Girls", "Co-ed"].map((type) => (
                <label
                  key={type}
                  className={`cursor-pointer rounded-lg border p-2 text-center text-sm transition-all ${formData.hostelType === type.toLowerCase() ? "bg-blue-50 border-blue-500 text-blue-700 font-medium" : "bg-white border-gray-300 hover:bg-gray-50 text-gray-600"}`}
                >
                  <input
                    type="radio"
                    name="hostelType"
                    value={type.toLowerCase()}
                    checked={formData.hostelType === type.toLowerCase()}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Address */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="p-2 bg-gray-50 rounded-lg text-gray-700">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Location</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street Address
            </label>
            <input
              type="text"
              name="address.street"
              required
              value={formData.address.street}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Area
            </label>
            <input
              type="text"
              name="address.area"
              required
              value={formData.address.area}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              name="address.city"
              required
              value={formData.address.city}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              type="text"
              name="address.state"
              required
              value={formData.address.state}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pincode
            </label>
            <input
              type="text"
              name="address.pincode"
              required
              value={formData.address.pincode}
              onChange={handleChange}
              maxLength={6}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* 3. Structure */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="p-2 bg-gray-50 rounded-lg text-gray-700">
            <Bed className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Structure</h3>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Floors
            </label>
            <input
              type="number"
              name="structure.totalFloors"
              required
              min="1"
              max="20"
              value={formData.structure.totalFloors}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rooms per Floor
            </label>
            <input
              type="number"
              name="structure.roomsPerFloor"
              required
              min="1"
              max="50"
              value={formData.structure.roomsPerFloor}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Beds per Room
            </label>
            <input
              type="number"
              name="structure.bedsPerRoom"
              required
              min="1"
              max="10"
              value={formData.structure.bedsPerRoom}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center border border-gray-200">
          <span className="text-sm text-gray-600 font-medium">
            Calculated Total Beds:
          </span>
          <span className="text-lg font-bold text-gray-900">
            {formData.structure.totalFloors *
              formData.structure.roomsPerFloor *
              formData.structure.bedsPerRoom}
          </span>
        </div>
      </div>

      {/* 4. Pricing */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="p-2 bg-gray-50 rounded-lg text-gray-700">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Pricing (Monthly)
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              label: "Monthly Rent",
              name: "pricing.monthlyRent",
              required: true,
            },
            {
              label: "Security Deposit",
              name: "pricing.securityDeposit",
              required: true,
            },
            {
              label: "Advance Payment",
              name: "pricing.advancePayment",
              required: true,
            },
            {
              label: "Maintenance",
              name: "pricing.maintenanceCharges",
              required: false,
            },
            {
              label: "Electricity",
              name: "pricing.electricityCharges",
              required: false,
            },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 font-medium text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  name={field.name}
                  required={field.required}
                  value={field.name
                    .split(".")
                    .reduce((o, i) => o?.[i], formData)}
                  onChange={handleChange}
                  className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm placeholder-gray-400"
                  placeholder="0"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Contact Info */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="p-2 bg-gray-50 rounded-lg text-gray-700">
            <Settings className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Contact Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            {/* FIX: 'relative' yahan lagayi gayi hai taake icon input ke respect mein position ho */}
            <div className="relative">
              <div className="absolute left-3 top-2.5 text-gray-400 pointer-events-none">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                name="contact.phone"
                required
                value={formData.contact.phone}
                onChange={handleChange}
                maxLength={10}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          {/* 2. Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute left-3 top-2.5 text-gray-400 pointer-events-none">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="contact.email"
                required
                value={formData.contact.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          {/* 3. WhatsApp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1 pointer-events-none">
                <span className="font-bold text-[9px] border border-green-200 bg-green-50 px-1.5 py-0.5 rounded">
                  W
                </span>
              </div>
              <input
                type="tel"
                name="contact.whatsapp"
                value={formData.contact.whatsapp}
                onChange={handleChange}
                maxLength={10}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 6. Amenities & Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Amenities */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Amenities</h3>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {amenitiesList.map((amenity) => (
              <label
                key={amenity}
                className={`cursor-pointer rounded-lg border p-2 text-center text-xs transition-all ${formData.amenities.includes(amenity) ? "bg-blue-50 border-blue-500 text-blue-700 font-medium" : "bg-white border-gray-300 hover:bg-gray-50 text-gray-600"}`}
              >
                <input
                  type="checkbox"
                  checked={formData.amenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                  className="sr-only"
                />
                {amenity}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={amenitiesInput}
              onChange={(e) => setAmenitiesInput(e.target.value)}
              placeholder="Add custom amenity..."
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
            />
            <button
              type="button"
              onClick={addCustomAmenity}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-sm font-medium transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Rules */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Hostel Rules
            </h3>
          </div>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={rulesInput}
              onChange={(e) => setRulesInput(e.target.value)}
              placeholder="Add a hostel rule"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
            />
            <button
              type="button"
              onClick={addRule}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium text-gray-800 transition-colors"
            >
              Add
            </button>
          </div>

          {formData.rules.length > 0 && (
            <ul className="space-y-2">
              {formData.rules.map((rule, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200"
                >
                  <span className="text-sm text-gray-700">{rule}</span>
                  <button
                    type="button"
                    onClick={() => removeRule(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 7. Images Upload */}
      {/* FIX 2: Added mb-6 here to create space before the footer starts */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gray-50 rounded-lg text-gray-700">
            <ImageIcon className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Photos</h3>
        </div>

        <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all block">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <div className="flex flex-col items-center">
            <div className="p-3 bg-white border border-gray-200 rounded-full mb-3">
              <Upload className="w-6 h-6 text-gray-500" />
            </div>
            <p className="text-sm font-medium text-gray-700">
              Click to upload photos
            </p>
            <p className="text-xs text-gray-500 mt-1">Max 10 images</p>
          </div>
        </label>

        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mt-6">
            {imagePreviews.map((preview, index) => (
              <div
                key={index}
                className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square"
              >
                <img
                  src={preview.url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === 0 && (
                  <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-white/90 text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 8. Sticky Footer Actions */}
      {/* Added backdrop-blur for better visibility over scrolling content */}
      <div className=" rounded-xl bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 flex justify-end gap-4 z-50">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-70 transition-colors flex items-center text-sm"
        >
          {loading ? (
            "Creating..."
          ) : (
            <>
              Create Hostel <Check className="w-4 h-4 ml-2" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default HostelForm;
