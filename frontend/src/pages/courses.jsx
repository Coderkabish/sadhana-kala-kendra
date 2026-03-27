import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getAllCourses } from "../admin/services/coursesService";
import { SERVER_ROOT_URL } from "../admin/services/api";
import Seo from "../components/Seo";
import PageLoader from "../components/PageLoader";
import EmptyState from "../components/EmptyState";

const Courses = () => {
  const [coursesList, setCoursesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const coursesData = await getAllCourses();
      setCoursesList(coursesData);
    } catch (err) {
      setError("Failed to load courses. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCourses();
  }, [fetchCourses]);

  const seoProps = {
    title: "Music and Dance Courses | Sadhana Kala Kendra Nepal",
    description:
      "Explore structured music, dance, and instrument courses at Sadhana Kala Kendra with experienced teachers, practical schedules, and performance-focused learning.",
    keywords:
      "music courses Nepal, dance courses Nepal, instrument training, vocal classes, performing arts courses, Sadhana Kala Kendra courses",
    canonicalPath: "/courses",
  };

  if (loading) {
    return (
      <>
        <Seo {...seoProps} />
        <PageLoader message="Loading courses content..." />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Seo {...seoProps} />
        <div className="min-h-screen flex items-center justify-center text-xl text-red-600">
          {error}
        </div>
      </>
    );
  }

  return (
    <section className="py-16 md:py-20 bg-gray-50 font-['Roboto']">
      <Seo {...seoProps} />
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl text-[#0f0f50] font-extrabold">
          Our <span className="text-[#cf0408]">Courses</span>
        </h1>
        <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
          All Types Of Dance, Vocal And Instruments Classes Are Based On the
          International Staff Notation
        </p>
        <p className="text-blue-700 text-base md:text-lg mt-4 underline underline-offset-4">
          Click on any course card to view full details.
        </p>
      </div>

      {coursesList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {coursesList.map((course) => (
            <Link
              key={course.course_id}
              to={course.slug ? `/courses/${course.slug}` : "/courses"}
              className="group cursor-pointer bg-white rounded-3xl shadow-md hover:shadow-2xl overflow-hidden transition-all duration-500 transform hover:-translate-y-2"
            >
              <div className="overflow-hidden">
                <img
                  src={course.image_url ? `${SERVER_ROOT_URL}${course.image_url}` : "placeholder_image_url"}
                  alt={course.course_name}
                  className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              <div className="p-8 text-center">
                <h3 className="text-2xl font-semibold text-[#191938] mb-3 font-['Playfair Display']">
                  {course.course_name}
                </h3>
                <p className="text-gray-600 mb-2">{course.description}</p>
                <span className="inline-block mt-3 text-indigo-700 font-semibold hover:text-indigo-900">
                  View Details
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4">
          <EmptyState
            title="No Courses Found"
            description="Please check back soon for our latest class offerings."
          />
        </div>
      )}
    </section>
  );
};

export default Courses;
