import { Link } from "react-scroll";

export default function Hero() {
  return (
    <section id="hero" className="pt-32 pb-20 bg-[#fdfaf1]">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <h1 className="text-6xl md:text-7xl font-extrabold text-[#1a2e44] leading-tight">
            Where Every <br />
            <span className="text-[#38bdf8]">Child Shines.</span>
          </h1>

          <p className="text-lg text-gray-500 max-w-md leading-relaxed">
            Safe, nurturing, and fun-filled daycare services for your little
            ones. We focus on growth, creativity, and early learning.
          </p>

          <div className="flex gap-4">
            <Link
              to="inquiry"
              smooth={true}
              className="px-8 py-4 bg-[#38bdf8] text-white font-bold rounded-full shadow-lg shadow-blue-100 hover:brightness-105 transition-all cursor-pointer"
            >
              Book a Tour
            </Link>
            <button className="px-8 py-4 bg-white text-gray-600 font-bold rounded-full border-2 border-amber-100 hover:bg-amber-50 transition-all">
              View Gallery
            </button>
          </div>
        </div>

        <div className="relative">
          {/* Recreating the rounded image look from your screenshot */}
          <div className="aspect-square bg-white p-4 rounded-[3rem] shadow-xl rotate-3">
            <div className="w-full h-full rounded-[2.5rem] bg-gray-100 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=1000"
                alt="Children playing"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
