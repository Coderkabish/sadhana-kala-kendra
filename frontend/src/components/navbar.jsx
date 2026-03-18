import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/1626688345_logo.png";
// === Icons ===
const Menu = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="12" y2="12"/>
    <line x1="4" x2="20" y1="6" y2="6"/>
    <line x1="4" x2="20" y1="18" y2="18"/>
  </svg>
);

const X = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/>
    <path d="m6 6 12 12"/>
  </svg>
);

// === Navigation Items ===
const navItems = [
  { name: "Home", to: "/" },
  { name: "About Us", to: "/about" },
  { name: "Courses", to: "/courses" },
  { name: "Activities", to: "/activities" },
  { name: "Events", to: "/events" },
  { name: "Offers", to: "/offers" },
  { name: "Gallery", to: "/gallery" },
  
];

// === Main Navbar ===
export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const Logo = () => (
  <Link to="/">
    <img
      src={logo}
      alt="Sadhana Kala Kendra Logo"
      className="h-12 w-auto object-contain"
    />
  </Link>
);
useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-blue-950 shadow-lg shadow-gray-100/50 font-[Inter]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="shrink-0"><Logo /></div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex lg:space-x-1 items-center">
{navItems.map((item) => (
  <Link
    key={item.name}
    to={item.to}
    className="relative group text-white text-xl hover:text-yellow-400 transition duration-200 font-medium px-6 py-2"
  >
    {item.name}
    <span className="absolute -bottom-1 left-1/4 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-1/2"></span>
  </Link>
))}
            {/* Contact Us Button */}
            <Link
              to="/register"
              className="ml-4 bg-red-600 text-white font-semibold py-2 px-6 rounded-full shadow-md hover:bg-red-700 transition duration-300 transform hover:scale-105 active:scale-95"
            >
              Register
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white hover:text-red-600 transition duration-200 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${isMobileMenuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"} bg-white border-t border-gray-100`}>
        <div className="pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.to}
              className="block px-4 py-3 text-base font-medium text-blue-950 hover:bg-red-50 hover:text-red-600 transition duration-150"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}

          {/* Mobile Contact Us Button */}
          <div className="mt-3 px-4">
            <Link
              to="/register"
              className="block bg-red-600 text-white text-xl font-semibold text-center py-2 rounded-full shadow-md hover:bg-red-700 transition duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
               Register
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};