export default function Footer() {
  return (
    <footer id="contact" className="bg-gray-900 text-white py-20 px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
        {/* Column 1: Brand & Mission */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-2xl font-black text-brand-blue uppercase tracking-tighter">
            <span>🏠</span>
            <span>Ecera Stay & Care</span>
          </div>
          <p className="text-gray-400 leading-relaxed max-w-sm">
            Providing a nurturing, safe, and fun-filled environment for children
            in Farmington Hills. Where every child shines bright.
          </p>
          {/* Social Icons Placeholder */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-brand-blue transition-colors cursor-pointer">
              f
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-brand-pink transition-colors cursor-pointer">
              ig
            </div>
          </div>
        </div>

        {/* Column 2: Specific Location Details */}
        <div className="space-y-6">
          <h5 className="text-lg font-bold text-brand-yellow uppercase tracking-widest">
            Our Location
          </h5>
          <address className="not-italic text-gray-400 space-y-4 leading-relaxed">
            <p className="flex items-start gap-3">
              <span className="text-brand-blue">📍</span>
              <span>
                33405 Colony Park Drive, <br /> Farmington Hills, MI 48331
              </span>
            </p>
            <p className="flex items-center gap-3">
              <span className="text-brand-blue">📞</span>
              <span>(248) 123-4567</span>
            </p>
            <p className="flex items-center gap-3">
              <span className="text-brand-blue">✉️</span>
              <span>hello@ecerastay.com</span>
            </p>
          </address>
        </div>

        {/* Column 3: Hours & Quick Link */}
        <div className="space-y-6">
          <h5 className="text-lg font-bold text-brand-green uppercase tracking-widest">
            Working Hours
          </h5>
          <ul className="text-gray-400 space-y-2">
            <li className="flex justify-between border-b border-gray-800 pb-2">
              <span>Mon - Fri:</span>
              <span className="text-white font-medium">7:00 AM - 6:00 PM</span>
            </li>
            <li className="flex justify-between border-b border-gray-800 pb-2 text-gray-600">
              <span>Sat - Sun:</span>
              <span>Closed</span>
            </li>
          </ul>
          <button className="w-full mt-4 py-3 bg-brand-blue/10 border border-brand-blue/20 text-brand-blue rounded-xl font-bold hover:bg-brand-blue hover:text-white transition-all">
            Get Directions
          </button>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 gap-4">
        <p>© 2026 Ecera Stay & Care LLC. All rights reserved.</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-white">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-white">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}
