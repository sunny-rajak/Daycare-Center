import { Link } from "react-scroll";
import { Baby, Shapes, BookOpen } from "lucide-react";

export default function Programs() {
  const programs = [
    {
      name: "Infant",
      age: "3m - 15m",
      color: "bg-[#e6f2f2] text-[#4D9699]",
      desc: "A cozy space for sensory play and stable routines.",
      icon: <Baby size={28} />,
    },
    {
      name: "Toddler",
      age: "16m - 33m",
      color: "bg-[#fff3ed] text-[#FFB38E]",
      desc: "Focusing on language, social skills, and motor exploration.",
      icon: <Shapes size={28} />,
    },
    {
      name: "Preschool",
      age: "33m - 5y",
      color: "bg-[#edf4ee] text-[#8FB996]",
      desc: "Preparing little stars for kindergarten with fun learning.",
      icon: <BookOpen size={28} />,
    },
  ];

  return (
    <section
      id="programs"
      className="py-12 md:py-20 bg-[#fdfaf1] rounded-[4rem] mx-4 shadow-inner px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a2e44] mb-4 tracking-tight">
            Our Programs
          </h2>
          <div className="w-20 h-1.5 bg-[#38bdf8] mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {programs.map((p) => (
            <div
              key={p.name}
              className="bg-white p-5 md:p-8 rounded-3xl shadow-lg shadow-gray-200/50 hover:-translate-y-2 transition-all text-center"
            >
              <div
                className={`w-14 h-14 mx-auto ${p.color} rounded-2xl flex items-center justify-center mb-2 md:mb-4`}
              >
                {p.icon}
              </div>
              <h3 className="text-3xl font-extrabold text-[#1a2e44] mb-2">
                {p.name}
              </h3>
              <p className="text-sm font-bold uppercase tracking-widest text-[#38bdf8] mb-2 md:mb-5">
                {p.age}
              </p>
              <p className="text-gray-500 font-medium text-sm md:text-base leading-snug md:leading-relaxed mb-4 md:mb-6">
                {p.desc}
              </p>
              <Link
                to="inquiry"
                smooth={true}
                className="inline-block px-6 py-2 md:py-3 bg-[#4D9699] hover:bg-opacity-90 text-white font-bold rounded-full cursor-pointer transition-all"
              >
                Select Program
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
