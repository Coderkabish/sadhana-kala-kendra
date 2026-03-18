import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
// ✅ KEPT necessary imports: heroImages, logo
import { heroImages, logo, aboutVideo } from "../assets/assets";

// ✅ IMPORT backend services
import { getAllArtists } from "../admin/services/artistsService";
import { getAllCourses } from "../admin/services/coursesService";
import { getAllTeachers } from "../admin/services/teachersService";
import { getPublicOffers } from "../admin/services/offersService";
// ⬅️ NEW: Import SERVER_ROOT_URL from your service file (assuming all services import 'api')
import { SERVER_ROOT_URL } from "../admin/services/api";

const Home = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [artistsList, setArtistsList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [teachersList, setTeachersList] = useState([]);
  const [offersList, setOffersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Utility to construct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return "https://via.placeholder.com/300x400?text=Image+Missing";
    }

    // If backend already returns a full URL, use it directly
    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    // Otherwise prepend SERVER_ROOT_URL
    const fixed = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${SERVER_ROOT_URL}${fixed}`;
  };

  const normalizeCtaUrl = (rawUrl) => {
    if (!rawUrl) return "";
    const trimmed = rawUrl.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  // --- Data Fetching Logic (Unchanged) ---
  const fetchHomeData = useCallback(async () => {
    setLoading(true);
    try {
      const [artistsData, coursesData, teachersData, offersData] = await Promise.all([
        getAllArtists(),
        getAllCourses(),
        getAllTeachers(),
        getPublicOffers(3),
      ]);
      setArtistsList(artistsData);
      setCoursesList(coursesData);
      setTeachersList(teachersData);
      setOffersList(Array.isArray(offersData) ? offersData.slice(0, 3) : []);
    } catch (error) {
      console.error(
        "Failed to fetch home data (artists/courses/teachers):",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);
  // ----------------------------

  // Hero images carousel effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to top and Fetch data on page load
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchHomeData();
  }, [fetchHomeData]);

  // Conditional render for loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#cf0408] mx-auto mb-4"></div>
          <p className="text-xl text-[#191938] font-['Inter']">
            Loading About Us content...
          </p>
        </div>
      </div>
    );
  }
  return (
    // Set the secondary font (Roboto) as the default for the body
    <div className="min-h-screen bg-gray-100 font-['Roboto']">
      {/* ================= HERO SECTION ================= */}
      <section className="relative h-[90vh] overflow-hidden">
        <img
          key={heroImages[currentIndex]}
          src={heroImages[currentIndex]}
          alt="Sadhana Kala Kendra hero"
          fetchpriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-5xl md:text-7xl font-extrabold font-['Inter'] text-white drop-shadow-2xl mb-6 tracking-tight">
            Sadhana Kala Kendra
          </h1>

          <p className="text-xl md:text-3xl text-red-100 max-w-3xl mb-10 drop-shadow-md font-['Playfair Display'] ">
            Where Tradition Meets Talent: Nurturing the Future of Nepalese Arts
          </p>

          <Link
            to="/register"
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-10 rounded-full text-lg shadow-xl transition duration-300 transform hover:scale-105 font-['Inter']"
          >
            Enroll Now
          </Link>
        </div>
      </section>

      {/* --- Horizontal Rule added for better visual separation --- */}
      <hr className="border-t border-red-500/30" />

      {/* ================= About Section ================= */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid md:grid-cols-2 gap-20 items-center">
          {/* ================= TEXT CONTENT ================= */}
          <div className="space-y-10">
            {/* Heading */}
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#0f0f50] font-['Inter'] leading-snug">
              About <span className="text-red-600">Sadhana Kala Kendra</span>
            </h2>

            {/* Paragraph + Logo Inline */}
            <div className="flex items-start gap-6">
              <img
                src={logo}
                alt="Sadhana Kala Kendra Logo"
                loading="lazy"
                className="w-20 h-20 md:w-24 md:h-24 object-contain rounded-full shadow-lg p-2 bg-gray-50 border-4 border-red-500/20 transition-transform duration-300 hover:scale-105"
              />

              <p className="text-lg text-gray-700 leading-relaxed font-['Roboto']">
                Established in 1991,{" "}
                <span className="font-bold text-[#191938]">
                  Sadhana Kala Kendra
                </span>{" "}
                is a government-recognized institution dedicated to nurturing
                Nepalese music, art, and culture through quality education and
                creative expression.
              </p>
            </div>

            {/* Second Paragraph */}
            <p className="text-lg text-gray-700 leading-relaxed font-['Roboto']">
              With over three decades of experience, we’ve helped thousands of
              students master instruments, vocals, and dance. Our expert
              instructors and vibrant community have made us one of Nepal’s most
              trusted and respected music schools.
            </p>

            {/* Button */}
            <Link
              to="/about"
              className="inline-block bg-[#191938] hover:bg-red-600 text-white font-semibold py-3 px-10 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 font-['Inter']"
            >
              Learn More
            </Link>
          </div>

          {/* ================= MEDIA SECTION ================= */}
          <div className="flex justify-center md:justify-end w-full">
            <div
              className="
          w-full
          md:w-[620px]
          lg:w-[700px]
          xl:w-[760px]
          aspect-video
          rounded-2xl
          overflow-hidden
          shadow-xl
          hover:shadow-2xl
          transition-shadow
          duration-300
          bg-black
        "
            >
              <video
                src={aboutVideo}
                muted
                controls
                playsInline
                preload="none"
                poster={heroImages[0]}
                className="
            w-full
            h-full
            object-cover
          "
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- Horizontal Rule added for better visual separation --- */}
      <hr className="border-t border-gray-200" />

      {/* ================= OFFERS SECTION ================= */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#0f0f50] mb-4 font-['Inter']">
              Latest <span className="text-red-600">Offers</span>
            </h2>
            <p className="text-gray-600 text-lg md:text-xl font-['Roboto']">
              Top offers curated for current students and new applicants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {offersList.length > 0 ? (
              offersList.map((offer) => (
                <div
                  key={offer.offer_id}
                  className="bg-white border border-gray-200 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 overflow-hidden text-left"
                >
                  <div className="h-52 overflow-hidden bg-gray-100">
                    {offer.image_url ? (
                      <img
                        src={getImageUrl(offer.image_url)}
                        alt={offer.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400">No image</div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-1 text-[#191938] font-['Inter'] line-clamp-2">
                      {offer.title}
                    </h3>
                    {offer.subtitle && (
                      <p className="text-red-600 font-semibold mb-2 font-['Roboto']">{offer.subtitle}</p>
                    )}
                    <p className="text-gray-700 mb-4 font-['Roboto'] line-clamp-3">
                      {offer.description}
                    </p>
                    {offer.slug ? (
                      <Link
                        to={`/offers/${offer.slug}`}
                        className="inline-block mr-3 text-[#191938] font-semibold underline"
                      >
                        View Details
                      </Link>
                    ) : null}
                    {offer.cta_link && (
                      <a
                        href={normalizeCtaUrl(offer.cta_link)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block bg-[#191938] hover:bg-red-600 text-white font-semibold py-2 px-5 rounded-full transition-all duration-300"
                      >
                        {offer.cta_text || "Know More"}
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500 text-lg p-8 bg-yellow-50 rounded-lg font-['Roboto']">
                No active offers available right now.
              </p>
            )}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/offers"
              className="text-red-600 font-bold underline text-lg hover:text-red-800 transition duration-200 font-['Inter']"
            >
              See All Offers
            </Link>
          </div>
        </div>
      </section>

      {/* --- Horizontal Rule added for better visual separation --- */}
      <hr className="border-t border-gray-200" />

      {/* ================= PRIDE SECTION (ARTISTS) ================= */}
      <section className="py-20 bg-red-50/25">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <div className="text-center mb-16">
            {/* Primary Font: Inter */}
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#0f0f50] mb-4 font-['Inter']">
              The Pride of{" "}
              <span className="text-red-600">Sadhana Kala Kendra</span>
            </h2>
            {/* Secondary Font: Roboto */}
            <p className="text-gray-600 text-lg md:text-xl font-['Roboto']">
              Celebrating the talented artists who began their journey with us
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {artistsList.length > 0 ? (
              artistsList.slice(0, 6).map((artist) => (
                <div
                  key={artist.artist_id}
                  className="bg-white border border-gray-200 p-0 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 overflow-hidden text-left"
                >
                  <div className="h-64 overflow-hidden">
                    <img
                      src={getImageUrl(artist.profile_image)}
                      alt={artist.full_name}
                      loading="lazy"
                      className="w-full aspect-[4/3] object-cover object-top transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    {/* Primary Font: Inter */}
                    <h3 className="text-2xl font-bold mb-1 text-[#0f0f50] text-center font-['Inter']">
                      {artist.full_name}
                    </h3>
                    {/* Secondary Font: Roboto */}
                    <p className="text-red-600 font-semibold mb-4 font-['Roboto']">
                      {artist.stage_name}
                    </p>
                    {/* Secondary Font: Roboto */}
                    <p className="text-gray-700 mb-4 font-['Roboto'] text-center line-clamp-3">
                      {artist.bio}
                    </p>
                    {/* Primary Font: Inter */}
                  </div>
                </div>
              ))
            ) : (
              // Secondary Font: Roboto
              <p className="col-span-full text-center text-gray-500 text-lg p-8 bg-yellow-50 rounded-lg font-['Roboto']">
                No artists are currently featured !
              </p>
            )}
          </div>

          <div className="text-center mt-12">
            {/* Primary Font: Inter */}
            <Link
              to="/artists"
              className="text-red-600 font-bold underline text-lg hover:text-red-800 transition duration-200 font-['Inter']"
            >
              See All Artists
            </Link>
          </div>
        </div>
      </section>

      {/* --- Horizontal Rule added for better visual separation --- */}
      <hr className="border-t border-gray-200" />

      {/* ================= COURSES SECTION ================= */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <div className="text-center mb-16">
            {/* Primary Font: Inter */}
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#0f0f50] mb-4 font-['Inter']">
              Explore Our Featured <span className="text-red-600">Courses</span>
            </h2>
            {/* Secondary Font: Roboto */}
            <p className="text-gray-600 text-lg md:text-xl font-['Roboto']">
              Explore musical programs built to develop technique, expression,
              and artistic growth
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coursesList.length > 0 ? (
              coursesList.slice(0, 6).map((course) => (
                <div
                  key={course.course_id}
                  className="bg-white border border-gray-200 p-0 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 overflow-hidden text-left"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={getImageUrl(course.image_url)}
                      alt={course.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    {/* Primary Font: Inter */}
                    <h3 className="text-2xl font-bold mb-2 text-[#191938] font-['Inter']">
                      {course.title}
                    </h3>
                    <h3 className="text-2xl font-semibold text-[#191938] mb-3 font-['Playfair Display'] text-center">
                      {course.course_name} {/* Use course_name from backend */}
                    </h3>

                    {/* Secondary Font: Roboto */}
                    <p className="text-gray-700 mb-4 font-['Roboto'] line-clamp-3">
                      {course.description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500 text-lg p-8 bg-yellow-50 rounded-lg font-['Roboto']">
                No courses are currently listed !
              </p>
            )}
          </div>

          <div className="text-center mt-12">
            {/* Primary Font: Inter */}
            <Link
              to="/courses"
              className="text-red-600 font-bold underline text-lg hover:text-red-800 transition duration-200 font-['Inter']"
            >
              See All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* --- Horizontal Rule added for better visual separation --- */}
      <hr className="border-t border-gray-200" />

      {/* ================= TEACHERS SECTION ================= */}
      <section className="py-20 bg-red-50/25">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          {/* Primary Font: Inter */}
          <div className="text-center mb-16">
            {/* Primary Font: Inter */}
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#0f0f50] mb-4 font-['Inter']">
              Meet Our Expert <span className="text-red-600">Teachers</span>
            </h2>
            {/* Secondary Font: Roboto */}
            <p className="text-gray-600 text-lg md:text-xl font-['Roboto']">
              Our dedicated team of accomplished musicians and experienced
              educators are ready to guide your artistic development
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teachersList.length > 0 ? (
              teachersList.slice(0, 3).map((teacher) => (
                <div
                  key={teacher.teacher_id}
                  className="bg-white p-0 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 overflow-hidden"
                >
                  <div className="h-64 overflow-hidden">
                    <img
                      src={getImageUrl(teacher.profile_image)}
                      alt={teacher.full_name}
                      loading="lazy"
                      className="w-full h-56 object-cover object-top transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    {/* Primary Font: Inter */}
                    <h3 className="text-2xl font-bold mb-1 text-[#191938] font-['Inter']">
                      {teacher.full_name}
                    </h3>
                    {/* Secondary Font: Roboto */}
                    <p className="text-red-600 font-semibold mb-4 font-['Roboto']">
                      {teacher.specialization}
                    </p>
                    {/* Primary Font: Inter */}
                  </div>
                </div>
              ))
            ) : (
              // Secondary Font: Roboto
              <p className="col-span-full text-center text-gray-500 text-lg p-8 bg-yellow-50 rounded-lg font-['Roboto']">
                No teachers are currently listed !
              </p>
            )}
          </div>

          <div className="text-center mt-12">
            {/* Primary Font: Inter */}
            <Link
              to="/teachers"
              className="text-red-600 font-bold underline text-lg hover:text-red-800 transition duration-200 font-['Inter']"
            >
              See All Teachers
            </Link>
          </div>
        </div>
      </section>

      {/* --- Horizontal Rule added for better visual separation --- */}
      <hr className="border-t border-gray-200" />

      {/* ================= LOCATION SECTION ================= */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            {/* Primary Font: Inter */}
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#0f0f50] mb-4 font-['Inter']">
              Our <span className="text-red-600">Location</span>
            </h2>
            {/* Secondary Font: Roboto */}
            <p className="text-gray-600 text-lg md:text-xl font-['Roboto']">
              Visit us at our Center in Kathmandu, Nepal
            </p>
          </div>

          <div className="w-full h-[450px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
            <iframe
              title="Sadhana Kala Kendra Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.023786510191!2d85.315569!3d27.708368!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb1907b0ce6945%3A0xff0752eee7ced509!2sSadhana%20Kala%20Kendra!5e0!3m2!1sen!2snp!4v1700092400000!5m2!1sen!2snp"
              width="100%"
              height="100%"
              className="border-0"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

          <div className="text-center mt-6">
            {/* Secondary Font: Roboto */}
            <p className="text-gray-700 font-['Roboto'] text-lg">
              📍 Near by Ghantaghar, Kamaladi, Kathmandu
            </p>
            <p className="text-gray-700 font-['Roboto'] text-lg mt-2">
              ☎️ 01-4540228, 9851023576 | ✉️ sadhananepal25@gmail.com
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
