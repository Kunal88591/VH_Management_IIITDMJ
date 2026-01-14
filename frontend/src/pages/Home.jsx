import { Link } from 'react-router-dom';
import { HiUsers, HiStar, HiCurrencyRupee, HiCheckCircle } from 'react-icons/hi';

const Home = () => {
  const facilities = [
    { icon: '🛏️', title: 'Comfortable Rooms', description: 'Well-furnished AC and Non-AC rooms' },
    { icon: '🍽️', title: 'Food Service', description: 'In-house dining with quality meals' },
    { icon: '📶', title: 'Free WiFi', description: 'High-speed internet connectivity' },
    { icon: '🅿️', title: 'Parking', description: 'Secure parking facilities' },
    { icon: '🔒', title: '24/7 Security', description: 'Round-the-clock security service' },
    { icon: '🧹', title: 'Housekeeping', description: 'Daily cleaning services' },
  ];

  const roomTypes = [
    { type: 'Single Room', price: '₹1,000', category: 'Non-AC', features: ['1 Guest', 'WiFi', 'TV'] },
    { type: 'Single Room', price: '₹1,500', category: 'AC', features: ['1 Guest', 'WiFi', 'TV', 'AC'] },
    { type: 'Double Room', price: '₹1,800', category: 'Non-AC', features: ['2 Guests', 'WiFi', 'TV'] },
    { type: 'Double Room', price: '₹2,500', category: 'AC', features: ['2 Guests', 'WiFi', 'TV', 'AC', 'Mini Fridge'] },
  ];

  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] bg-gradient-hero flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url('/images/hero.jpg')" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-poppins text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Welcome to IIITDMJ
            <span className="block text-accent">Visitors' Hostel</span>
          </h1>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Experience comfortable accommodation at the official guest house of 
            Indian Institute of Information Technology, Design and Manufacturing, Jabalpur
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/book" className="btn-accent text-lg px-8 py-3">
              Book Your Stay
            </Link>
            <Link to="/rooms" className="btn-secondary bg-white/10 border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-3">
              View Rooms
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section *}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: HiUsers, value: '10+', label: 'Rooms Available' },
              { icon: HiStar, value: '4.5', label: 'Guest Rating' },
              { icon: HiCurrencyRupee, value: '1000', label: 'Starting Price' },
              { icon: HiCheckCircle, value: '100%', label: 'Satisfaction' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="w-8 h-8 mx-auto text-secondary mb-2" />
                <p className="font-poppins text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-gray-600 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-poppins text-3xl md:text-4xl font-bold text-slate-primary mb-6">
                About Our <span className="text-secondary">Visitors' Hostel</span>
              </h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                The Visitors' Hostel at IIITDMJ provides comfortable and affordable accommodation 
                for guests, visitors, and officials visiting the institute. Located within the 
                serene campus, our guest house offers a peaceful environment with modern amenities.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Whether you're here for academic conferences, recruitment drives, official meetings, 
                or visiting family members, we ensure a pleasant stay with our dedicated staff and 
                quality services.
              </p>
              <ul className="space-y-2">
                {['Online Booking System', 'Transparent Pricing', 'Quality Food Service', 'Secure & Clean Environment'].map((item, i) => (
                  <li key={i} className="flex items-center text-gray-700">
                    <HiCheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="card p-0 overflow-hidden">
                <img 
                  src="/images/room.jpg" 
                  alt="Visitors Hostel Room"
                  loading="lazy"
                  className="w-full h-80 object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-gradient-primary text-white p-4 rounded-lg shadow-lg">
                <p className="font-poppins font-semibold">Since 2012</p>
                <p className="text-sm text-white/80">Serving Guests</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-poppins text-3xl md:text-4xl font-bold text-slate-primary mb-4">
              Our Facilities
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide all essential amenities to ensure a comfortable and memorable stay
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {facilities.map((facility, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-sm hover:shadow-lg p-6 text-center hover:scale-105 transition-all duration-300 border border-blue-100">
                <div className="text-4xl mb-3">{facility.icon}</div>
                <h3 className="font-poppins font-semibold text-slate-primary mb-2">{facility.title}</h3>
                <p className="text-gray-600 text-sm">{facility.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Room Types Preview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-poppins text-3xl md:text-4xl font-bold text-slate-primary mb-4">
              Room Types & Pricing
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose from our range of comfortable rooms to suit your needs
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roomTypes.map((room, index) => (
              <div key={index} className="bg-gradient-to-br from-white via-white to-primary/5 rounded-xl shadow-sm hover:shadow-xl p-6 transition-all duration-300 border border-gray-100 hover:border-primary/30">
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${
                  room.category === 'AC' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white'
                }`}>
                  {room.category}
                </div>
                <h3 className="font-poppins font-semibold text-slate-primary mb-2">{room.type}</h3>
                <p className="text-2xl font-bold text-secondary mb-3">
                  {room.price}<span className="text-sm font-normal text-gray-500">/night</span>
                </p>
                <ul className="space-y-1 mb-4">
                  {room.features.map((feature, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-center">
                      <HiCheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/rooms" className="btn-primary">
              View All Rooms
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery Preview Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-poppins text-3xl md:text-4xl font-bold text-slate-primary mb-4">
              Photo Gallery
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Take a visual tour of our facilities and rooms
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { src: '/images/gallery/photo-1.jpg', alt: 'Photo 1', fallback: '/images/room.jpg' },
              { src: '/images/gallery/photo-2.jpg', alt: 'Photo 2', fallback: '/images/hero.jpg' },
              { src: '/images/gallery/photo-3.jpg', alt: 'Photo 3', fallback: '/images/room.jpg' },
              { src: '/images/gallery/photo-4.jpg', alt: 'Photo 4', fallback: '/images/hero.jpg' },
            ].map((image, index) => (
              <div key={index} className="relative aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow group">
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => e.target.src = image.fallback}
                />
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link to="/gallery" className="btn-primary">
              View Full Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* Contact & Information Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-poppins text-3xl md:text-4xl font-bold text-slate-primary mb-4">
              Contact Information
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get in touch with our team for bookings and inquiries
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Faculty In-Charge */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 text-center border border-blue-100">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <HiUsers className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-poppins font-semibold text-slate-primary mb-2">Faculty In-Charge (FIC)</h3>
              <p className="font-medium text-gray-800 mb-2">Dr. Yashpal Singh Katharria</p>
              <p className="text-sm text-gray-600 mb-1">
                <a href="mailto:yashpalk@iiitdmj.ac.in" className="text-secondary hover:underline">
                  yashpalk@iiitdmj.ac.in
                </a>
              </p>
              <p className="text-sm text-gray-600">📞 0761-2794354</p>
            </div>

            {/* Officer In-Charge */}
            <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 text-center border border-orange-100">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <HiUsers className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-poppins font-semibold text-slate-primary mb-2">Officer-In-Charge (VH)</h3>
              <p className="font-medium text-gray-800 mb-2">Mr. Shailesh Sharma</p>
              <p className="text-sm text-gray-600">
                <a href="mailto:shailesh@iiitdmj.ac.in" className="text-secondary hover:underline">
                  shailesh@iiitdmj.ac.in
                </a>
              </p>
            </div>

            {/* Caretaker */}
            <div className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 text-center border border-green-100">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <HiUsers className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-poppins font-semibold text-slate-primary mb-2">Caretaker Visitor's Hostel</h3>
              <p className="font-medium text-gray-800 mb-2">Mr. Vivek Upadhyay</p>
              <p className="text-sm text-gray-600">
                <a href="mailto:vh@iiitdmj.ac.in" className="text-secondary hover:underline">
                  vh@iiitdmj.ac.in
                </a>
              </p>
            </div>
          </div>

          {/* Forms Section */}
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-8">
            <h3 className="font-poppins text-2xl font-bold text-slate-primary mb-6 text-center">
              Requisition Forms
            </h3>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-lg text-slate-primary mb-2">📄 VH Requisition Form</h4>
                <p className="text-sm text-gray-600 mb-3">Download and fill this form for booking accommodation</p>
                <a 
                  href="https://www.iiitdmj.ac.in/downloads/forms/VH-Requisition-Form-New.pdf" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary font-medium hover:underline inline-flex items-center"
                >
                  Download Form →
                </a>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-lg text-slate-primary mb-2">🍽️ VH Food Requisition Form</h4>
                <p className="text-sm text-gray-600 mb-3">Download and fill this form for food requirements</p>
                <a 
                  href="https://www.iiitdmj.ac.in/downloads/forms/VH-Requisition-Form-New.pdf" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary font-medium hover:underline inline-flex items-center"
                >
                  Download Form →
                </a>
              </div>
            </div>

            {/* Important Note */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <HiCheckCircle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-semibold text-yellow-800 mb-2">Important Note:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• For booking, kindly send the filled requisition form to <a href="mailto:vh@iiitdmj.ac.in" className="font-medium underline">vh@iiitdmj.ac.in</a></li>
                    <li>• The booking would be confirmed only after approval of Dr. Yashpal Singh Katharria, FIC (VH) or the Institute Competent authority</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-poppins text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Book Your Stay?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Experience comfortable accommodation with our easy online booking system
          </p>
          <Link to="/book" className="btn-accent text-lg px-8 py-3 inline-block">
            Book Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
