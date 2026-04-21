"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import EmptyState from '../components/EmptyState';
import PageLoader from '../components/PageLoader';
import { getApiUrl } from '../config/api';
import { generateTeacherSlug } from '../services/teachersService';

export default function HomePage() {
  // Hero images array (from public directory)
  const heroImages = [
    '/hero_1.png',
    '/hero_2.png',
    '/hero_3.png',
    '/hero_4.png',
    '/hero_5.jpeg',
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  type Artist = { artist_id: number; full_name: string; profile_image: string; stage_name?: string; slug?: string };
  type Course = { id: number; title: string; course_name: string; description: string; image_url: string; slug?: string };
  type Teacher = { teacher_id: number; full_name: string; profile_image: string; specialization: string; slug?: string };
  type Offer = { id: number; title: string; description: string; image_url?: string; slug?: string; cta_link?: string; cta_text?: string };
  type HomeData = { artists: Artist[]; courses: Course[]; teachers: Teacher[]; offers: Offer[] };

  const [data, setData] = useState<HomeData | null>(null);
  const [error, setError] = useState<null | boolean>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchHomeData = async () => {
      try {
        // Use Promise.allSettled to handle partial failures gracefully
        const results = await Promise.allSettled([
          fetch(getApiUrl('/api/artists'), { cache: 'no-store', signal: abortController.signal }).then(r => r.json()),
          fetch(getApiUrl('/api/courses'), { cache: 'no-store', signal: abortController.signal }).then(r => r.json()),
          fetch(getApiUrl('/api/teachers'), { cache: 'no-store', signal: abortController.signal }).then(r => r.json()),
          fetch(getApiUrl('/api/offers?limit=3'), { cache: 'no-store', signal: abortController.signal }).then(r => r.json()),
        ]);

        // Extract data from results, using empty arrays as fallback for failed requests
        const [artistsResult, coursesResult, teachersResult, offersResult] = results;
        
        const artists = artistsResult.status === 'fulfilled' ? artistsResult.value : [];
        const courses = coursesResult.status === 'fulfilled' ? coursesResult.value : [];
        const teachers = teachersResult.status === 'fulfilled' ? teachersResult.value : [];
        const offers = offersResult.status === 'fulfilled' ? offersResult.value : [];

        // Only show error if ALL requests failed
        const allFailed = results.every(result => result.status === 'rejected');
        
        if (allFailed) {
          setError(true);
        } else {
          setData({ artists, courses, teachers, offers });
          setError(null);
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(true);
        }
      }
    };

    fetchHomeData();

    return () => {
      abortController.abort();
    };
  }, []);

  if (error) {
    return <EmptyState title="Failed to load" description="Could not fetch homepage data." />;
  }
  if (!data) {
    return <PageLoader message="Loading homepage content..." />;
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section with Carousel */}
      <section className="relative h-[60vh] overflow-hidden pt-165">
          <img
            key={heroImages[currentIndex]}
            src={heroImages[currentIndex]}
            alt="Sadhana Kala Kendra hero"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50"></div>
          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 font-Inter text-white drop-shadow-2xl">Sadhana Kala Kendra</h1>
            <p className="text-lg md:text-2xl font-Roboto text-red-100 max-w-3xl mb-10 drop-shadow-md">Where Tradition Meets Talent: Nurturing the Future of Nepalese Arts</p>
            <a
              href="/register"
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-10 rounded-full text-lg shadow-xl transition duration-300 transform hover:scale-105 font-['Inter']"
            >
              Enroll Now
            </a>
          </div>
        </section>

        {/* --- Horizontal Rule added for better visual separation --- */}
        <hr className="border-t border-red-500/30" />

        {/* ================= ABOUT SECTION ================= */}
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
                  src="/logo.png"
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
                With over three decades of experience, we've helped thousands of
                students master instruments, vocals, and dance. Our expert
                instructors and vibrant community have made us one of Nepal's most
                trusted and respected music schools.
              </p>

              {/* Button */}
              <a
                href="/about"
                className="inline-block bg-[#191938] hover:bg-red-600 text-white font-semibold py-3 px-10 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 font-['Inter']"
              >
                Learn More
              </a>
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
                  src="/about_section_video.mp4"
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
        {data.offers?.length > 0 && <hr className="border-t border-gray-200" />}

        {/* ================= OFFERS SECTION ================= */}
        {data.offers?.length > 0 && <hr className="border-t border-gray-200" />}
        {data.offers?.length > 0 && (
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
              <div className="text-center mb-14">
                <h2 className="text-4xl md:text-5xl font-extrabold text-[#0f0f50] mb-4 font-Inter">
                  Latest <span className="text-red-600">Offers</span>
                </h2>
                <p className="text-gray-600 text-lg md:text-xl font-['Roboto']">
                  Top offers curated for current students and new applicants.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.offers.map((offer, idx) => {
                  const offerCardContent = (
                    <>
                      <div className="h-52 overflow-hidden bg-gray-100">
                        {offer.image_url ? (
                          <img 
                            src={getApiUrl(offer.image_url)} 
                            alt={offer.title} 
                            loading="lazy" 
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/logo.png'; // Fallback to logo
                            }}
                          />
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                            <img src="/logo.png" alt="Fallback" className="w-12 h-12 opacity-20 mb-2" />
                            <span className="text-xs">No image available</span>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="text-2xl font-bold mb-1 text-[#191938] font-Inter line-clamp-2">{offer.title}</h3>
                        <p className="text-gray-700 mb-4 font-Roboto line-clamp-3">{offer.description}</p>
                        <div className="mt-5 flex items-center justify-between gap-3">
                          {offer.slug ? (
                            <span className="text-indigo-700 group-hover:text-indigo-900 font-semibold">View Details</span>
                          ) : <span></span>}
                          {offer.cta_link && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(offer.cta_link, '_blank');
                              }} 
                              className="inline-block bg-[#191938] hover:bg-red-600 text-white font-semibold py-2 px-5 rounded-full transition-all duration-300"
                            >
                              {offer.cta_text || "Know More"}
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  );

                  return offer.slug ? (
                    <Link
                      key={offer.id ? `${offer.id}-${offer.slug}` : idx}
                      href={`/offers/${offer.slug}`}
                      className="group block bg-white border border-gray-200 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 overflow-hidden text-left"
                    >
                      {offerCardContent}
                    </Link>
                  ) : (
                    <div
                      key={offer.id ? `${offer.id}-${idx}` : idx}
                      className="bg-white border border-gray-200 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 overflow-hidden text-left"
                    >
                      {offerCardContent}
                    </div>
                  );
                })}
              </div>
              <div className="text-center mt-12">
                <a href="/offers" className="text-red-600 font-bold underline text-lg hover:text-red-800 transition duration-200 font-Inter">See All Offers</a>
              </div>
            </div>
          </section>
        )}

        {/* ================= ARTISTS SECTION ================= */}
        <hr className="border-t border-gray-200" />
        <section className="py-20 bg-red-50/25 font-Roboto">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-[#0f0f50] mb-4 font-Inter">The Pride of <span className="text-red-600 font-Inter">Sadhana Kala Kendra</span></h2>
              <p className="text-gray-600 text-lg md:text-xl font-Roboto">Celebrating the talented artists who began their journey with us</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.artists?.length > 0 ? (
                data.artists.slice(0, 6).map((artist) => (
                  <div key={artist.artist_id} className={`bg-white border border-gray-200 p-0 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 overflow-hidden text-left ${artist.slug ? "cursor-pointer" : ""}`}>
                    <div className="h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
                      {artist.profile_image ? (
                        <img 
                          src={getApiUrl(artist.profile_image)} 
                          alt={artist.full_name} 
                          loading="lazy" 
                          className="w-full h-full object-contain transition-transform duration-500 hover:scale-105" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/logo.png';
                          }}
                        />
                      ) : (
                        <img src="/logo.png" alt="Fallback" className="w-20 h-20 opacity-20" />
                      )}
                    </div>
                    <div className="p-6 text-center">
                      <h3 className="text-2xl font-bold mb-1 text-[#191938] font-Inter line-clamp-2">{artist.full_name}</h3>
                      {artist.stage_name && <p className="text-gray-600 mb-4 font-Roboto">{artist.stage_name}</p>}
                      {artist.slug && (
                        <a href={`/artists/${artist.slug}`} className="text-indigo-700 hover:text-indigo-900 font-semibold inline-block">View Details</a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState title="No Artists Found" description="Check back soon for featured artists and alumni updates." />
              )}
            </div>
            <div className="text-center mt-12">
              <a href="/artists" className="text-red-600 font-bold underline text-lg hover:text-red-800 transition duration-200 font-Inter">See All Artists</a>
            </div>
          </div>
        </section>

        {/* ================= COURSES SECTION ================= */}
        <hr className="border-t border-gray-200" />
        <section className="py-20 bg-white font-Roboto">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-[#0f0f50] mb-4 font-Inter">Explore Our Featured <span className="text-red-600">Courses</span></h2>
              <p className="text-gray-600 text-lg md:text-xl font-Roboto">Explore musical programs built to develop technique, expression, and artistic growth</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.courses?.length > 0 ? (
                data.courses.slice(0, 6).map((course, idx) => (
                  <div key={course.id ? `${course.id}-${course.slug || idx}` : idx} className={`bg-white border border-gray-200 p-0 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 overflow-hidden text-left ${course.slug ? "cursor-pointer" : ""}`}>
                    <div className="h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
                      {course.image_url ? (
                        <img 
                          src={getApiUrl(course.image_url)} 
                          alt={course.course_name} 
                          loading="lazy" 
                          className="w-full h-full object-contain transition-transform duration-500 hover:scale-105" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/logo.png';
                          }}
                        />
                      ) : (
                        <img src="/logo.png" alt="Fallback" className="w-20 h-20 opacity-20" />
                      )}
                    </div>
                    <div className="p-6 text-center">
                      <h3 className="text-2xl font-bold mb-3 text-[#191938] font-Inter">{course.course_name}</h3>
                      <p className="text-gray-700 mb-4 font-Roboto line-clamp-3">{course.description}</p>
                      {course.slug && (
                        <a href={`/courses/${course.slug}`} className="text-indigo-700 hover:text-indigo-900 font-semibold inline-block">View Details</a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState title="No Courses Found" description="Please check back soon for our latest class offerings." />
              )}
            </div>
            <div className="text-center mt-12">
              <a href="/courses" className="text-red-600 font-bold underline text-lg hover:text-red-800 transition duration-200 font-Inter">See All Courses</a>
            </div>
          </div>
        </section>

        {/* ================= TEACHERS SECTION ================= */}
        <hr className="border-t border-gray-200" />
        <section className="py-20 bg-red-50/25 font-Roboto">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-[#0f0f50] mb-4 font-Inter">Meet Our Expert <span className="text-red-600">Teachers</span></h2>
              <p className="text-gray-600 text-lg md:text-xl font-Roboto">Our dedicated team of accomplished musicians and experienced educators are ready to guide your artistic development</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.teachers?.length > 0 ? (
                data.teachers.slice(0, 3).map((teacher) => {
                  let imgUrl = teacher.profile_image;
                  if (imgUrl && !/^https?:\/\//.test(imgUrl)) {
                    imgUrl = getApiUrl(imgUrl.startsWith("/") ? imgUrl : "/" + imgUrl);
                  }
                  const teacherSlug = teacher.slug || generateTeacherSlug(teacher.full_name);
                  return (
                    <div key={teacher.teacher_id} className="bg-white border border-gray-200 p-0 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 overflow-hidden text-left">
                      <div className="h-48 overflow-hidden bg-gray-100">
                        <img src={imgUrl} alt={teacher.full_name} loading="lazy" className="w-full h-full object-contain transition-transform duration-500 hover:scale-105" />
                      </div>
                      <div className="p-6 text-center">
                        <h3 className="text-2xl font-bold text-[#191938] mb-2 font-Inter">{teacher.full_name}</h3>
                        <p className="text-gray-600 mb-4 font-Roboto">{teacher.specialization}</p>
                        <a href={`/teachers/${teacherSlug}`} className="text-indigo-700 hover:text-indigo-900 font-semibold inline-block">View Details</a>
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState title="No Teachers Found" description="Please check back soon for faculty updates." />
              )}
            </div>
            <div className="text-center mt-12">
              <a href="/teachers" className="text-red-600 font-bold underline text-lg hover:text-red-800 transition duration-200 font-Inter">See All Teachers</a>
            </div>
          </div>
        </section>

        {/* ================= LOCATION SECTION ================= */}
        <hr className="border-t border-gray-200 my-0" />
        <section className="py-24 bg-linear-to-b from-white to-gray-50 font-Roboto">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-extrabold text-[#0f0f50] mb-4 font-Inter drop-shadow-sm">Our <span className="text-red-600">Location</span></h2>
              <p className="text-gray-700 text-xl md:text-2xl font-Roboto font-medium mb-2">Visit us at our Center in Kathmandu, Nepal</p>
            </div>
            <div className="w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-2xl border-4 border-white mb-8">
              <iframe
                title="Sadhana Kala Kendra Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.023786510191!2d85.315569!3d27.708368!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb1907b0ce6945%3A0xff0752eee7ced509!2sSadhana%20Kala%20Kendra!5e0!3m2!1sen!2snp!4v1700092400000!5m2!1sen!2snp"
                width="100%"
                height="100%"
                className="border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
            <div className="text-center mt-6 space-y-2">
              <p className="text-gray-800 font-Roboto text-lg md:text-xl font-semibold">📍 Near Ghantaghar, Kamaladi, Kathmandu</p>
              <p className="text-gray-700 font-Roboto text-base md:text-lg">☎️ 01-4540228, 9851023576 &nbsp; | &nbsp; ✉️ sadhananepal25@gmail.com</p>
            </div>
          </div>
        </section>
      </main>
  );
}

export const dynamic = 'force-dynamic';
