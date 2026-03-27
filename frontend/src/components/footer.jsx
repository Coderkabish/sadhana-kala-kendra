import React from "react";
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import logo from "../assets/1626688345_logo.png";
import unescoLogo from "../assets/unesco-logo.png"; // Added UNESCO logo import

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Define consistent utility classes for links and icons
  const footerLinkClass = "text-gray-400 hover:text-amber-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-sm";
  const socialIconWrapperClass = "p-2.5 rounded-full bg-gray-700 hover:bg-amber-400 transition-all duration-300 ease-in-out group focus:outline-none focus:ring-2 focus:ring-amber-500";
  const socialIconClass = "w-5 h-5 text-gray-300 group-hover:text-gray-900";

  // Utility class for the title separator line
  const titleSeparatorClass = "w-10 h-1 bg-amber-500 mb-6"; 

  return (
    <footer className="bg-gray-950 text-gray-200 font-sans tracking-wide border-t border-gray-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 xl:gap-16">

        {/* 1. Brand & Description */}
        <div className="lg:col-span-2 flex flex-col items-start text-left">
          <div className="flex items-center mb-6">
            <img
              src={logo}
              alt="Sadhana Kala Kendra Logo"
              className="w-56 h-auto object-contain filter drop-shadow-lg"
            />
            <img
              src={unescoLogo}
              alt="UNESCO Logo"
              className="w-24 h-auto ml-4 object-contain filter drop-shadow-lg"
            />
          </div>
          
          <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-md">
            Sadhana Kala Kendra is dedicated to nurturing artistic talent through comprehensive, accredited programs in music and performing arts. Inspire, learn, and achieve excellence.
          </p>
          
          {/* Social Media Links */}
          <div className="flex gap-3 mt-2">
            <a href="https://www.facebook.com/sadhanakalakendranepal" aria-label="Connect on Facebook" target="_blank" rel="noopener noreferrer" className={socialIconWrapperClass}>
              <Facebook className={socialIconClass} />
            </a>
            <a href="https://www.instagram.com/sadhanakalakendranp/" aria-label="Follow on Instagram" target="_blank" rel="noopener noreferrer" className={socialIconWrapperClass}>
              <Instagram className={socialIconClass} />
            </a>
            <a href="https://www.youtube.com/@sadhanakalakendra4620" aria-label="Watch on YouTube" target="_blank" rel="noopener noreferrer" className={socialIconWrapperClass}>
              <Youtube className={socialIconClass} />
            </a>
          </div>
        </div>

        {/* 2. Quick Links */}
        <div className="md:col-span-1">
          <h3 className="text-lg uppercase font-bold text-white mb-4 tracking-wider">Navigation</h3>
          <div className={titleSeparatorClass}></div>
          <ul className="space-y-3">
            <li><a href="/" className={footerLinkClass}>Home</a></li>
            <li><a href="/about" className={footerLinkClass}>About Us</a></li>
            <li><a href="/courses" className={footerLinkClass}>Our Courses</a></li>
            <li><a href="/activities" className={footerLinkClass}>Activities</a></li>
            <li><a href="/artists" className={footerLinkClass}>Artists</a></li>
            <li><a href="/teachers" className={footerLinkClass}>Teachers</a></li>
            <li><a href="/offers" className={footerLinkClass}>Offers</a></li>
            <li><a href="/gallery" className={footerLinkClass}>Gallery</a></li>
            <li><a href="/events" className={footerLinkClass}>News & Events</a></li>
          </ul>
        </div>

        {/* 3. Contact Information */}
        <div className="md:col-span-1">
          <h3 className="text-lg uppercase font-bold text-white mb-4 tracking-wider">Contact Details</h3>
          <div className={titleSeparatorClass}></div>
          <address className="not-italic space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <p className={footerLinkClass}>01-4540228, 9851023576</p>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <p className={footerLinkClass}>sadhananepal25@gmail.com</p>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-1" />
              <p className="text-gray-400">Near Ghantaghar, Kamaladi, Kathmandu, Nepal</p>
            </div>
          </address>
        </div>

        {/* 4. Admissions Call to Action */}
        <div className="md:col-span-2 lg:col-span-1 flex flex-col items-start justify-start pt-6 lg:pt-0">
          <h3 className="text-lg uppercase font-bold text-white mb-4 tracking-wider">Join Us</h3>
          <div className={titleSeparatorClass}></div>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Unlock your potential today. Discover our diverse programs and start your artistic journey now.
          </p>
          <a
            href="/register"
            className="flex items-center justify-center gap-2 bg-amber-500 text-gray-900 font-bold py-2.5 px-6 rounded-lg shadow-lg hover:bg-amber-400 transition duration-300 transform hover:scale-[1.02] active:scale-95 text-sm uppercase tracking-wide"
          >
            Apply Now <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Bottom Footer Section: Copyright and Credits */}
      <div className="border-t border-gray-800 bg-gray-900 text-center py-5 text-xs">
        <p className="text-gray-500">
          &copy; {currentYear} <span className="font-bold text-amber-400">Sadhana Kala Kendra</span>. All Rights Reserved.
          <br className="md:hidden my-2" />
        </p>
      </div>
    </footer>
  );
};