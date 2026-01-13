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
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600')" }}
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

      {/* Important Notice */}
      <section className="bg-accent/10 border-y border-accent/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-slate-primary font-medium">
            <span className="text-accent">📌 Important:</span> Check-out is 24 hours from the check-in time. 
            Charges are applicable beyond 24 hours.
          </p>
        </div>
      </section>

      {/* Stats Section */}
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
                  src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800" 
                  alt="Visitors Hostel Room"
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
              <div key={index} className="card text-center hover:scale-105 transition-transform">
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
              <div key={index} className="card">
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${
                  room.category === 'AC' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
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
