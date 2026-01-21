import { Link } from 'react-router-dom';
import { HiPhone, HiMail, HiLocationMarker } from 'react-icons/hi';

const Footer = () => {
  return (
    <footer className="bg-slate-primary text-white/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold text-lg">VH</span>
              </div>
              <h3 className="font-poppins font-semibold text-lg text-white">
                IIITDMJ Visitors' Hostel
              </h3>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Welcome to the official Visitors' Hostel of Indian Institute of Information Technology, 
              Design and Manufacturing, Jabalpur. We provide comfortable accommodation for guests, 
              visitors, and officials visiting the institute.
            </p>
            <div className="flex items-center space-x-2 text-accent">
              <HiLocationMarker className="w-5 h-5" />
              <span className="text-sm">
                Dumna Airport Road, Jabalpur, MP - 482005
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-poppins font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/rooms" className="hover:text-white transition-colors">Rooms & Tariff</Link>
              </li>
              <li>
                <Link to="/book" className="hover:text-white transition-colors">Book Now</Link>
              </li>
              <li>
                <a href="https://www.iiitdmj.ac.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  IIITDMJ Website
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-poppins font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <HiPhone className="w-4 h-4 text-accent" />
                <span>+91-761-2794XXX</span>
              </li>
              <li className="flex items-center space-x-2">
                <HiMail className="w-4 h-4 text-accent" />
                <span>vh@iiitdmj.ac.in</span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-white/10 my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center text-sm">
          <p>© {new Date().getFullYear()} IIITDMJ Visitors' Hostel. All rights reserved.</p>
          <p className="mt-2 md:mt-0 text-white/60 text-xs">
            Developed with ❤️ by{' '}
            <a 
              href="https://www.linkedin.com/in/kunal8859/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-accent hover:text-white font-medium transition-colors"
            >
              KUNAL
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
