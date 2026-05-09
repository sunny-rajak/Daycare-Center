import { useState } from "react";
import { Link } from "react-scroll";
import { submitTourRequest } from "../api/tourApi";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

// Import local assets
// Note: Ensure these files actually exist in your src/assets folder
import heroImg from "../assets/images/hero-image.avif";
import galleryImg1 from "../assets/images/gallery-1.jpg";
import galleryImg2 from "../assets/images/gallery-2.jpg";
import galleryImg3 from "../assets/images/gallery-3.jpg";
import galleryImg4 from "../assets/images/gallery-4.jpeg";

export default function Hero() {
  const galleryImages = [galleryImg1, galleryImg2, galleryImg3, galleryImg4];

  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    parentName: "",
    email: "",
    phone: "",
    requestedDate: "",
    requestedTime: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // "success", "error", or null

  const todayDate = new Date().toISOString().split("T")[0];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitStatus(null);

    try {
      const tourData = {
        parentName: formData.parentName,
        email: formData.email,
        phone: formData.phone,
        requestedDate: formData.requestedDate,
        requestedTime: formData.requestedTime,
      };

      const response = await submitTourRequest(tourData);

      if (response.success) {
        setSubmitStatus("success");
        setFormData({
          parentName: "",
          email: "",
          phone: "",
          requestedDate: "",
          requestedTime: "",
        });

        // Auto close modal after 3 seconds
        setTimeout(() => {
          setIsTourModalOpen(false);
          setSubmitStatus(null);
        }, 3000);
      }
    } catch (error) {
      setSubmitStatus("error");
      console.error("Tour submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === galleryImages.length - 1 ? 0 : prev + 1,
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1,
    );
  };

  return (
    <>
      <section id="hero" className="pt-12 md:pt-16 pb-20 bg-[#fdfaf1]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
          <div className="space-y-8 w-full md:w-1/2 text-left">
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] xl:text-6xl font-extrabold text-[#2D3436] leading-tight">
              Where Every <br className="hidden md:block" />
              <span className="text-[#4D9699]">Child Shines.</span>
            </h1>

            <p className="text-lg text-gray-700 max-w-md leading-relaxed">
              Safe, nurturing, and fun-filled childcare services for your little
              ones. We focus on growth, creativity, and early learning.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-md mx-auto sm:mx-0">
              <button
                onClick={() => setIsTourModalOpen(true)}
                className="w-full sm:w-auto px-8 py-4 bg-[#4D9699] text-white font-bold rounded-full shadow-lg shadow-[#4D9699]/30 hover:bg-opacity-90 transition-all cursor-pointer"
              >
                Book a Tour
              </button>
              <button
                onClick={() => setIsGalleryOpen(true)}
                className="w-full sm:w-auto px-8 py-4 bg-white font-bold rounded-full border border-[#4D9699] text-[#4D9699] hover:bg-[#4D9699] hover:text-white transition-all"
              >
                View Gallery
              </button>
            </div>
          </div>

          <div className="relative w-full md:w-1/2">
            {/* Recreating the rounded image look from your screenshot */}
            <div className="aspect-square bg-white p-4 rounded-[3rem] shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="w-full h-full rounded-[2.5rem] bg-gray-100 overflow-hidden">
                <img
                  src={heroImg}
                  alt="Children playing"
                  className="w-full h-full object-cover"
                  loading="eager" // Hero images should load immediately
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tour Scheduling Modal */}
      {isTourModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity p-0 md:p-4 overflow-hidden">
          <div className="relative w-full h-full md:h-auto md:w-full md:max-w-md mx-auto bg-white md:rounded-3xl shadow-2xl flex flex-col max-h-[100dvh] md:max-h-[85vh] overflow-hidden">
            {/* Header with Close Button */}
            <div className="flex items-center justify-between p-5 md:p-6 border-b border-gray-100 shrink-0">
              <h2 className="text-xl md:text-2xl font-bold text-[#2D3436]">
                Schedule Your Visit
              </h2>
              <button
                onClick={() => setIsTourModalOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide p-6 md:p-8">
              {/* Success/Error Message */}
              {submitStatus === "success" && (
                <div className="mb-4 p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg">
                  ✓ Request sent! We will contact you soon.
                </div>
              )}
              {submitStatus === "error" && (
                <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                  ✗ Failed to submit request. Please try again.
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Parent Name */}
                <div>
                  <label className="block text-sm font-semibold text-[#2D3436] mb-2">
                    Parent Name
                  </label>
                  <input
                    type="text"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D9699]"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-[#2D3436] mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D9699]"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-semibold text-[#2D3436] mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D9699]"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-semibold text-[#2D3436] mb-2">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    name="requestedDate"
                    min={todayDate}
                    value={formData.requestedDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D9699]"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Time Slot */}
                <div>
                  <label className="block text-sm font-semibold text-[#2D3436] mb-2">
                    Time Slot
                  </label>
                  <select
                    name="requestedTime"
                    value={formData.requestedTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D9699]"
                    required
                    disabled={isLoading}
                  >
                    <option value="">Select a time slot</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="04:00 PM">04:00 PM</option>
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || submitStatus === "success"}
                  className="w-full bg-[#4D9699] text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Submitting..." : "Confirm Tour"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Lightbox */}
      {isGalleryOpen && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4">
          {/* Close Button */}
          <button
            onClick={() => setIsGalleryOpen(false)}
            className="absolute top-8 right-8 text-white hover:text-gray-300 text-4xl font-bold transition-colors"
          >
            ✕
          </button>

          {/* Image Container */}
          <div className="relative flex items-center justify-center">
            <img
              src={galleryImages[currentImageIndex]}
              alt={`Gallery image ${currentImageIndex + 1}`}
              className="max-h-[80vh] max-w-[90vw] object-contain rounded-xl"
              loading="lazy"
            />

            {/* Previous Button */}
            <button
              onClick={handlePrevImage}
              className="absolute left-4 md:left-6 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white p-3 rounded-full border border-white/20 shadow-2xl backdrop-blur-md transition-all z-10 hover:scale-110"
              aria-label="Previous image"
            >
              <ChevronLeft size={36} strokeWidth={2.5} />
            </button>

            {/* Next Button */}
            <button
              onClick={handleNextImage}
              className="absolute right-4 md:right-6 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white p-3 rounded-full border border-white/20 shadow-2xl backdrop-blur-md transition-all z-10 hover:scale-110"
              aria-label="Next image"
            >
              <ChevronRight size={36} strokeWidth={2.5} />
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold">
              {currentImageIndex + 1} / {galleryImages.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
