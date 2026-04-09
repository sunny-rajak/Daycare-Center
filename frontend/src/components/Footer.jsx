export default function Footer() {
  return (
    <footer className="py-20 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="flex justify-center items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 font-black text-sm text-white">
            E
          </div>
          <span className="text-lg font-black tracking-tight text-gray-400">
            ECERA STAY & CARE LLC.
          </span>
        </div>
        <p className="text-gray-400 font-bold mb-2">
          © {new Date().getFullYear()} All Rights Reserved.
        </p>
        <p className="text-gray-300 text-xs uppercase tracking-[0.3em] font-black">
          Quality Education • Professional Care
        </p>
      </div>
    </footer>
  );
}
