import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/common/Footer';
import {
  Users,
  Target,
  Award,
  Heart,
  Shield,
  Clock,
  MapPin,
  Star,
  CheckCircle,
  ArrowRight,
  Building,
  Zap,
  Globe
} from 'lucide-react';

const About = () => {
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold">
              <Heart className="w-4 h-4" />
              Our Story
            </div>

            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Revolutionizing <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600">
                Student Living
              </span>
            </h1>

            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              We're on a mission to make finding the perfect hostel as easy as ordering food online. 
              No more endless searching, no more broker hassles, just verified hostels at your fingertips.
            </p>
          </div>
        </div>
      </section>

      {/* --- OUR MISSION SECTION --- */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold">
                <Target className="w-4 h-4" />
                Our Mission
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                Making hostel hunting <span className="text-emerald-600">stress-free</span>
              </h2>
              
              <p className="text-lg text-slate-600 leading-relaxed">
                Every year, millions of students struggle to find safe, affordable accommodation. 
                We built HostelBazar to solve this problem by creating a transparent, reliable platform 
                that connects students with verified hostels across India.
              </p>
              
              <div className="space-y-4">
                {[
                  'Zero brokerage fees for students',
                  'Physical verification of every property',
                  '24/7 customer support',
                  'Secure payment protection'
                ].map((point, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-slate-700 font-medium">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl shadow-emerald-900/20 rotate-2 hover:rotate-0 transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                  alt="Team collaboration"
                  className="w-full h-[400px] object-cover"
                />
              </div>
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            </div>
          </div>
        </div>
      </section>

      {/* --- VALUES SECTION --- */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Our Core <span className="text-violet-600">Values</span>
            </h2>
            <p className="text-lg text-slate-600">
              These principles guide everything we do at HostelBazar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="w-7 h-7" />,
                title: "Trust & Safety",
                desc: "Every hostel is verified, every payment is secure, and every student is protected.",
                color: "blue"
              },
              {
                icon: <Heart className="w-7 h-7" />,
                title: "Student-First",
                desc: "We put students at the center of everything we do, from pricing to support.",
                color: "red"
              },
              {
                icon: <Zap className="w-7 h-7" />,
                title: "Innovation",
                desc: "We constantly innovate to make the hostel booking experience better and faster.",
                color: "yellow"
              },
              {
                icon: <Globe className="w-7 h-7" />,
                title: "Accessibility",
                desc: "Quality accommodation should be accessible to every student, everywhere.",
                color: "green"
              },
              {
                icon: <Clock className="w-7 h-7" />,
                title: "Reliability",
                desc: "When you book with us, you can count on us to deliver exactly what we promise.",
                color: "purple"
              },
              {
                icon: <Users className="w-7 h-7" />,
                title: "Community",
                desc: "We're building a community where students help students find their perfect home.",
                color: "indigo"
              }
            ].map((value, idx) => (
              <div
                key={idx}
                className="group p-8 bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 hover:border-violet-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-violet-100/40"
              >
                <div className={`w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-${value.color}-600 transition-colors duration-300 text-slate-600 group-hover:text-white`}>
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TEAM SECTION --- */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Meet Our <span className="text-blue-600">Team</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              A passionate group of individuals working to transform student accommodation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Priya Sharma",
                role: "Founder & CEO",
                image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                desc: "Former student who experienced the hostel hunting struggle firsthand."
              },
              {
                name: "Rahul Kumar",
                role: "CTO",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                desc: "Tech enthusiast building scalable solutions for student accommodation."
              },
              {
                name: "Anita Patel",
                role: "Head of Operations",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                desc: "Ensuring every hostel meets our quality and safety standards."
              }
            ].map((member, idx) => (
              <div key={idx} className="group text-center">
                <div className="relative mb-6 mx-auto w-48 h-48">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover rounded-3xl shadow-lg group-hover:shadow-xl transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent rounded-3xl"></div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">{member.name}</h3>
                <p className="text-blue-600 font-semibold mb-3">{member.role}</p>
                <p className="text-slate-600 text-sm leading-relaxed">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="py-24 relative overflow-hidden bg-slate-900">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(#4b5563 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        ></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Our <span className="text-blue-400">Impact</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Numbers that show how we're changing student accommodation
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 text-center">
            {[
              { count: "500+", label: "Verified Hostels", desc: "Across 50+ cities" },
              { count: "10K+", label: "Happy Students", desc: "Found their home" },
              { count: "₹2Cr+", label: "Brokerage Saved", desc: "For students" },
              { count: "4.8★", label: "Average Rating", desc: "From our users" },
            ].map((stat, idx) => (
              <div key={idx} className="group">
                <div className="text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-violet-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.count}
                </div>
                <div className="text-sm lg:text-base font-bold text-white mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-slate-400">
                  {stat.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-violet-700 text-center text-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Join the HostelBazar family
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Whether you're a student looking for accommodation or a hostel owner wanting to list your property, we're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/hostels"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all hover:scale-105 shadow-xl"
            >
              Find Hostels
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-blue-600 transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;