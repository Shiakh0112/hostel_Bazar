import React, { useState } from 'react';
import Footer from '../components/common/Footer';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Headphones,
  Users,
  Building,
  ArrowRight,
  CheckCircle,
  Star,
  Heart
} from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    userType: 'student'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

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
              <MessageCircle className="w-4 h-4" />
              Get In Touch
            </div>

            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              We're Here <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600">
                To Help You
              </span>
            </h1>

            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Have questions about our services? Need help with your booking? 
              Our friendly team is ready to assist you 24/7.
            </p>
          </div>
        </div>
      </section>

      {/* --- CONTACT METHODS SECTION --- */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Multiple Ways to <span className="text-blue-600">Reach Us</span>
            </h2>
            <p className="text-lg text-slate-600">
              Choose the method that works best for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Phone className="w-7 h-7" />,
                title: "Call Us",
                desc: "Speak directly with our support team",
                contact: "+91 98765 43210",
                action: "Call Now",
                color: "blue"
              },
              {
                icon: <Mail className="w-7 h-7" />,
                title: "Email Us",
                desc: "Send us your queries anytime",
                contact: "support@hostelbazar.com",
                action: "Send Email",
                color: "emerald"
              },
              {
                icon: <MessageCircle className="w-7 h-7" />,
                title: "Live Chat",
                desc: "Get instant help through chat",
                contact: "Available 24/7",
                action: "Start Chat",
                color: "violet"
              },
              {
                icon: <MapPin className="w-7 h-7" />,
                title: "Visit Office",
                desc: "Meet us at our headquarters",
                contact: "Mumbai, Maharashtra",
                action: "Get Directions",
                color: "orange"
              }
            ].map((method, idx) => (
              <div key={idx} className="group p-8 bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 hover:border-blue-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-100/40 text-center">
                <div className={`w-16 h-16 bg-${method.color}-50 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-${method.color}-600 transition-colors duration-300 text-${method.color}-600 group-hover:text-white`}>
                  {method.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{method.title}</h3>
                <p className="text-slate-600 mb-4 text-sm">{method.desc}</p>
                <p className="font-semibold text-slate-800 mb-4">{method.contact}</p>
                <button className={`text-${method.color}-600 font-semibold text-sm hover:text-${method.color}-700 transition-colors`}>
                  {method.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CONTACT FORM SECTION --- */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Form */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 lg:p-12">
              <div className="mb-8">
                <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4">
                  Send us a message
                </h3>
                <p className="text-slate-600">
                  Fill out the form below and we'll get back to you within 24 hours.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* User Type Selection */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">
                    I am a
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, userType: 'student' })}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                        formData.userType === 'student'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Users className="w-5 h-5" />
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, userType: 'owner' })}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                        formData.userType === 'owner'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Building className="w-5 h-5" />
                      Hostel Owner
                    </button>
                  </div>
                </div>

                {/* Name and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full border border-slate-200 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white/80 backdrop-blur font-medium transition-all hover:bg-white/90"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border border-slate-200 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white/80 backdrop-blur font-medium transition-all hover:bg-white/90"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {/* Phone and Subject */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full border border-slate-200 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white/80 backdrop-blur font-medium transition-all hover:bg-white/90"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full border border-slate-200 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white/80 backdrop-blur font-medium transition-all hover:bg-white/90"
                    >
                      <option value="">Select a subject</option>
                      <option value="booking">Booking Inquiry</option>
                      <option value="payment">Payment Issue</option>
                      <option value="support">General Support</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white/80 backdrop-blur font-medium transition-all hover:bg-white/90 resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3.5 px-6 rounded-xl font-semibold text-sm hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  Send Message
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4">
                  Get in touch with us
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  We're here to help you find the perfect accommodation. 
                  Whether you're a student looking for a hostel or an owner wanting to list your property, 
                  we're just a message away.
                </p>
              </div>

              {/* Contact Details */}
              <div className="space-y-6">
                {[
                  {
                    icon: <MapPin className="w-5 h-5" />,
                    title: "Office Address",
                    details: ["123 Business District", "Mumbai, Maharashtra 400001", "India"]
                  },
                  {
                    icon: <Phone className="w-5 h-5" />,
                    title: "Phone Numbers",
                    details: ["+91 98765 43210", "+91 87654 32109", "Toll Free: 1800-123-4567"]
                  },
                  {
                    icon: <Mail className="w-5 h-5" />,
                    title: "Email Addresses",
                    details: ["support@hostelbazar.com", "partnerships@hostelbazar.com", "careers@hostelbazar.com"]
                  },
                  {
                    icon: <Clock className="w-5 h-5" />,
                    title: "Business Hours",
                    details: ["Monday - Friday: 9:00 AM - 8:00 PM", "Saturday: 10:00 AM - 6:00 PM", "Sunday: 10:00 AM - 4:00 PM"]
                  }
                ].map((contact, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                      {contact.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2">{contact.title}</h4>
                      {contact.details.map((detail, detailIdx) => (
                        <p key={detailIdx} className="text-slate-600 text-sm">{detail}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-blue-50 to-violet-50 rounded-2xl p-6 border border-blue-100">
                <h4 className="font-bold text-slate-900 mb-4">Why students trust us</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: <Star className="w-4 h-4" />, label: "4.8/5 Rating", value: "10K+ Reviews" },
                    { icon: <Users className="w-4 h-4" />, label: "Happy Students", value: "50K+" },
                    { icon: <Building className="w-4 h-4" />, label: "Verified Hostels", value: "500+" },
                    { icon: <Heart className="w-4 h-4" />, label: "Success Rate", value: "98%" }
                  ].map((stat, idx) => (
                    <div key={idx} className="text-center">
                      <div className="flex items-center justify-center text-blue-600 mb-1">
                        {stat.icon}
                      </div>
                      <div className="text-lg font-bold text-slate-900">{stat.value}</div>
                      <div className="text-xs text-slate-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Frequently Asked <span className="text-violet-600">Questions</span>
            </h2>
            <p className="text-lg text-slate-600">
              Quick answers to common questions
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "How do I book a hostel through HostelBazar?",
                answer: "Simply search for hostels in your preferred location, compare options, and book securely through our platform. You can pay online and your booking is confirmed instantly."
              },
              {
                question: "Is my payment secure?",
                answer: "Yes, absolutely. We use industry-standard encryption and secure payment gateways. Your money is held in escrow until you check-in and confirm your satisfaction."
              },
              {
                question: "What if I need to cancel my booking?",
                answer: "You can cancel your booking according to the hostel's cancellation policy. Most hostels offer free cancellation up to 24-48 hours before check-in."
              },
              {
                question: "How do you verify hostels?",
                answer: "Our team physically visits every hostel to verify safety standards, cleanliness, amenities, and overall quality before listing them on our platform."
              },
              {
                question: "Do you charge any booking fees?",
                answer: "No, we don't charge any booking fees to students. Our revenue comes from partnering with hostel owners, so students can book completely free of charge."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  {faq.question}
                </h4>
                <p className="text-slate-600 leading-relaxed pl-7">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-violet-700 text-center text-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Still have questions?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Our support team is available 24/7 to help you with any queries or concerns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all hover:scale-105 shadow-xl">
              <Headphones className="mr-2 w-5 h-5" />
              Live Chat Support
            </button>
            <button className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-blue-600 transition-all">
              <Phone className="mr-2 w-5 h-5" />
              Call Us Now
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;