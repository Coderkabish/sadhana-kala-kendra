import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getAllCourses } from "../admin/services/coursesService";
import { SERVER_ROOT_URL } from "../admin/services/api";
import {
  X,
  User,
  Calendar,
  Clock,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";

const formatTime12Hour = (timeString) => {
  if (!timeString) return "";
  try {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    const date = new Date(0, 0, 0, hours, minutes, seconds);

    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: minutes === 0 ? undefined : "numeric",
      hour12: true,
    }).format(date);
  } catch (e) {
    return timeString;
  }
};

const Courses = () => {
  const [coursesList, setCoursesList] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openScheduleIndex, setOpenScheduleIndex] = useState(null);

  const toggleSchedule = (index) => {
    setOpenScheduleIndex(openScheduleIndex === index ? null : index);
  };

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

  const formatScheduleDisplay = (schedule) => {
    const dayFrom = schedule.class_day_from || schedule.class_day;
    const dayTo = schedule.class_day_to;

    let dayDisplay = dayFrom;
    if (dayFrom && dayTo && dayFrom !== dayTo) {
      dayDisplay = `${dayFrom} to ${dayTo}`;
    }

    const formattedStartTime = formatTime12Hour(schedule.start_time);
    const formattedEndTime = formatTime12Hour(schedule.end_time);

    return {
      day: dayDisplay,
      time: `${formattedStartTime} - ${formattedEndTime}`,
      teacherName:
        schedule.teacher_name || selectedCourse.teacher_name || "Main Teacher",
      level: selectedCourse.level,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#cf0408] mx-auto mb-4"></div>
          <p className="text-xl text-[#191938] font-['Inter']">
            Loading Courses...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-red-600">
        {error}
      </div>
    );
  }

  const groupedSchedules = {};
  if (selectedCourse?.schedules) {
    selectedCourse.schedules.forEach((schedule) => {
      const details = formatScheduleDisplay(schedule);
      const day = details.day;

      if (!groupedSchedules[day]) {
        groupedSchedules[day] = [];
      }

      groupedSchedules[day].push({
        time: details.time,
        teacher:
          schedule.teacher_name ||
          selectedCourse.teacher_name ||
          "Main Teacher",
      });
    });
  }

  return (
    <section className="py-16 md:py-20 bg-gray-50 font-['Roboto'] ">
      {/* ====== HEADING SECTION ====== */}
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

      {/* ====== COURSES GRID OR EMPTY MESSAGE (Conditional Rendering) ====== */}
      {coursesList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {coursesList.map((course) => (
            <div
              key={course.course_id}
              className="group cursor-pointer bg-white rounded-3xl shadow-md hover:shadow-2xl overflow-hidden transition-all duration-500 transform hover:-translate-y-2"
              onClick={() => setSelectedCourse(course)}
            >
              {/* Image */}
              <div className="overflow-hidden">
                <img
                  src={
                    course.image_url
                      ? `${SERVER_ROOT_URL}${course.image_url}`
                      : "placeholder_image_url"
                  }
                  alt={course.course_name}
                  className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* Content */}
              <div className="p-8 text-center">
                <h3 className="text-2xl font-semibold text-[#191938] mb-3 font-['Playfair Display']">
                  {course.course_name}
                </h3>
                <p className="text-gray-600 mb-2">{course.description}</p>
                {course.slug ? (
                  <Link
                    to={`/courses/${course.slug}`}
                    className="inline-block mt-3 text-indigo-700 font-semibold hover:text-indigo-900"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Detials
                  </Link>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4">
          {/* Fallback: No Courses Message - Styled as requested */}
          <p className="col-span-full text-center text-gray-700 text-lg p-10 bg-yellow-50 rounded-lg font-['Roboto'] shadow-inner">
            <span className="text-xl font-bold block mb-2">
              {" "}
              No courses are currently listed !
            </span>
            Please check back soon for our latest class offerings.
          </p>
        </div>
      )}

      {/* ====== COURSE MODAL ====== */}
      {selectedCourse && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCourse(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-3xl w-full relative overflow-hidden max-h-[90vh] transform transition-all duration-300 scale-100 opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Image */}
            <div className="h-56 w-full relative bg-gray-200">
              <img
                src={
                  selectedCourse.image_url
                    ? `${SERVER_ROOT_URL}${selectedCourse.image_url}`
                    : "placeholder_image_url"
                }
                alt={selectedCourse.course_name}
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f50]/90 to-transparent p-6 flex flex-col justify-end">
                <h2 className="text-4xl font-extrabold text-white font-['Inter'] mb-1">
                  {selectedCourse.course_name}
                </h2>
              </div>
            </div>

            {/* Close Button */}
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-white text-gray-700 hover:bg-red-600 hover:text-white transition-colors duration-200 shadow-lg"
              onClick={() => setSelectedCourse(null)}
              aria-label="Close course details"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Content */}
            <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(90vh-14rem)]">
              {/* Overview */}
              <div className="mb-8 pb-6 border-b border-gray-100">
                <h3 className="flex items-center text-xl font-bold text-[#191938] mb-4 font-['Inter'] uppercase tracking-wider">
                  <BookOpen className="w-5 h-5 mr-3 text-[#cf0408]" />
                  Course Overview
                </h3>
                <p className="text-gray-700 leading-relaxed text-base">
                  {selectedCourse.description}
                </p>
              </div>

              {/* Instructor */}
              <div className="mb-8 pb-6 border-b border-gray-100">
                <h3 className="flex items-center text-xl font-bold text-[#191938] mb-4 font-['Inter'] uppercase tracking-wider">
                  <User className="w-5 h-5 mr-3 text-[#cf0408]" />
                  Lead Instructor
                </h3>
                <p className="text-gray-800 text-lg font-['Playfair Display']">
                  {selectedCourse.teacher_name || "Not Assigned"}
                </p>
              </div>

              {/* Schedules */}
              <h3 className="flex items-center text-xl font-bold text-[#191938] mb-4 font-['Inter'] uppercase tracking-wider border-b pb-2">
                <Calendar className="w-5 h-5 mr-3 text-[#cf0408]" />
                Available Schedules
              </h3>

              {selectedCourse.slug ? (
                <div className="mb-4">
                  <Link to={`/courses/${selectedCourse.slug}`} className="text-indigo-700 font-semibold hover:text-indigo-900">
                    Open dedicated detail route
                  </Link>
                </div>
              ) : null}

              <div className="space-y-3">
                {Object.keys(groupedSchedules).length === 0 ? (
                  <p className="text-gray-500 italic p-4 bg-gray-50 rounded-lg">
                    No schedules set for this course yet. Contact us for
                    details.
                  </p>
                ) : (
                  Object.entries(groupedSchedules).map(
                    ([day, sessions], index) => {
                      const isOpen = openScheduleIndex === index;
                      return (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
                        >
                          {/* Header */}
                          <button
                            onClick={() => toggleSchedule(index)}
                            className={`w-full p-4 flex items-center justify-between text-left transition-colors duration-200 ${
                              isOpen
                                ? "bg-[#0f0f50] text-white"
                                : "bg-gray-50 hover:bg-gray-100 text-[#191938]"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center">
                              <div
                                className={`font-bold text-base mr-4 ${
                                  isOpen ? "text-white" : "text-[#cf0408]"
                                }`}
                              >
                                {day}
                              </div>
                              <span
                                className={
                                  isOpen
                                    ? "text-gray-300 text-sm"
                                    : "text-gray-500 text-sm"
                                }
                              >
                                ({sessions.length} timing options available)
                              </span>
                            </div>
                            {isOpen ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>

                          {/* Content */}
                          <div
                            className={`p-4 transition-all duration-500 ${
                              isOpen
                                ? "max-h-96 opacity-100"
                                : "max-h-0 opacity-0"
                            }`}
                            style={{ maxHeight: isOpen ? "999px" : "0" }}
                          >
                            <div className="space-y-2">
                              {sessions.map((s, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-base text-gray-700 bg-white border border-dashed border-gray-200 px-3 py-2 rounded-md"
                                >
                                  <span className="font-['Playfair Display'] font-medium">
                                    {s.time}
                                  </span>
                                  <Clock className="w-4 h-4 text-[#cf0408]" />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )
                )}
              </div>

              {/* Apply Button */}
              <div className="mt-10 pt-6 border-t border-gray-100 text-center">
                <a
                  href="/register"
                  className="inline-flex items-center justify-center gap-3 bg-[#cf0408] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-[#a90306] transition duration-300 transform hover:scale-[1.02] active:scale-95 text-base uppercase tracking-wider font-['Inter']"
                >
                  Apply
                  <ArrowRight className="w-5 h-5" />
                </a>
                <p className="mt-3 text-sm text-gray-500">
                  Spaces are limited{" "}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Courses;
