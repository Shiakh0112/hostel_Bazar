import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/common/Footer';
import {
  Search,
  Shield,
  CreditCard,
  Headphones,
  MapPin,
  Users,
  Clock,
  Star,
  CheckCircle,
  ArrowRight,
  Building,
  Smartphone,
  FileText,
  Home,
  Zap,
  Award,
  Heart,
  Camera,
  Bell
} from 'lucide-react';

const Services = () => {
  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* --- HERO SECTION --- */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48 overflow-hidden">
        {/* Decorative Background Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
          <div className="absolute top-0 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 right-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold">
              <Zap className="w-4 h-4" />
              Our Services
            </div>

            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Everything You Need <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-blue-600 to-violet-600">
                Under One Roof
              </span>
            </h1>

            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              From finding the perfect hostel to moving in seamlessly, we provide end-to-end services 
              to make your accommodation journey hassle-free.
            </p>
          </div>
        </div>
      </section>

      {/* --- MAIN SERVICES SECTION --- */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Core <span className="text-blue-600">Services</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Comprehensive solutions designed specifically for students
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {[
              {
                icon: <Search className="w-8 h-8" />,
                title: "Smart Hostel Discovery",
                desc: "Advanced search filters to find hostels that match your exact requirements - budget, location, amenities, and more.",
                features: ["Location-based search", "Price range filters", "Amenity matching", "Availability calendar"],
                color: "blue"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Verification & Safety",
                desc: "Every hostel undergoes rigorous verification process to ensure safety, cleanliness, and quality standards.",
                features: ["Physical property inspection", "Safety compliance check", "Owner background verification", "Regular quality audits"],
                color: "emerald"
              },
              {
                icon: <CreditCard className="w-8 h-8" />,
                title: "Secure Payments",
                desc: "Multiple payment options with complete security. Your money is protected until you check-in and confirm.",
                features: ["Multiple payment gateways", "Escrow protection", "Instant refunds", "Payment history tracking"],
                color: "violet"
              },
              {
                icon: <Headphones className="w-8 h-8" />,
                title: "24/7 Customer Support",
                desc: "Round-the-clock assistance for any queries, issues, or emergencies. We're always here to help.",
                features: ["Live chat support", "Phone assistance", "Email support", "Emergency helpline"],
                color: "orange"
              }
            ].map((service, idx) => (
              <div key={idx} className="group p-8 bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 hover:border-blue-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-100/40">
                <div className={`w-16 h-16 bg-${service.color}-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-${service.color}-600 transition-colors duration-300 text-${service.color}-600 group-hover:text-white`}>
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{service.title}</h3>
                <p className="text-slate-600 leading-relaxed mb-6">{service.desc}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, featureIdx) => (
                    <li key={featureIdx} className="flex items-center gap-3">
                      <CheckCircle className={`w-4 h-4 text-${service.color}-500`} />
                      <span className="text-slate-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- ADDITIONAL SERVICES SECTION --- */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Additional <span className="text-violet-600">Services</span>
            </h2>
            <p className="text-lg text-slate-600">
              Extra services to make your hostel experience even better
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Camera className="w-6 h-6" />,
                title: "Virtual Tours",
                desc: "360° virtual tours of hostels so you can explore rooms before booking."
              },
              {
                icon: <MapPin className="w-6 h-6" />,
                title: "Location Insights",
                desc: "Detailed area information including nearby colleges, markets, and transport."
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Roommate Matching",
                desc: "Find compatible roommates based on preferences and lifestyle."
              },
              {
                icon: <FileText className="w-6 h-6" />,
                title: "Document Assistance",
                desc: "Help with rental agreements, documentation, and legal formalities."
              },
              {
                icon: <Smartphone className="w-6 h-6" />,
                title: "Mobile App",
                desc: "Manage bookings, payments, and communicate with hosts on the go."
              },
              {
                icon: <Bell className="w-6 h-6" />,
                title: "Smart Notifications",
                desc: "Get alerts for new listings, price drops, and booking updates."
              }
            ].map((service, idx) => (
              <div key={idx} className="group p-6 bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 hover:border-violet-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-100/40">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-violet-600 transition-colors duration-300 text-slate-600 group-hover:text-white">
                  {service.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{service.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOR HOSTEL OWNERS SECTION --- */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold">
                <Building className="w-4 h-4" />
                For Hostel Owners
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                Grow your hostel <span className="text-blue-600">business</span>
              </h2>
              
              <p className="text-lg text-slate-600 leading-relaxed">
                Join thousands of hostel owners who have increased their occupancy and revenue 
                through our platform. We provide all the tools you need to manage your property effectively.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    icon: <Users className="w-5 h-5" />,
                    title: "Tenant Management",
                    desc: "Manage bookings, payments, and tenant communications"
                  },
                  {
                    icon: <Star className="w-5 h-5" />,
                    title: "Review System",
                    desc: "Build reputation through verified student reviews"
                  },
                  {
                    icon: <Clock className="w-5 h-5" />,
                    title: "Real-time Analytics",
                    desc: "Track occupancy, revenue, and performance metrics"
                  },
                  {
                    icon: <Award className="w-5 h-5" />,
                    title: "Marketing Support",
                    desc: "Professional photography and listing optimization"
                  }
                ].map((feature, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">{feature.title}</h4>
                      <p className="text-slate-600 text-sm">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to="/contact"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all hover:scale-105 shadow-lg shadow-blue-600/20"
              >
                List Your Property
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>

            <div className="relative">
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/20 rotate-2 hover:rotate-0 transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                  alt="Hostel management"
                  className="w-full h-[400px] object-cover"
                />
              </div>
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-violet-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PROCESS SECTION --- */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              How It <span className="text-emerald-600">Works</span>
            </h2>
            <p className="text-lg text-slate-600">
              Simple 4-step process to find your perfect hostel
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Search & Filter",
                desc: "Use our smart filters to find hostels that match your requirements",
                icon: <Search className="w-6 h-6" />
              },
              {
                step: "02", 
                title: "Compare & Review",
                desc: "Compare options, read reviews, and take virtual tours",
                icon: <Star className="w-6 h-6" />
              },
              {
                step: "03",
                title: "Book Securely",
                desc: "Make secure payments with our protected booking system",
                icon: <CreditCard className="w-6 h-6" />
              },
              {
                step: "04",
                title: "Move In",
                desc: "Complete documentation and move into your new home",
                icon: <Home className="w-6 h-6" />
              }
            ].map((process, idx) => (
              <div key={idx} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center mx-auto group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                    <div className="text-emerald-600">
                      {process.icon}
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {process.step}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{process.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{process.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-24 bg-gradient-to-br from-emerald-600 to-blue-700 text-center text-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Ready to experience our services?
          </h2>
          <p className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
            Join thousands of students who have found their perfect accommodation through HostelBazar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/hostels"
              className="inline-flex items-center px-8 py-4 bg-white text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-all hover:scale-105 shadow-xl"
            >
              Start Searching
              <Search className="ml-2 w-5 h-5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-emerald-600 transition-all"
            >
              Get Support
              <Headphones className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;