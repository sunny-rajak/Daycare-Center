export default function Programs() {
  const cards = [
    {
      title: "Infants",
      age: "3-12 Months",
      color: "bg-brand-blue",
      icon: "🍼",
    },
    {
      title: "Toddlers",
      age: "1-3 Years",
      color: "bg-brand-yellow",
      icon: "🎨",
    },
    {
      title: "Preschool",
      age: "3-5 Years",
      color: "bg-brand-green",
      icon: "📚",
    },
  ];

  return (
    <section id="programs" className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-4xl font-black text-gray-800">Our Programs</h2>
        <p className="mt-4 text-gray-500 max-w-xl mx-auto">
          We provide a balanced curriculum that nurtures your child's physical,
          emotional, and cognitive development.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {cards.map((card, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl border-2 border-transparent hover:border-brand-blue/20 hover:shadow-xl transition-all bg-gray-50/50 cursor-default"
            >
              <div
                className={`${card.color} w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-6 mx-auto group-hover:scale-110 transition-transform`}
              >
                {card.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{card.title}</h3>
              <p className="text-brand-blue font-bold mt-1">{card.age}</p>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Exploring the world through sensory play, music, and gentle
                interaction in a safe space.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
