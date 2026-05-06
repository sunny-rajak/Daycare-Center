export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="py-12 md:py-20 bg-white px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="flex justify-center items-center gap-3 text-3xl md:text-4xl font-bold text-[#1a2e44] mb-16 tracking-tight">
          Parent Stories
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-16 h-16 text-[#FFB38E] fill-current shrink-0"
          >
            <circle cx="6.5" cy="7.5" r="4" />
            <circle cx="17.5" cy="7.5" r="4" />
            <circle cx="12" cy="14" r="8" />
            <circle cx="9" cy="12.5" r="1.5" fill="white" />
            <circle cx="15" cy="12.5" r="1.5" fill="white" />
            <ellipse cx="12" cy="17" rx="3.5" ry="2.5" fill="white" />
            <circle cx="12" cy="16" r="1" fill="currentColor" />
          </svg>
        </h2>
        <div className="flex flex-col md:flex-row flex-wrap justify-center items-stretch gap-8 max-w-6xl mx-auto px-4">
          <div className="w-full md:w-[400px] flex-shrink-0 bg-white p-10 rounded-3xl border border-gray-50 shadow-lg shadow-gray-200/50 text-left">
            <div className="flex text-[#FFB38E] mb-6 font-bold text-xl">
              ★★★★★
            </div>
            <p className="text-xl font-medium text-gray-600 italic mb-8">
              "The transition was hard for us, but the teachers made my daughter
              feel loved instantly. We love this daycare!"
            </p>
            <div className="font-bold text-[#2D3436]">— Sarah M.</div>
          </div>
          <div className="w-full md:w-[400px] flex-shrink-0 bg-white p-10 rounded-3xl border border-gray-50 shadow-lg shadow-gray-200/50 text-left">
            <div className="flex text-[#FFB38E] mb-6 font-bold text-xl">
              ★★★★★
            </div>
            <p className="text-xl font-medium text-gray-600 italic mb-8">
              "Finding a clean and fun place was our priority. This place is
              exactly what we were looking for."
            </p>
            <div className="font-bold text-[#2D3436]">— David R.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
