import { Link } from "react-router";
import { Car, MapPin, Phone, Mail, Instagram, Twitter, Facebook, Youtube, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-darker border-t border-gold/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-glow">
                <Car className="w-5 h-5 text-dark font-bold" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white tracking-wider">DRIVE X</span>
                <span className="text-[10px] text-gold tracking-[0.2em] -mt-1">MARKET</span>
              </div>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed">
              Your digital destination for buying, renting, and managing premium vehicles with speed, clarity, and control.
            </p>
            <div className="flex items-center gap-3">
              {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold hover:bg-gold hover:text-dark transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-gold font-semibold mb-6 uppercase tracking-wider text-sm">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { name: "Home", path: "/" },
                { name: "Inventory", path: "/inventory" },
                { name: "About Us", path: "/about" },
                { name: "Contact", path: "/contact" },
                { name: "Dashboard", path: "/dashboard" },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-white/60 hover:text-gold transition-colors duration-300 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-gold font-semibold mb-6 uppercase tracking-wider text-sm">Services</h4>
            <ul className="space-y-3">
              {["Buy a Car", "Sell Your Car", "Car Financing", "Trade-In", "Vehicle Inspection", "Premium Warranty"].map((item) => (
                <li key={item}>
                  <span className="text-white/60 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-gold font-semibold mb-6 uppercase tracking-wider text-sm">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold mt-0.5 shrink-0" />
                <span className="text-white/60 text-sm">King Fahd Road, Riyadh 11321, Saudi Arabia</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gold shrink-0" />
                <span className="text-white/60 text-sm">+966 11 234 5678</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gold shrink-0" />
                <span className="text-white/60 text-sm">info@drivex.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gold/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © 2024 Drive X. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-white/40 text-sm hover:text-gold cursor-pointer transition-colors">Privacy Policy</span>
            <span className="text-white/40 text-sm hover:text-gold cursor-pointer transition-colors">Terms of Service</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={scrollToTop}
            className="border-gold/30 text-gold hover:bg-gold hover:text-dark"
          >
            <ArrowUp className="w-4 h-4 mr-2" />
            Back to Top
          </Button>
        </div>
      </div>
    </footer>
  );
}
