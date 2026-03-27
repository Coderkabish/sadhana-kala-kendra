import React, { useState, useEffect } from "react";
import {
  getAllBOD,
  getAllTeamMembers,
} from "../admin/services/aboutService.js";
import api, { SERVER_ROOT_URL } from "../admin/services/api";
import Seo from "../components/Seo";
import {
  FaAward,
  FaUsers,
  FaCalendarAlt,
  FaTrophy,
  FaMusic,
  FaTheaterMasks,
} from "react-icons/fa";
import { MdOutlineCelebration } from "react-icons/md";
import { GiMusicalNotes } from "react-icons/gi";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import PageLoader from "../components/PageLoader";
import EmptyState from "../components/EmptyState";

const toAnchorSlug = (program) => {
  if (program?.slug) return program.slug;
  return String(program?.title || "program")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const toBODSlug = (bodMember) => {
  if (bodMember?.slug) return bodMember.slug;
  return String(bodMember?.name || "member")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const About = () => {
  // State Management
  const [bodMembers, setBodMembers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamCarouselIndex, setTeamCarouselIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(4);

  // Use centralized SERVER_ROOT_URL from api.js
  const SERVER_BASE_URL = SERVER_ROOT_URL;

  // Update cardsPerView on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCardsPerView(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2);
      } else {
        setCardsPerView(4);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Carousel handlers
  const handleTeamNext = () => {
    const maxIndex = Math.max(0, teamMembers.length - cardsPerView);
    setTeamCarouselIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handleTeamPrev = () => {
    const maxIndex = Math.max(0, teamMembers.length - cardsPerView);
    setTeamCarouselIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  const visibleTeamMembers = teamMembers.slice(
    teamCarouselIndex,
    teamCarouselIndex + cardsPerView,
  );
  const totalPages = Math.ceil(teamMembers.length / cardsPerView);

  // Fetch Data from Backend
  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [bodData, programsResponse, teamData] = await Promise.all([
          getAllBOD(),
          api.get("/programs"),
          getAllTeamMembers(),
        ]);
        const programsData = programsResponse?.data || [];

        setBodMembers(bodData);

        // Sort programs by date descending
        const sortedPrograms = programsData.sort(
          (a, b) => new Date(b.program_date) - new Date(a.program_date),
        );
        setPrograms(sortedPrograms);
        setTeamMembers(teamData);
      } catch (err) {
        console.error("Error fetching About Us data:", err);
        setError("Failed to load cultural data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <PageLoader message="Loading About Us content..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <EmptyState
          title="No About Content Found"
          description={error}
          className="max-w-2xl"
        />
      </div>
    );
  }

  const programStructuredData = {
    "@context": "https://schema.org",
    "@graph": programs.map((program) => ({
      "@type": "EducationalProgram",
      name: program.title,
      description: program.description || "Program details",
      provider: {
        "@type": "Organization",
        name: "Sadhana Kala Kendra",
      },
      url:
        typeof window !== "undefined"
          ? `${window.location.origin}/about/${toAnchorSlug(program)}`
          : `/about/${toAnchorSlug(program)}`,
    })),
  };

  return (
    <section className="bg-white text-[#191938] font-['Inter']">
      <Seo
        title="About Us | Music Center"
        description="About Sadhana Kala Kendra, its mission, faculty, legacy, and educational programs."
        canonicalPath="/about"
        jsonLd={programStructuredData}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 space-y-16 md:space-y-24 py-12 md:py-20">
        {/* ======= PAGE HEADING ======= */}
        <div className="text-center space-y-4 md:space-y-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl text-[#0f0f50] font-extrabold font-['Inter'] px-4">
            About <span className="text-[#cf0408]">Sadhana Kala Kendra</span>
          </h1>
          <p className="text-gray-600 text-base sm:text-lg md:text-xl max-w-3xl mx-auto font-['Roboto'] px-4">
            Inspiring generations through the power of music, dance, and culture
            since 1991.
          </p>
          <div className="flex justify-center pt-4">
            <img
              src={logo}
              alt="Sadhana Kala Kendra Logo"
              className="w-40 sm:w-48 md:w-56 lg:w-64 h-auto object-contain"
            />
          </div>
        </div>

        {/* ======= INTRODUCTION & STATISTICS ======= */}
        <div className="space-y-8 md:space-y-12">
          {/* Introduction Text */}
          <div className="space-y-4 md:space-y-5 text-gray-700 font-['Roboto'] text-sm sm:text-base md:text-lg leading-relaxed px-4">
            <p>
              <span className="font-semibold text-[#191938]">Established</span>{" "}
              in 1991 A.D. with a deep vision to preserve Nepalese art, culture,
              and civilization, Sadhana Kala Kendra is a government-registered
              and recognized Music & Dance School. With over 35 years of
              experience, it has been serving society by nurturing thousands of
              creative minds through expert guidance and presenting a variety of
              colorful programs across different parts of the country.
            </p>
            <p>
              Nepali music, arts, and literature are uniquely admirable around
              the globe. Although Nepal is a small landlocked country between
              India and China, its cultural, religious, linguistic, ethnic, and
              geographical diversity has made it a piece of heaven, and we are
              the inhabitants of this heavenly place.
            </p>
            <p>
              Our Nepali society has successfully created a beautiful garland of
              such peculiarities, and Sadhana Kala Kendra was established to
              keep this garland always blooming and fresh. Since its
              establishment in 1991, SKK has been playing a leading role in
              promoting, uplifting, and continuing Nepali music, arts, and
              literature. Moreover, we are fully dedicated to keeping our
              typical Nepali arts and music alive even in today's globalized
              world.
            </p>
            <p>
              Sadhana Kala Kendra has become a strong bond between the old and
              new generations, providing a platform to share their skills and
              experiences. For more than 30 years, it has been organizing
              different music and dance competitions as well as beauty pageants
              nationwide.
            </p>
          </div>

          {/* Statistics Section */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Stat 1 */}
            <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-md border-l-4 border-[#200470] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-center mb-2 md:mb-3">
                <FaCalendarAlt className="text-xl sm:text-2xl md:text-3xl text-[#200470]" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#191938] font-['Inter'] mb-1 text-center">
                35+
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm font-['Roboto'] text-center">
                Years of Excellence
              </p>
            </div>

            {/* Stat 2 */}
            <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-md border-l-4 border-[#200470] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-center mb-2 md:mb-3">
                <FaUsers className="text-xl sm:text-2xl md:text-3xl text-[#200470]" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#191938] font-['Inter'] mb-1 text-center">
                10000+
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm font-['Roboto'] text-center">
                Students Trained
              </p>
            </div>
          </div>

          {/* Additional Achievements Section */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-6 md:pt-8">
            <div className="bg-gradient-to-br from-red-50 to-white p-5 sm:p-6 md:p-8 rounded-2xl shadow-md text-center border-t-4 border-[#200470] hover:shadow-lg transition duration-300">
              <GiMusicalNotes className="text-3xl sm:text-4xl md:text-5xl text-[#200470] mx-auto mb-3 md:mb-4" />
              <h3 className="text-base sm:text-lg md:text-xl font-bold font-['Playfair_Display'] text-[#191938] mb-2">
                Folk Culture Revival
              </h3>
              <p className="text-gray-700 text-xs sm:text-sm font-['Roboto']">
                10 consecutive years of National Folk Dance Competition
                preserving endangered traditions
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-white p-5 sm:p-6 md:p-8 rounded-2xl shadow-md text-center border-t-4 border-[#200470] hover:shadow-lg transition duration-300">
              <MdOutlineCelebration className="text-3xl sm:text-4xl md:text-5xl text-[#200470] mx-auto mb-3 md:mb-4" />
              <h3 className="text-base sm:text-lg md:text-xl font-bold font-['Playfair_Display'] text-[#191938] mb-2">
                Nationwide Programs
              </h3>
              <p className="text-gray-700 text-xs sm:text-sm font-['Roboto']">
                Organizing colorful cultural programs across different parts of
                Nepal
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-white p-5 sm:p-6 md:p-8 rounded-2xl shadow-md text-center border-t-4 border-[#200470] hover:shadow-lg transition duration-300 sm:col-span-2 lg:col-span-1">
              <FaTheaterMasks className="text-3xl sm:text-4xl md:text-5xl text-[#200470] mx-auto mb-3 md:mb-4" />
              <h3 className="text-base sm:text-lg md:text-xl font-bold font-['Playfair_Display'] text-[#191938] mb-2">
                Generational Bridge
              </h3>
              <p className="text-gray-700 text-xs sm:text-sm font-['Roboto']">
                Connecting old and new generations through shared artistic
                experiences
              </p>
            </div>
          </div>
        </div>

        {/* ======= FOUNDER'S MESSAGE ======= */}
        <div className="bg-linear-to-r from-red-50 to-gray-50 p-6 sm:p-8 md:p-10 rounded-3xl shadow-lg text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-3 md:mb-4 font-['Playfair_Display'] text-[#0f0f50]">
            Founder's Message
          </h2>
          <p className="text-gray-700 max-w-3xl mx-auto font-['Roboto'] leading-relaxed text-sm sm:text-base md:text-lg px-4">
            "Our mission has always been to preserve Nepalese culture and
            empower students through music education. Every learner who walks
            into our classrooms becomes part of our growing artistic family
            creating, performing, and inspiring."
            <br />
            <span className="font-semibold text-[#cf0408] mt-2 block">
              -- Founders
            </span>
          </p>
        </div>

        {/* ======= CORE VALUES & OBJECTIVES (STATIC) ======= */}
        <div className="bg-gray-50 rounded-3xl p-10 md:p-16 shadow-inner text-center">
          <h2 className="text-3xl md:text-4xl font-semibold mb-10 font-['Playfair Display'] text-[#0f0f50]">
            Core Objectives
          </h2>
          <ul className="grid md:grid-cols-2 gap-6 text-gray-700 font-['Roboto'] max-w-5xl mx-auto text-left">
            <li className="flex items-start gap-3 text-lg p-3 bg-white rounded-lg shadow-sm border-l-4 border-[#200470]">
              <FaMusic className="text-xl text-[#200470] flex-shrink-0 mt-1" />
              <span>
                Promote Nepalese music, dance, and traditional art forms.
              </span>
            </li>
            <li className="flex items-start gap-3 text-lg p-3 bg-white rounded-lg shadow-sm border-l-4 border-[#200470]">
              <FaAward className="text-xl text-[#200470] flex-shrink-0 mt-1" />
              <span>
                Provide structured and professional training for all age groups.
              </span>
            </li>
            <li className="flex items-start gap-3 text-lg p-3 bg-white rounded-lg shadow-sm border-l-4 border-[#200470]">
              <FaTheaterMasks className="text-xl text-[#200470] flex-shrink-0 mt-1" />
              <span>Foster creativity and encourage artistic freedom.</span>
            </li>
            <li className="flex items-start gap-3 text-lg p-3 bg-white rounded-lg shadow-sm border-l-4 border-[#200470]">
              <MdOutlineCelebration className="text-xl text-[#200470] flex-shrink-0 mt-1" />
              <span>
                Organize national and international cultural programs.
              </span>
            </li>
          </ul>
        </div>

        {/* ======= BOARD OF DIRECTORS ======= */}
        <div className="text-center pt-10 border-t border-gray-200">
          <header className="mb-10 md:mb-14">
            <p className="text-[#cf0408] text-xs sm:text-sm font-bold uppercase tracking-widest mb-2 font-['Inter']">
              Senior Leadership
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold font-['Playfair_Display'] text-[#191938]">
              Board Of Directors
            </h2>
          </header>

          {bodMembers.length === 0 ? (
            <p className="text-gray-500 italic font-['Roboto']">
              Board of Directors information is currently being updated.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {bodMembers.map((member) => {
                const bodSlug = toBODSlug(member);
                const cardContent = (
                  <>
                    {/* Image Block */}
                    <div className="h-64 overflow-hidden">
                      <img
                        src={
                          member.profile_image
                            ? `${SERVER_BASE_URL}${member.profile_image}`
                            : logo
                        }
                        alt={member.name}
                        className="w-full aspect-4/3 object-cover object-top transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                    {/* Text Content */}
                    <div className="p-6 text-center">
                      <h3 className="text-xl font-bold font-['Inter'] text-[#0f0f50] mb-1">
                        {member.name}
                      </h3>
                      <p className="text-red-600 text-sm font-bold font-['Roboto'] mb-4">
                        {member.designation}
                      </p>
                      {bodSlug ? (
                        <div className="text-center text-indigo-700 font-bold">
                          View Details
                        </div>
                      ) : null}
                    </div>
                  </>
                );

                return bodSlug ? (
                  <Link
                    key={member.bod_id}
                    to={`/about/bod/${bodSlug}`}
                    className="block bg-white border border-gray-200 p-0 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 overflow-hidden"
                  >
                    {cardContent}
                  </Link>
                ) : (
                  <div
                    key={member.bod_id}
                    className="bg-white border border-gray-200 p-0 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 overflow-hidden"
                  >
                    {cardContent}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ======= TEAM MEMBERS ======= */}
        <div className="pt-8 md:pt-12">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold font-['Playfair_Display'] text-[#191938]">
              Our Faculty Team
            </h2>
          </div>

          {teamMembers.length === 0 ? (
            <p className="text-gray-500 italic text-center font-['Roboto']">
              Team member information is currently being updated.
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Carousel Container */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {visibleTeamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white border border-gray-200 p-0 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 overflow-hidden"
                  >
                    {/* Image Block */}
                    <div className="h-64 overflow-hidden">
                      <img
                        src={
                          member.image_url
                            ? `${SERVER_BASE_URL}${member.image_url}`
                            : logo
                        }
                        alt={member.name}
                        className="w-full aspect-4/3 object-cover object-top transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                    {/* Text Content */}
                    <div className="p-6 text-center">
                      <h3 className="text-xl font-bold font-['Inter'] text-[#0f0f50] mb-1">
                        {member.name}
                      </h3>
                      <p className="text-red-600 text-sm font-semibold font-['Roboto']">
                        {member.subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Controls */}
              {teamMembers.length > cardsPerView && (
                <div className="flex items-center justify-center gap-6 mt-8">
                  <button
                    onClick={handleTeamPrev}
                    className="p-3 rounded-full border-2 border-red-600 text-red-600 hover:bg-red-50 transition duration-300 transform hover:scale-110"
                    aria-label="Previous members"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  {/* Page Indicators */}
                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setTeamCarouselIndex(idx * cardsPerView)}
                        className={`w-3 h-3 rounded-full transition duration-300 ${
                          Math.floor(teamCarouselIndex / cardsPerView) === idx
                            ? "bg-red-600 w-8"
                            : "bg-gray-300 hover:bg-gray-400"
                        }`}
                        aria-label={`Go to page ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleTeamNext}
                    className="p-3 rounded-full border-2 border-red-600 text-red-600 hover:bg-red-50 transition duration-300 transform hover:scale-110"
                    aria-label="Next members"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ======= PAST PROGRAMS ======= */}
        <div className="bg-white pt-12 md:pt-16 rounded-xl shadow-lg border border-gray-100">
          <header className="max-w-7xl w-full pt-6 md:pt-10 pb-8 md:pb-12 flex flex-col items-center gap-3 md:gap-4 text-center px-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-['Playfair_Display'] text-[#191938] leading-tight">
              Historic <span className="text-[#cf0408]">Showcases</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl font-['Roboto']">
              A selection of the notable cultural programs and performances
              organized by the Kendra over the years.
            </p>
          </header>

          {programs.length === 0 ? (
            <p className="text-gray-500 italic text-center pb-12 font-['Roboto']">
              Program information is currently being updated.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 p-4 sm:p-6 md:p-8 pt-4 md:pt-6">
                {programs.map((program) => (
                  <Link
                    key={program.program_id}
                    to={`/about/${toAnchorSlug(program)}`}
                    className="bg-gray-50 rounded-xl shadow-md overflow-hidden border border-gray-200 cursor-pointer transition duration-300 hover:shadow-xl group"
                  >
                    <div className="h-40 sm:h-48 overflow-hidden relative">
                      {program.image_url ? (
                        <img
                          src={`${SERVER_BASE_URL}${program.image_url}`}
                          alt={program.title}
                          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#191938]/30 flex items-center justify-center">
                          <span className="text-gray-300 text-xl sm:text-2xl font-['Playfair_Display'] italic">
                            No Image
                          </span>
                        </div>
                      )}
                      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-[#cf0408] text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 rounded-full tracking-wider font-['Inter']">
                        {new Date(program.program_date).getFullYear()}
                      </div>
                    </div>
                    <div className="p-4 sm:p-5 md:p-6">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold font-['Playfair_Display'] text-[#191938] mb-2 leading-tight group-hover:text-[#cf0408] transition-colors">
                        {program.title}
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm line-clamp-3 mb-3 md:mb-4 font-['Roboto']">
                        {program.description}
                      </p>
                      <div className="text-[#cf0408] font-semibold text-xs sm:text-sm flex items-center gap-1 font-['Inter']">
                        View Details
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="text-center pt-6 md:pt-8 pb-8 md:pb-12">
                <Link to="/events" className="inline-block">
                  <button
                    // Move all the styling classes to the button
                    className="px-6 md:px-8 py-2 md:py-3 border-2 border-[#191938] text-[#191938] font-bold rounded-full hover:bg-[#191938] hover:text-white transition duration-300 text-sm md:text-lg shadow-md hover:shadow-xl font-['Inter']"
                    // The onClick is now handled by the Link component
                  >
                    View All Programs
                  </button>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* ======= CTA SECTION ======= */}
        <div className="text-center pt-12 md:pt-16 px-4 pb-8 md:pb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-['Playfair_Display'] text-[#0f0f50] mb-3 md:mb-4">
            Join Our Artistic Journey
          </h2>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto mb-8 md:mb-10 font-['Roboto']">
            Be a part of Sadhana Kala Kendra and let your creativity find its
            true expression through music and art.
          </p>
          <Link to="/register">
            <button className="px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-base sm:text-lg rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-red-600 font-['Roboto']">
              Join Now
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default About;
