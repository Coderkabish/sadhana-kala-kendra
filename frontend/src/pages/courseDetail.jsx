import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { SERVER_ROOT_URL } from "../admin/services/api";
import Seo from "../components/Seo";

const asImage = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${SERVER_ROOT_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const CourseDetail = () => {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/courses/${slug}`);
        setCourse(data);
      } catch (err) {
        setError("Course not found.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-[#cf0408] mx-auto mb-4"></div>
          <p className="text-lg text-[#191938] font-semibold">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-[#191938] mb-2">Course Not Found</h1>
          <p className="text-gray-600 mb-6">The course you are looking for does not exist or may have been removed.</p>
          <Link
            to="/courses"
            className="inline-block bg-[#cf0408] hover:bg-[#a90306] text-white font-semibold px-6 py-3 rounded-full transition"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const title = course.seo_title || `${course.course_name} | Sadhana Kala Kendra`;
  const description = course.seo_description || course.description || "Course details";
  const hasPrice = course.price !== null && course.price !== undefined && course.price !== "";
  const hasSchedules = Array.isArray(course.schedules) && course.schedules.length > 0;

  const formatTime = (timeValue) => {
    if (!timeValue) return "";
    const [h, m] = String(timeValue).split(":");
    const hours = Number(h);
    const minutes = Number(m);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return String(timeValue);
    const suffix = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${String(minutes).padStart(2, "0")} ${suffix}`;
  };

  return (
    <>
      <Seo
        title={title}
        description={description}
        keywords={course.seo_keywords}
        canonicalPath={`/courses/${slug}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: course.course_name,
          description,
          provider: {
            "@type": "Organization",
            name: "Sadhana Kala Kendra",
          },
        }}
      />

      <section className="bg-gray-50 min-h-screen py-10 md:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link to="/courses" className="text-[#cf0408] font-semibold hover:underline">
              Back to all courses
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            {course.image_url ? (
              <div className="w-full h-64 md:h-96 bg-gray-100">
                <img
                  src={asImage(course.image_url)}
                  alt={course.course_name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}

            <div className="p-6 md:p-10">
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#191938] mb-3">{course.course_name}</h1>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-8">{course.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Instructor</p>
                  <p className="text-base font-semibold text-[#191938]">{course.teacher_name || "N/A"}</p>
                </div>
                <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Price</p>
                  <p className="text-base font-semibold text-[#191938]">
                    {hasPrice ? `NPR ${Number(course.price).toLocaleString()}` : "Price on request"}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Schedule Status</p>
                  <p className="text-base font-semibold text-[#191938]">
                    {hasSchedules ? `${course.schedules.length} schedule option(s)` : "No schedules yet"}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-5 bg-white mb-8">
                <h2 className="text-xl font-bold text-[#191938] mb-4">Scheduled Classes</h2>
                {hasSchedules ? (
                  <div className="space-y-3">
                    {course.schedules.map((schedule) => (
                      <div
                        key={schedule.schedule_id || `${schedule.class_day}-${schedule.start_time}-${schedule.end_time}`}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg bg-gray-50 px-4 py-3 border border-gray-100"
                      >
                        <p className="text-sm font-semibold text-gray-800">{schedule.class_day || "Day not set"}</p>
                        <p className="text-sm text-gray-600">
                          {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                          {schedule.teacher_name ? ` • ${schedule.teacher_name}` : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No schedules set for this course yet.</p>
                )}

                <p className="mt-4 text-sm font-medium text-[#191938] bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                  Note: Special classes are available upon request based on student needs..
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center bg-[#cf0408] hover:bg-[#a90306] text-white font-semibold px-6 py-3 rounded-full transition"
                >
                  Apply Now
                </Link>
                <Link
                  to="/courses"
                  className="inline-flex items-center justify-center border border-[#191938] text-[#191938] hover:bg-[#191938] hover:text-white font-semibold px-6 py-3 rounded-full transition"
                >
                  Explore More Courses
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CourseDetail;
