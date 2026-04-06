import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Programs from "./components/Programs";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen selection:bg-brand-yellow/30">
      <Navbar />
      <main>
        <Hero />
        <Programs />
        {/* We can add a Testimonials section here later */}
      </main>
      <Footer />
    </div>
  );
}

export default App;
