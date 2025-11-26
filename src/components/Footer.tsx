import { Link } from "react-router-dom";
import { Sprout, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-soil text-background border-t-4 border-secondary">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <Sprout className="h-8 w-8 text-secondary transition-transform group-hover:scale-110" />
              <div>
                <h3 className="text-xl font-heading font-bold">CES Consult</h3>
                <p className="text-xs text-background/70 font-body">Agriculture Investment</p>
              </div>
            </Link>
            <p className="text-background/80 font-body text-sm leading-relaxed">
              Transforming agriculture investment through innovation, sustainability, and client-centered service.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold mb-4 text-secondary">Quick Links</h4>
            <ul className="space-y-2 font-body">
              <li>
                <Link to="/" className="text-background/80 hover:text-secondary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-background/80 hover:text-secondary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/testimonials" className="text-background/80 hover:text-secondary transition-colors">
                  Testimonials
                </Link>
              </li>
              <li>
                <Link to="/invest" className="text-background/80 hover:text-secondary transition-colors">
                  Start Investing
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-heading font-semibold mb-4 text-secondary">Legal</h4>
            <ul className="space-y-2 font-body">
              <li>
                <Link to="/faq" className="text-background/80 hover:text-secondary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-background/80 hover:text-secondary transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-background/80 hover:text-secondary transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold mb-4 text-secondary">Contact Us</h4>
            <ul className="space-y-3 font-body text-sm">
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                <a href="mailto:ces@gmail.com" className="text-background/80 hover:text-secondary transition-colors">
                  ces@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                <div className="text-background/80">
                  <a href="tel:0596083868" className="hover:text-secondary transition-colors block">
                    0596083868
                  </a>
                  <a href="tel:0245590858" className="hover:text-secondary transition-colors block">
                    0245590858
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                <span className="text-background/80">
                  Accra, Ghana
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 mt-8 pt-8 text-center">
          <p className="text-background/70 font-body text-sm">
            © {new Date().getFullYear()} CES Consult. All rights reserved. Investment involves risk.
          </p>
        </div>
      </div>
    </footer>
  );
};
