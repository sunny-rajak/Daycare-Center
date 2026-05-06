import { useState } from "react";
import { Link } from "react-scroll";
import { submitTourRequest } from "../api/tourApi";

export default function Hero() {
  const galleryImages = [
    "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1564620541920-0b994a424e69?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1582183551067-ee40dbb07283?auto=format&fit=crop&q=80&w=1200",
  ];

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
                  src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=1000"
                  alt="Children playing"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tour Scheduling Modal */}
      {isTourModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-8">
            {/* Header with Close Button */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#2D3436]">
                Schedule Your Visit
              </h2>
              <button
                onClick={() => setIsTourModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors"
              >
                ✕
              </button>
            </div>

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
            />

            {/* Previous Button */}
            <button
              onClick={handlePrevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white text-4xl font-bold py-4 px-6 rounded-lg transition-colors"
            >
              ‹
            </button>

            {/* Next Button */}
            <button
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white text-4xl font-bold py-4 px-6 rounded-lg transition-colors"
            >
              ›
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
