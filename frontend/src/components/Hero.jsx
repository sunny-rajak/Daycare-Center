export default function Hero() {
  return (
    <section className="bg-orange-50/40 min-h-[85vh] flex items-center px-8 lg:px-24 py-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Left Side: Content */}
        <div>
          <span className="text-brand-blue font-bold tracking-widest uppercase text-sm">
            Welcome to Ecera Stay & Care LLC
          </span>
          <h1 className="text-6xl md:text-7xl font-black text-gray-800 mt-4 leading-[1.1]">
            Where Every Child <span className="text-brand-yellow">Shines</span>{" "}
            Bright.
          </h1>
          <p className="text-gray-600 mt-8 text-xl leading-relaxed max-w-lg">
            Providing a nurturing, safe, and fun environment for children to
            learn and grow through play-based curriculum in Farmington Hills.
          </p>
          <div className="mt-12 flex flex-wrap gap-5">
            <button className="bg-brand-blue text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-sky-500 transition-all">
              Book a Tour
            </button>
            <button className="border-2 border-brand-blue text-brand-blue px-10 py-4 rounded-full font-bold text-lg hover:bg-brand-blue/5 transition-all flex items-center gap-2 active:scale-95">
              <span>View Gallery</span>
              <span className="text-xl">📸</span>
            </button>
          </div>
        </div>

        {/* Right Side: Rotated Image Component */}
        <div className="relative">
          {/* Main Image Card */}
          <div className="w-full aspect-square bg-brand-blue rounded-[3rem] overflow-hidden shadow-2xl rotate-3 transition-transform hover:rotate-0 duration-500">
            <img
              src="https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=800"
              alt="Happy children at Ecera Stay and Care"
              className="w-full h-full object-cover -rotate-3 scale-110 group-hover:rotate-0 transition-all"
            />
          </div>

          {/* Floating Decorative Elements */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-brand-yellow rounded-full -z-10 animate-pulse"></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-brand-pink/20 rounded-full -z-10 blur-xl"></div>
        </div>
      </div>
    </section>
  );
}
