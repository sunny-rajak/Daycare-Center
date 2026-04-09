export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-[#1a2e44] mb-16 tracking-tight">
          Parent Stories 🧸
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-white p-10 rounded-[3rem] border-2 border-blue-50 shadow-sm text-left">
            <div className="flex text-amber-400 mb-6 font-bold text-xl">
              ★★★★★
            </div>
            <p className="text-xl font-medium text-gray-600 italic mb-8">
              "The transition was hard for us, but the teachers made my daughter
              feel loved instantly. We love this daycare!"
            </p>
            <div className="font-extrabold text-[#1a2e44]">— Sarah M.</div>
          </div>
          <div className="bg-white p-10 rounded-[3rem] border-2 border-pink-50 shadow-sm text-left">
            <div className="flex text-amber-400 mb-6 font-bold text-xl">
              ★★★★★
            </div>
            <p className="text-xl font-medium text-gray-600 italic mb-8">
              "Finding a clean and fun place was our priority. This place is
              exactly what we were looking for."
            </p>
            <div className="font-extrabold text-[#1a2e44]">— David R.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
