import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchHostels } from "../app/slices/hostelSlice";
import Footer from "../components/common/Footer";
import HostelCard from "../components/hostel/HostelCard";
import Loader from "../components/common/Loader";

// Icons
import {
  ShieldCheck,
  Lock,
  Headphones,
  MapPin,
  Star,
  Users,
  ArrowRight,
  CheckCircle,
  Search,
} from "lucide-react";

const Home = () => {
  const dispatch = useDispatch();
  const { hostels = [], isLoading = false } = useSelector(
    (state) => state.hostel || {},
  );

  useEffect(() => {
    dispatch(fetchHostels({ limit: 6 }));
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* --- HERO SECTION (Super Cool Gradient & Layout) --- */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48 overflow-hidden">
        {/* Decorative Background Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
          <div className="absolute top-0 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 right-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                India's #1 Hostel Booking Platform
              </div>

              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                Find Your Perfect <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600">
                  Student Home
                </span>
              </h1>

              <p className="text-xl text-slate-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Discover comfortable, affordable, and verified hostels across
                India. No brokerage, just happy living.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/hostels"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-all hover:scale-105 shadow-xl shadow-slate-900/20 group"
                >
                  Explore Hostels
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  How it works
                </Link>
              </div>

              {/* Social Proof (Mini) */}
              <div className="pt-8 border-t border-slate-200/60 flex items-center justify-center lg:justify-start gap-6 text-sm font-medium text-slate-500">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span>4.8/5 Rating</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>10k+ Students</span>
                </div>
              </div>
            </div>

            {/* Hero Image / Graphic */}
            <div className="relative hidden lg:block">
              {/* Main Card Effect */}
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/20 rotate-2 hover:rotate-0 transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                  alt="Happy Students"
                  className="w-full h-[500px] object-cover"
                />
                {/* Floating Card Overlay */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        Booking Confirmed!
                      </div>
                      <div className="text-xs text-slate-500">
                        Sunrise Residency, Delhi
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    Just now
                  </span>
                </div>
              </div>
              {/* Decorative Elements behind image */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION (Hover Lifts) --- */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Why students love <span className="text-blue-600">HostelBazar</span>
              ?
            </h2>
            <p className="text-lg text-slate-600">
              We cut the noise and focus on what actually matters: Safety,
              Comfort, and Affordability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <ShieldCheck className="w-7 h-7" />,
                title: "100% Verified Hostels",
                desc: "Every hostel is physically verified by our team for quality and safety standards.",
              },
              {
                icon: <Lock className="w-7 h-7" />,
                title: "Secure Payments",
                desc: "Your money is safe. We hold payments until you check in and confirm the room.",
              },
              {
                icon: <Headphones className="w-7 h-7" />,
                title: "24/7 Support",
                desc: "Stuck somewhere? Our support team is available round the clock to help you out.",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group p-8 bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 hover:border-blue-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-100/40"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300 text-slate-600 group-hover:text-white">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURED HOSTELS SECTION --- */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                Featured Hostels
              </h2>
              <p className="text-lg text-slate-600">
                Hand-picked options for your next semester.
              </p>
            </div>
            <Link
              to="/hostels"
              className="hidden md:inline-flex items-center px-6 py-3 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all group"
            >
              View All Listings
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {isLoading ? (
            <Loader />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hostels.slice(0, 6).map((hostel) => (
                <HostelCard key={hostel._id} hostel={hostel} />
              ))}
            </div>
          )}

          <div className="mt-12 text-center md:hidden">
            <Link
              to="/hostels"
              className="inline-flex items-center px-6 py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors"
            >
              View All Hostels
            </Link>
          </div>
        </div>
      </section>

      {/* --- STATS SECTION (Dark Premium Look) --- */}
      <section className="py-24 relative overflow-hidden bg-slate-900">
        {/* Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(#4b5563 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        ></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 text-center">
            {[
              { count: "500+", label: "Verified Hostels" },
              { count: "10K+", label: "Happy Students" },
              { count: "50+", label: "Cities Covered" },
              { count: "4.8", label: "Average Rating" },
            ].map((stat, idx) => (
              <div key={idx} className="group">
                <div className="text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-violet-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.count}
                </div>
                <div className="text-sm lg:text-base font-medium text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CALL TO ACTION (Bottom) --- */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-violet-700 text-center text-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Ready to find your new home?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of students who have found their perfect stay with
            HostelBazar.
          </p>
          <Link
            to="/hostels"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all hover:scale-105 shadow-xl"
          >
            Start Searching Now
            <Search className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
