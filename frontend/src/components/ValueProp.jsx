export default function ValueProp() {
  const values = [
    {
      title: "Safe & Secure",
      desc: "24/7 monitoring and controlled access for peace of mind.",
      icon: "🛡️",
      color: "bg-blue-50",
    },
    {
      title: "Expert Staff",
      desc: "Certified educators in child development and CPR/First Aid.",
      icon: "🎓",
      color: "bg-pink-50",
    },
    {
      title: "Healthy Meals",
      desc: "Organic meals prepared fresh daily for growing bodies.",
      icon: "🍎",
      color: "bg-amber-50",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
        {values.map((v, i) => (
          <div
            key={i}
            className="flex flex-col items-center text-center p-8 rounded-[3rem] hover:shadow-xl hover:shadow-gray-100 transition-all border border-transparent hover:border-gray-50"
          >
            <div
              className={`w-20 h-20 ${v.color} rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-sm`}
            >
              {v.icon}
            </div>
            <h3 className="text-2xl font-extrabold text-[#1a2e44] mb-3">
              {v.title}
            </h3>
            <p className="text-gray-500 font-medium leading-relaxed">
              {v.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
