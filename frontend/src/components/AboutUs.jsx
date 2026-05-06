export default function AboutUs() {
  return (
    <section
      id="about"
      className="py-12 md:py-20 bg-white px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">
        {/* Left Side - Image Gallery/Showcase */}
        <div className="relative w-full md:w-1/2">
          <div className="aspect-square rounded-[3rem] bg-teal-50 p-4 shadow-sm transform -rotate-3 hover:rotate-0 transition-transform duration-500">
            <div className="w-full h-full rounded-[2.5rem] overflow-hidden bg-gray-200">
              <img
                src="https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?auto=format&fit=crop&q=80&w=1000"
                alt="Happy kids learning"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Right Side - Content */}
        <div className="w-full md:w-1/2">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-[#1a2e44] tracking-tight">
            About <span className="text-[#4D9699]">Sprout & Spark</span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-4">
            At Sprout & Spark Childcare, we are dedicated to providing a
            nurturing, safe, and engaging environment where every child can
            bloom. We believe the early years are the most critical in a child's
            development.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed mb-4">
            Our dedicated team of certified educators fosters a love of learning
            through play, exploration, and compassionate care. We are here to
            support your family every step of the way, helping your little ones
            discover their potential and spark a lifelong love of learning.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                ✓
              </div>
              <span className="font-semibold text-gray-700">
                Play-based learning
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                ✓
              </div>
              <span className="font-semibold text-gray-700">
                Certified Staff
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                ✓
              </div>
              <span className="font-semibold text-gray-700">
                Modern Facility
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
