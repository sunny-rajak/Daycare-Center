import { Link } from "react-scroll";

export default function Programs() {
  const programs = [
    {
      name: "Infant",
      age: "3m - 15m",
      color: "bg-blue-100 text-blue-500",
      desc: "A cozy space for sensory play and stable routines.",
    },
    {
      name: "Toddler",
      age: "16m - 33m",
      color: "bg-amber-100 text-amber-600",
      desc: "Focusing on language, social skills, and motor exploration.",
    },
    {
      name: "Preschool",
      age: "33m - 5y",
      color: "bg-pink-100 text-pink-500",
      desc: "Preparing little stars for kindergarten with fun learning.",
    },
  ];

  return (
    <section
      id="programs"
      className="py-24 bg-[#fdfaf1] rounded-[4rem] mx-4 shadow-inner"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#1a2e44] mb-4 tracking-tight">
            Our Programs
          </h2>
          <div className="w-20 h-1.5 bg-[#38bdf8] mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {programs.map((p) => (
            <div
              key={p.name}
              className="bg-white p-10 rounded-[3rem] shadow-lg shadow-gray-200/50 hover:-translate-y-2 transition-all"
            >
              <div
                className={`w-14 h-14 ${p.color} rounded-2xl flex items-center justify-center text-2xl font-bold mb-8`}
              >
                {p.name[0]}
              </div>
              <h3 className="text-3xl font-extrabold text-[#1a2e44] mb-2">
                {p.name}
              </h3>
              <p className="text-sm font-bold uppercase tracking-widest text-[#38bdf8] mb-6">
                {p.age}
              </p>
              <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                {p.desc}
              </p>
              <Link
                to="inquiry"
                smooth={true}
                className="inline-block px-6 py-3 bg-[#38bdf8] text-white font-bold rounded-full hover:brightness-105 cursor-pointer transition-all"
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
