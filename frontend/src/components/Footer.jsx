export default function Footer() {
  return (
    <footer className="py-12 md:py-16 bg-[#FDFBF7] border-t border-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="flex flex-col justify-center items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-[#2D3436] font-black text-sm">
            S
          </div>
          <span className="text-lg font-black tracking-tight text-[#2D3436] opacity-80">
            SPROUT & SPARK CHILDCARE LLC.
          </span>
        </div>
        <p className="text-gray-500 font-bold mb-2">
          © {new Date().getFullYear()} All Rights Reserved.
        </p>
        <p className="text-gray-400 text-xs uppercase tracking-[0.3em] font-black">
          Quality Education • Professional Care
        </p>
      </div>
    </footer>
  );
}
