import React, { useState, useEffect, useCallback } from "react";
import {
  getAllBOD,
  getAllPrograms,
  getAllTeamMembers,
} from "../admin/services/aboutService.js";
import { SERVER_ROOT_URL } from "../admin/services/api";
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

const About = () => {
  // State Management
  const [bodMembers, setBodMembers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTeamMember, setActiveTeamMember] = useState(null);
  const [selectedProgramIndex, setSelectedProgramIndex] = useState(null);

  // Use centralized SERVER_ROOT_URL from api.js
  const SERVER_BASE_URL = SERVER_ROOT_URL;

  // Fetch Data from Backend
  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [bodData, programsData, teamData] = await Promise.all([
          getAllBOD(),
          getAllPrograms(),
          getAllTeamMembers(),
        ]);

        setBodMembers(bodData);

        // Sort programs by date descending
        const sortedPrograms = programsData.sort(
          (a, b) => new Date(b.program_date) - new Date(a.program_date)
        );
        setPrograms(sortedPrograms);
        setTeamMembers(teamData);

        if (teamData.length > 0) {
          setActiveTeamMember(teamData[0].id);
        }
      } catch (err) {
        console.error("Error fetching About Us data:", err);
        setError("Failed to load cultural data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Modal Logic
  const openModal = (index) => {
    setSelectedProgramIndex(index);
    document.body.style.overflow = "hidden";
  };

  const closeModal = useCallback(() => {
    setSelectedProgramIndex(null);
    document.body.style.overflow = "unset";
  }, []);

  const handleNextModalProgram = (e) => {
    e.stopPropagation();
    setSelectedProgramIndex((prev) =>
      prev === programs.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevModalProgram = (e) => {
    e.stopPropagation();
    setSelectedProgramIndex((prev) =>
      prev === 0 ? programs.length - 1 : prev - 1
    );
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedProgramIndex === null) return;
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowRight") handleNextModalProgram(e);
      if (e.key === "ArrowLeft") handlePrevModalProgram(e);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedProgramIndex, closeModal]);

  const handleMemberClick = (memberId) => {
    setActiveTeamMember(activeTeamMember === memberId ? null : memberId);
  };

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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <p className="text-xl font-['Inter'] text-red-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[#cf0408] text-white rounded-lg hover:bg-[#a00306] transition font-['Inter']"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const activeMemberData = teamMembers.find(
    (member) => member.id === activeTeamMember
  );

  const modalProgram =
    selectedProgramIndex !== null ? programs[selectedProgramIndex] : null;

  return (
    <section className="bg-white text-[#191938] font-['Inter']">
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

          {/* Quote & Statistics Section */}
          <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
            {/* Left: Quote */}
            <div className="bg-gradient-to-br from-red-50 to-gray-50 rounded-2xl p-6 sm:p-8 md:p-10 shadow-lg flex items-center justify-center border-l-4 border-[#cf0408]">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-center leading-relaxed text-[#cf0408] font-['Playfair_Display']">
                "Where tradition meets creativity,
                <br className="hidden sm:block" />
                and passion becomes performance."
              </h2>
            </div>

            {/* Right: Statistics Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* Stat 1 */}
              <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-md border-l-4 border-[#cf0408] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-center mb-2 md:mb-3">
                  <FaCalendarAlt className="text-xl sm:text-2xl md:text-3xl text-[#cf0408]" />
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#191938] font-['Inter'] mb-1 text-center">
                  35+
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm font-['Roboto'] text-center">
                  Years of Excellence
                </p>
              </div>

              {/* Stat 2 */}
              <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-md border-l-4 border-[#cf0408] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-center mb-2 md:mb-3">
                  <FaUsers className="text-xl sm:text-2xl md:text-3xl text-[#cf0408]" />
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#191938] font-['Inter'] mb-1 text-center">
                  10000+
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm font-['Roboto'] text-center">
                  Students Trained
                </p>
              </div>

              {/* Stat 3 */}
              <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-md border-l-4 border-[#cf0408] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-center mb-2 md:mb-3">
                  <FaTrophy className="text-xl sm:text-2xl md:text-3xl text-[#cf0408]" />
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#191938] font-['Inter'] mb-1 text-center">
                  10+
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm font-['Roboto'] text-center">
                  National Competitions
                </p>
              </div>

              {/* Stat 4 */}
              <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-md border-l-4 border-[#cf0408] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-center mb-2 md:mb-3">
                  <FaAward className="text-xl sm:text-2xl md:text-3xl text-[#cf0408]" />
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#191938] font-['Inter'] mb-1 text-center">
                  100+
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm font-['Roboto'] text-center">
                  Sadhana Samman Awards
                </p>
              </div>
            </div>
          </div>

          {/* Additional Achievements Section */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-6 md:pt-8">
            <div className="bg-gradient-to-br from-red-50 to-white p-5 sm:p-6 md:p-8 rounded-2xl shadow-md text-center border-t-4 border-[#cf0408] hover:shadow-lg transition duration-300">
              <GiMusicalNotes className="text-3xl sm:text-4xl md:text-5xl text-[#cf0408] mx-auto mb-3 md:mb-4" />
              <h3 className="text-base sm:text-lg md:text-xl font-bold font-['Playfair_Display'] text-[#191938] mb-2">
                Folk Culture Revival
              </h3>
              <p className="text-gray-700 text-xs sm:text-sm font-['Roboto']">
                10 consecutive years of National Folk Dance Competition
                preserving endangered traditions
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-white p-5 sm:p-6 md:p-8 rounded-2xl shadow-md text-center border-t-4 border-[#cf0408] hover:shadow-lg transition duration-300">
              <MdOutlineCelebration className="text-3xl sm:text-4xl md:text-5xl text-[#cf0408] mx-auto mb-3 md:mb-4" />
              <h3 className="text-base sm:text-lg md:text-xl font-bold font-['Playfair_Display'] text-[#191938] mb-2">
                Nationwide Programs
              </h3>
              <p className="text-gray-700 text-xs sm:text-sm font-['Roboto']">
                Organizing colorful cultural programs across different parts of
                Nepal
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-white p-5 sm:p-6 md:p-8 rounded-2xl shadow-md text-center border-t-4 border-[#cf0408] hover:shadow-lg transition duration-300 sm:col-span-2 lg:col-span-1">
              <FaTheaterMasks className="text-3xl sm:text-4xl md:text-5xl text-[#cf0408] mx-auto mb-3 md:mb-4" />
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
            <li className="flex items-start gap-3 text-lg p-3 bg-white rounded-lg shadow-sm border-l-4 border-[#cf0408]">
              <FaMusic className="text-xl text-[#cf0408] flex-shrink-0 mt-1" />
              <span>
                Promote Nepalese music, dance, and traditional art forms.
              </span>
            </li>
            <li className="flex items-start gap-3 text-lg p-3 bg-white rounded-lg shadow-sm border-l-4 border-[#cf0408]">
              <FaAward className="text-xl text-[#cf0408] flex-shrink-0 mt-1" />
              <span>
                Provide structured and professional training for all age groups.
              </span>
            </li>
            <li className="flex items-start gap-3 text-lg p-3 bg-white rounded-lg shadow-sm border-l-4 border-[#cf0408]">
              <FaTheaterMasks className="text-xl text-[#cf0408] flex-shrink-0 mt-1" />
              <span>Foster creativity and encourage artistic freedom.</span>
            </li>
            <li className="flex items-start gap-3 text-lg p-3 bg-white rounded-lg shadow-sm border-l-4 border-[#cf0408]">
              <MdOutlineCelebration className="text-xl text-[#cf0408] flex-shrink-0 mt-1" />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {bodMembers.map((member) => (
                <div
                  key={member.bod_id}
                  className="bg-white p-0 rounded-lg shadow-md border-b-4 border-[#cf0408] transition duration-300 hover:shadow-xl transform group overflow-hidden"
                >
                  {/* Image Block */}
                  <div className="h-40 sm:h-48 overflow-hidden bg-gray-100">
                    <img
                      src={
                        member.profile_image
                          ? `${SERVER_BASE_URL}${member.profile_image}`
                          : logo
                      }
                      alt={member.name}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  {/* Text Content */}
                  <div className="p-4 sm:p-5 text-center">
                    <h3 className="text-lg sm:text-xl font-bold font-['Playfair_Display'] text-[#191938] mb-1">
                      {member.name}
                    </h3>
                    <p className="text-[#cf0408] text-xs sm:text-sm font-bold tracking-widest uppercase mb-2 sm:mb-3 font-['Inter']">
                      {member.designation}
                    </p>
                    <p className="text-gray-600 text-xs sm:text-sm leading-snug line-clamp-3 font-['Roboto']">
                      {member.bio}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ======= TEAM MEMBERS ======= */}
        <div className="pt-8 md:pt-12">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-[#cf0408] text-xs sm:text-sm font-bold uppercase tracking-widest mb-2 font-['Inter']">
              Expert Mentors
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold font-['Playfair_Display'] text-[#191938]">
              Our Faculty Team
            </h2>
          </div>

          {teamMembers.length === 0 ? (
            <p className="text-gray-500 italic text-center font-['Roboto']">
              Team member information is currently being updated.
            </p>
          ) : (
            <div className="max-w-6xl mx-auto bg-white border-2 border-gray-100 shadow-xl overflow-hidden flex flex-col md:grid md:grid-cols-4">
              {/* Left Column: Roster List */}
              <div className="md:col-span-1 border-r-0 md:border-r-2 border-b-2 md:border-b-0 border-gray-100 bg-gray-50 py-4 md:py-6">
                <p className="px-4 md:px-6 text-xs font-bold uppercase tracking-[0.2em] text-[#191938] mb-3 md:mb-4 border-b pb-2 border-gray-200 font-['Roboto']">
                  Select Mentor
                </p>

                <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible">
                  {teamMembers.map((member) => {
                    const isActive = member.id === activeTeamMember;
                    return (
                      <button
                        key={member.id}
                        onClick={() => handleMemberClick(member.id)}
                        className={`block w-full text-left px-4 md:px-6 py-3 text-sm md:text-base font-semibold transition-all duration-200 ease-in-out focus:outline-none font-['Inter'] whitespace-nowrap md:whitespace-normal
                          ${
                            isActive
                              ? "bg-white text-[#cf0408] border-l-0 md:border-l-0 border-b-4 md:border-b-0 md:border-r-4 border-[#cf0408] font-bold shadow-md"
                              : "text-gray-700 border-l-0 md:border-l-0 border-b-4 md:border-b-0 md:border-r-4 border-transparent hover:bg-white hover:text-[#191938]"
                          }
                        `}
                      >
                        {member.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Details Pane */}
              <div className="md:col-span-3 p-6 sm:p-8 md:p-12 bg-white">
                {activeMemberData ? (
                  <div className="flex flex-col gap-6 md:gap-8 animate-in fade-in-0 duration-500">
                    {/* Image and Title Block */}
                    <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 border-b-2 border-gray-100 pb-4 md:pb-6">
                      <img
                        src={
                          activeMemberData.image_url
                            ? `${SERVER_BASE_URL}${activeMemberData.image_url}`
                            : logo
                        }
                        alt={activeMemberData.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-cover object-top rounded-full shadow-lg border-4 border-white flex-shrink-0 mx-auto sm:mx-0"
                      />
                      <div className="text-center sm:text-left">
                        <p className="text-[#cf0408] font-bold text-xs sm:text-sm tracking-widest uppercase mb-1 font-['Inter']">
                          {activeMemberData.subtitle}
                        </p>
                        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold font-['Playfair_Display'] text-[#191938] leading-tight">
                          {activeMemberData.name}
                        </h3>
                      </div>
                    </div>

                    {/* Details */}
                    <div>
                      {activeMemberData.description ? (
                        <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed whitespace-pre-line font-['Roboto'] border-l-4 border-[#191938] pl-3 md:pl-4 pt-2">
                          {activeMemberData.description}
                        </p>
                      ) : (
                        <p className="text-gray-500 italic text-base md:text-lg font-['Roboto']">
                          A detailed bio for {activeMemberData.name} will be
                          uploaded soon.
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full min-h-[200px] md:min-h-[300px] text-center text-gray-500 italic font-['Roboto']">
                    <p className="text-base md:text-xl px-4">
                      Select a faculty member from the list to view their
                      profile.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ======= PAST PROGRAMS ======= */}
        <div className="bg-white pt-12 md:pt-16 rounded-xl shadow-lg border border-gray-100">
          <header className="max-w-7xl w-full pt-6 md:pt-10 pb-8 md:pb-12 flex flex-col items-center gap-3 md:gap-4 text-center px-4">
            <p className="text-[#cf0408] text-xs sm:text-sm font-bold uppercase tracking-widest font-['Inter']">
              Our Legacy
            </p>
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
                {programs.slice(0, 6).map((program, index) => (
                  <div
                    key={program.program_id}
                    className="bg-gray-50 rounded-xl shadow-md overflow-hidden border border-gray-200 cursor-pointer transition duration-300 hover:shadow-xl group"
                    onClick={() => openModal(index)}
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
                  </div>
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
        <div className="text-center pt-12 md:pt-16 px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-['Playfair_Display'] text-[#0f0f50] mb-3 md:mb-4">
            Join Our Artistic Journey
          </h2>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto mb-6 md:mb-8 font-['Roboto']">
            Be a part of Sadhana Kala Kendra and let your creativity find its
            true expression through music and art.
          </p>
        </div>
      </div>

      {/* ======= PROGRAM MODAL ======= */}
      {selectedProgramIndex !== null && modalProgram && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-8"
          onClick={closeModal}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-[#191938]/30 backdrop-blur-sm transition-opacity duration-300"></div>

          {/* Modal Content Container */}
          <div
            className="relative w-full max-w-6xl bg-white rounded-xl md:rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row max-h-[90vh] h-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 md:top-4 md:right-4 z-50 p-2 bg-white/80 hover:bg-[#cf0408] hover:text-white rounded-full transition-colors backdrop-blur-md shadow-lg border border-gray-100"
              aria-label="Close Modal"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Left Side: Image */}
            <div className="w-full md:w-3/5 bg-black flex items-center justify-center relative min-h-[250px] sm:min-h-[300px] md:min-h-full">
              {modalProgram.image_url ? (
                <img
                  src={`${SERVER_BASE_URL}${modalProgram.image_url}`}
                  alt={modalProgram.title}
                  className="w-full h-full max-h-[40vh] md:max-h-full object-contain"
                />
              ) : (
                <div className="text-white/10 font-['Playfair_Display'] text-2xl md:text-3xl text-center px-4">
                  Sadhana Kala Kendra
                </div>
              )}

              {/* Mobile Nav Overlay */}
              <div className="absolute inset-x-0 bottom-4 flex justify-between px-4 md:hidden pointer-events-none">
                <button
                  onClick={handlePrevModalProgram}
                  className="pointer-events-auto p-2 bg-white/80 rounded-full shadow-lg text-[#191938]"
                  aria-label="Previous Program"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  onClick={handleNextModalProgram}
                  className="pointer-events-auto p-2 bg-white/80 rounded-full shadow-lg text-[#191938]"
                  aria-label="Next Program"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Right Side: Content */}
            <div className="w-full md:w-2/5 p-6 sm:p-8 md:p-12 flex flex-col bg-white overflow-y-auto">
              <div className="mb-auto">
                {/* Date Badge */}
                <span className="inline-block py-1 px-3 rounded-full bg-gray-100 text-[#cf0408] text-xs sm:text-sm font-bold uppercase tracking-wider mb-4 md:mb-6 font-['Inter']">
                  {new Date(modalProgram.program_date).toLocaleDateString(
                    "en-US",
                    { day: "numeric", month: "long", year: "numeric" }
                  )}
                </span>

                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold font-['Playfair_Display'] text-[#191938] mb-4 md:mb-6 leading-tight">
                  {modalProgram.title}
                </h3>

                <div className="w-12 md:w-16 h-1 bg-[#cf0408] mb-6 md:mb-8"></div>

                <p className="text-gray-700 leading-relaxed text-sm sm:text-base md:text-lg whitespace-pre-line font-['Roboto']">
                  {modalProgram.description}
                </p>
              </div>

              {/* Desktop Navigation Buttons */}
              <div className="hidden md:flex items-center justify-between pt-8 mt-8 border-t border-gray-200">
                <button
                  onClick={handlePrevModalProgram}
                  className="flex items-center gap-3 text-gray-500 hover:text-[#cf0408] transition-colors group font-['Inter']"
                >
                  <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center group-hover:border-[#cf0408] transition-colors bg-white shadow-sm">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold uppercase tracking-wider">
                    Previous
                  </span>
                </button>

                <button
                  onClick={handleNextModalProgram}
                  className="flex items-center gap-3 text-gray-500 hover:text-[#cf0408] transition-colors group font-['Inter']"
                >
                  <span className="text-sm font-bold uppercase tracking-wider">
                    Next
                  </span>
                  <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center group-hover:border-[#cf0408] transition-colors bg-white shadow-sm">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default About;
