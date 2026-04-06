export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-8 py-6 bg-white sticky top-0 z-50 shadow-sm">
      <div className="text-2xl font-bold text-brand-blue flex items-center gap-2">
        <span className="text-3xl">🧸</span>
        <span className="tracking-tight">Ecera Stay & Care</span>
      </div>
      <div className="hidden md:flex gap-10 font-semibold text-gray-500">
        <a href="#" className="hover:text-brand-blue transition">
          Home
        </a>
        <a href="#programs" className="hover:text-brand-blue transition">
          Programs
        </a>
        <a href="#contact" className="hover:text-brand-blue transition">
          Contact
        </a>
      </div>
      <button className="bg-brand-pink text-white px-7 py-2.5 rounded-full font-bold hover:shadow-lg transition-all active:scale-95">
        Enroll Now
      </button>
    </nav>
  );
}
