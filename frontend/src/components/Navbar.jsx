import { Link } from "react-scroll";
import { Link as RouterLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        {/* Logo with Teddy Bear Style */}
        <div className="flex items-center gap-2 cursor-pointer">
          <span className="text-3xl">🧸</span>
          <span className="text-2xl font-bold text-blue-500 tracking-tight">
            Daycare
          </span>
        </div>

        {/* Links from your original screenshot */}
        <div className="hidden md:flex items-center gap-8 text-gray-600 font-medium">
          <Link
            to="hero"
            smooth={true}
            className="hover:text-blue-500 cursor-pointer"
          >
            Home
          </Link>
          <Link
            to="programs"
            smooth={true}
            className="hover:text-blue-500 cursor-pointer"
          >
            Programs
          </Link>
          <Link
            to="about"
            smooth={true}
            className="hover:text-blue-500 cursor-pointer"
          >
            About
          </Link>

          <Link
            to="inquiry"
            smooth={true}
            className="px-6 py-2 bg-pink-300 text-white font-bold rounded-full hover:bg-pink-400 transition-all cursor-pointer"
          >
            Enroll Now
          </Link>

          <RouterLink
            to="/admin/login"
            className="px-4 py-1.5 border border-gray-200 rounded-full text-xs text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-all"
          >
            Staff Portal
          </RouterLink>
        </div>
      </div>
    </nav>
  );
}
