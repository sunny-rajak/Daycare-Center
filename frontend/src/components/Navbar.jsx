import { Link } from "react-scroll";
import { Link as RouterLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
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
        <div className="hidden md:flex items-center gap-8 text-[#2D3436] font-medium">
          <div className="flex items-center gap-8">
            <Link
              to="hero"
              smooth={true}
              className="hover:text-[#4D9699] transition-colors cursor-pointer"
            >
              Home
            </Link>
            <Link
              to="programs"
              smooth={true}
              className="hover:text-[#4D9699] transition-colors cursor-pointer"
            >
              Programs
            </Link>
            <Link
              to="about"
              smooth={true}
              className="hover:text-[#4D9699] transition-colors cursor-pointer"
            >
              About
            </Link>
          </div>

          {/* Button Group */}
          <div className="flex items-center gap-4 ml-4">
            <RouterLink
              to="/login"
              className="px-6 py-2 border-2 border-[#4D9699] text-[#4D9699] font-bold rounded-full hover:bg-[#4D9699] hover:text-white transition-all"
            >
              Sign In
            </RouterLink>

            <Link
              to="inquiry"
              smooth={true}
              className="px-6 py-2 bg-[#FFB38E] text-white font-bold rounded-full hover:bg-[#ff9c6b] shadow-sm transition-all cursor-pointer"
            >
              Enroll Now
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
