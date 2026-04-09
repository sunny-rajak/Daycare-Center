import Footer from "../../components/Footer";
import Hero from "../../components/Hero";
import Navbar from "../../components/Navbar";
import Programs from "../../components/Programs";
import ValueProp from "../../components/ValueProp";
import PublicInquiryForm from "../../components/PublicInquiryForm";
import Testimonials from "../../components/Testimonials";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <ValueProp />
      <Programs />
      <Testimonials />
      <PublicInquiryForm />
      <Footer />
    </div>
  );
}
