import { useState } from "react";
import { Link } from "react-scroll";
import { Link as RouterLink } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm relative">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        {/* Logo with Teddy Bear Style */}
        <div className="flex items-center gap-3 cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-12 h-12 text-[#FFB38E] fill-current"
          >
            <circle cx="6.5" cy="7.5" r="4" />
            <circle cx="17.5" cy="7.5" r="4" />
            <circle cx="12" cy="14" r="8" />
            <circle cx="9" cy="12.5" r="1.5" fill="white" />
            <circle cx="15" cy="12.5" r="1.5" fill="white" />
            <ellipse cx="12" cy="17" rx="3.5" ry="2.5" fill="white" />
            <circle cx="12" cy="16" r="1" fill="currentColor" />
          </svg>
          <span className="text-2xl font-bold text-[#2D3436] tracking-tight">
            Sprout & Spark
          </span>
        </div>

        {/* Links & CTA Group */}
        <div className="hidden lg:flex items-center gap-8 text-[#2D3436] font-medium">
          <div className="flex items-center gap-8">
            <Link
              to="hero"
              smooth={true}
              className="hover:text-[#4D9699] transition-colors cursor-pointer"
            >
              Home
            </Link>
            <Link
              to="about"
              smooth={true}
              className="hover:text-[#4D9699] transition-colors cursor-pointer"
            >
              About
            </Link>
            <Link
              to="programs"
              smooth={true}
              className="hover:text-[#4D9699] transition-colors cursor-pointer"
            >
              Programs
            </Link>
          </div>

          {/* Button Group */}
          <div className="flex items-center gap-4 ml-4">
            <RouterLink
              to="/login"
              className="px-6 py-2 border-2 border-[#4D9699] text-[#4D9699] font-bold rounded-full hover:bg-[#4D9699] hover:text-white transition-all whitespace-nowrap"
            >
              Sign In
            </RouterLink>

            <Link
              to="inquiry"
              smooth={true}
              className="px-6 py-2 bg-[#FFB38E] text-white font-bold rounded-full hover:bg-[#ff9c6b] shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              Enroll Now
            </Link>
          </div>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          className="lg:hidden p-2 text-gray-600 hover:text-[#4D9699] transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-lg flex flex-col p-4 gap-4 lg:hidden z-50 border-t border-gray-100">
          <Link
            to="hero"
            smooth={true}
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-lg font-medium text-gray-700 py-2 border-b border-gray-100 cursor-pointer hover:text-[#4D9699]"
          >
            Home
          </Link>
          <Link
            to="about"
            smooth={true}
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-lg font-medium text-gray-700 py-2 border-b border-gray-100 cursor-pointer hover:text-[#4D9699]"
          >
            About
          </Link>
          <Link
            to="programs"
            smooth={true}
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-lg font-medium text-gray-700 py-2 border-b border-gray-100 cursor-pointer hover:text-[#4D9699]"
          >
            Programs
          </Link>

          <RouterLink
            to="/login"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full text-center py-3 rounded-xl border-2 border-[#4D9699] text-[#4D9699] font-bold hover:bg-[#4D9699] hover:text-white transition-all"
          >
            Sign In
          </RouterLink>

          <Link
            to="inquiry"
            smooth={true}
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full text-center py-3 rounded-xl bg-[#FFB38E] text-white font-bold shadow-sm hover:bg-[#ff9c6b] transition-all cursor-pointer"
          >
            Enroll Now
          </Link>
        </div>
      )}
    </nav>
  );
}
