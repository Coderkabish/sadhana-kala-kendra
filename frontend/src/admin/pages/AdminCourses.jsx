import React, { useState, useEffect, useCallback } from "react";
import api, { SERVER_ROOT_URL } from "../services/api"; // Use centralized api instance
import {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../services/coursesService";
import { getAllTeachers } from "../services/teachersService";

const Alert = ({ message, type, onClose }) => (
  <div
    className={`p-4 rounded-xl font-sans text-base mb-6 shadow-lg border-l-4 ${
      type === "error"
        ? "bg-red-100 border-red-500 text-red-800"
        : type === "success"
        ? "bg-emerald-100 border-emerald-500 text-emerald-800"
        : "bg-blue-100 border-blue-500 text-blue-800"
    }`}
  >
    <span className="font-medium">{message}</span>
    <button
      onClick={onClose}
      className="float-right font-bold ml-4 text-xl p-1 -mt-1 text-gray-700 hover:text-gray-900 transition-colors duration-150"
      aria-label="Close Alert"
    >
      &times;
    </button>
  </div>
);

const ScheduleManager = ({ schedules, setSchedules, mainTeacherName }) => {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const handleScheduleChange = (index, field, value) => {
    const newSchedules = [...schedules];

    newSchedules[index] = {
      ...newSchedules[index],
      [field]: value,
      teacher_name: newSchedules[index].teacher_name || mainTeacherName,
    };

    setSchedules(newSchedules);
  };

  const handleAddSchedule = () => {
    setSchedules([
      ...schedules,
      {
        class_day_from: "",
        class_day_to: "",
        start_time: "",
        end_time: "",
        teacher_name: mainTeacherName,
        teacher_id: null,
      },
    ]);
  };

  const handleRemoveSchedule = (index) => {
    const newSchedules = schedules.filter((_, i) => i !== index);
    setSchedules(newSchedules);
  };

  const getDayValue = (schedule, field) => {
    if (schedule[field]) return schedule[field];

    if (schedule.class_day) {
      const parts = schedule.class_day.split(" to ");
      if (parts.length === 2) {
        return field === "class_day_from"
          ? parts[0]
          : field === "class_day_to"
          ? parts[1]
          : "";
      } else if (field === "class_day_from" && parts.length === 1) {
        return parts[0];
      }
    }
    return "";
  };

  const inputClass =
    "w-full border border-gray-300 font-sans rounded-lg shadow-sm p-3 text-sm focus:ring-indigo-500 focus:border-indigo-500 transition disabled:bg-gray-50 disabled:cursor-not-allowed";
  const labelClass = "block text-sm font-sans font-medium text-gray-700 mb-1";

  return (
    <div className="border-2 border-indigo-200 p-6 rounded-2xl bg-indigo-50 mt-10 shadow-inner font-sans">
      <h4 className="text-2xl font-playfair font-bold mb-6 text-indigo-800 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 mr-3 text-indigo-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        Class Schedules
      </h4>

      <p className="text-sm font-sans text-gray-600 mb-6 p-3 bg-indigo-100 rounded-lg border border-indigo-200 shadow-sm">
        * Schedules are automatically assigned to the **Main Teacher** selected
        above.
      </p>

      <div className="space-y-4">
        {schedules.map((schedule, index) => (
          <div
            key={index}
            className="grid grid-cols-12 gap-3 p-4 border border-indigo-300 rounded-xl bg-white shadow-lg items-end"
          >
            <div className="col-span-6 md:col-span-3">
              <label className={labelClass}>From Day</label>
              <select
                value={getDayValue(schedule, "class_day_from")}
                onChange={(e) =>
                  handleScheduleChange(index, "class_day_from", e.target.value)
                }
                className={`${inputClass} appearance-none`}
                required
              >
                <option value="" disabled>
                  Select Day
                </option>
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-6 md:col-span-3">
              <label className={labelClass}>To Day</label>
              <select
                value={getDayValue(schedule, "class_day_to")}
                onChange={(e) =>
                  handleScheduleChange(index, "class_day_to", e.target.value)
                }
                className={`${inputClass} appearance-none`}
                required
              >
                <option value="" disabled>
                  Select Day
                </option>
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-6 md:col-span-2">
              <label className={labelClass}>Start Time</label>
              <input
                type="time"
                value={schedule.start_time || ""}
                onChange={(e) =>
                  handleScheduleChange(index, "start_time", e.target.value)
                }
                className={inputClass}
                required
              />
            </div>

            <div className="col-span-6 md:col-span-2">
              <label className={labelClass}>End Time</label>
              <input
                type="time"
                value={schedule.end_time || ""}
                onChange={(e) =>
                  handleScheduleChange(index, "end_time", e.target.value)
                }
                className={inputClass}
                required
              />
            </div>

            <div className="col-span-12 md:col-span-2 flex justify-end">
              <button
                type="button"
                onClick={() => handleRemoveSchedule(index)}
                className="p-3 bg-red-50 text-red-600 rounded-lg shadow-sm hover:bg-red-100 transition duration-150 border border-red-200 hover:shadow-md"
                aria-label="Remove schedule row"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddSchedule}
        className="mt-6 flex items-center px-5 py-2 text-base font-sans font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition duration-150 shadow-lg hover:shadow-xl"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add Schedule Row
      </button>
    </div>
  );
};

const CourseForm = ({ course, onSubmit, onCancel, isSaving, teachers }) => {
  const teacherNames = teachers.map((t) => t.full_name);

  const [formData, setFormData] = useState({
    title: course?.course_name || "",
    description: course?.description || "",
    level: course?.level || "",
    teacher_name: course?.teacher_name || "",
    course_image_file: null,
    existing_image_url: course?.image_url || "",
    schedules: course?.schedules || [],
  });

  const [schedules, setSchedules] = useState(course?.schedules || []);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, schedules }));
  }, [schedules]);

  useEffect(() => {
    const newTeacherName = formData.teacher_name;
    if (newTeacherName) {
      setSchedules((prevSchedules) =>
        prevSchedules.map((s) => ({
          ...s,
          teacher_name: s.teacher_name || newTeacherName,
        }))
      );
    }
  }, [formData.teacher_name]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      course_image_file: e.target.files[0],
      existing_image_url: null,
    }));
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      course_image_file: null,
      existing_image_url: "",
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isFileRequired = !course && !formData.existing_image_url;

  const imageStatusText = formData.course_image_file
    ? `New File: ${formData.course_image_file.name}`
    : formData.existing_image_url
    ? "Current Image Set"
    : "No Image Selected";

  const currentMainTeacherName = formData.teacher_name || "";

  const inputClass =
    "mt-2 block w-full border border-gray-300 font-sans rounded-lg shadow-sm p-3 text-base focus:ring-indigo-500 focus:border-indigo-500 transition disabled:bg-gray-50 disabled:cursor-not-allowed appearance-none";
  const labelClass = "block text-sm font-sans font-medium text-gray-700";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 md:p-10 rounded-2xl shadow-2xl border border-gray-200"
    >
      <h3 className="text-3xl font-playfair font-extrabold mb-8 text-gray-900 border-b-2 border-indigo-200 pb-4">
        {course ? "📝 Edit Course Details" : "✨ Add New Course"}
      </h3>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className={labelClass}>Course Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="Enter course title"
            />
          </div>

          <div>
            <label className={labelClass}>Level</label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className={`${inputClass} bg-white`}
              required
            >
              <option value="" disabled>
                ---Select level---
              </option>
              <option value="Basic">Basic</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <label className={labelClass}>
              Main Teacher <span className="text-red-500">*</span>
            </label>
            <select
              name="teacher_name"
              value={formData.teacher_name || ""}
              onChange={handleChange}
              className={`${inputClass} bg-white`}
              required
            >
              <option value="">-- Select Main Teacher --</option>
              {teacherNames.map((name, index) => (
                <option key={index} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className={inputClass}
              placeholder="A brief description of the course..."
            ></textarea>
          </div>
        </div>

        <div className="border border-dashed border-indigo-400 p-6 rounded-xl bg-indigo-50 shadow-inner">
          <label className="block text-xl font-playfair font-bold text-indigo-800 mb-3">
            🖼️ Course Image{" "}
            {isFileRequired && <span className="text-red-500">*</span>}
          </label>

          {(formData.existing_image_url || formData.course_image_file) && (
            <div className="relative mb-4 p-4 border border-indigo-300 rounded-xl flex items-center justify-between bg-white shadow-md">
              <span className="text-sm font-sans font-medium text-gray-700 truncate">
                {imageStatusText}
              </span>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-red-600 font-sans hover:text-red-700 text-sm font-semibold ml-4 p-2 rounded-lg hover:bg-red-50 transition"
              >
                Clear Image
              </button>
            </div>
          )}

          <input
            type="file"
            name="course_image_file"
            onChange={handleFileChange}
            required={isFileRequired}
            className="mt-1 block w-full text-sm text-gray-600 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-base file:font-sans file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 cursor-pointer shadow-sm"
          />
          <p className="mt-2 text-xs font-sans text-gray-500">
            Maximum file size 5MB. Formats: .png, .jpg, .jpeg, .webp.
          </p>
        </div>
      </div>

      <ScheduleManager
        schedules={schedules}
        setSchedules={setSchedules}
        mainTeacherName={currentMainTeacherName}
      />

      <div className="mt-10 flex justify-end space-x-4 border-t border-gray-200 pt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-sans font-semibold hover:bg-gray-100 transition shadow-md disabled:bg-gray-50 disabled:text-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className={`px-6 py-3 rounded-xl text-white font-sans font-semibold shadow-lg transition duration-150 flex items-center ${
            isSaving
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 transform hover:scale-[1.01]"
          }`}
        >
          {isSaving ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </>
          ) : course ? (
            "Save Changes"
          ) : (
            "Add Course"
          )}
        </button>
      </div>
    </form>
  );
};

const CourseCardPublicPreview = ({ course, SERVER_BASE_URL }) => {
  const placeholderImage =
    "https://via.placeholder.com/600x400?text=Course+Image";
  const imageUrl = course.image_url
    ? `${SERVER_BASE_URL}${course.image_url}`
    : placeholderImage;
  const levelColor =
    course.level === "Advanced"
      ? "text-rose-600 bg-rose-50 border-rose-200"
      : "text-emerald-600 bg-emerald-50 border-emerald-200";

  return (
    <div className="group cursor-pointer bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1 border border-gray-200">
      <div className="overflow-hidden">
        <img
          src={imageUrl}
          alt={course.course_name}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="p-6 space-y-3">
        <h3 className="text-xl font-playfair font-bold text-gray-900 leading-tight">
          {course.course_name || "Sample Course Title"}
        </h3>
        <p className="text-sm font-sans text-gray-600 line-clamp-2">
          {course.description ||
            "A brief and engaging description of the course content, designed to attract prospective students."}
        </p>
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <span
            className={`text-xs font-sans font-semibold px-3 py-1 rounded-full border ${levelColor}`}
          >
            {course.level || "Basic"}
          </span>
          <span className="text-sm font-sans text-indigo-700 font-bold">
            {course.teacher_name || "Teacher Name"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [editingCourse, setEditingCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Use centralized SERVER_ROOT_URL from api.js
  const SERVER_BASE_URL = SERVER_ROOT_URL;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [courseData, teacherData] = await Promise.all([
        getAllCourses(),
        getAllTeachers(),
      ]);
      setCourses(courseData);
      setTeachers(teacherData);
    } catch (err) {
      setError("Failed to fetch data. Please check connection and services.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFormSubmit = async (formData) => {
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      if (editingCourse && editingCourse.course_id) {
        await updateCourse(editingCourse.course_id, formData);
        setMessage("Course updated successfully!");
      } else {
        await createCourse(formData);
        setMessage("Course created successfully!");
      }

      setEditingCourse(null);
      await fetchData();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "An unknown error occurred.";
      setError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this course and all its associated schedules? This action is irreversible."
      )
    )
      return;

    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      await deleteCourse(id);
      setMessage("Course deleted successfully.");
      fetchData();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to delete course.";
      setError(errorMsg);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!isSaving) {
      setEditingCourse(null);
      setError(null);
      setMessage(null);
    }
  };

  const showForm = editingCourse !== null;

  const formatSchedule = (s) => {
    const dayDisplay = s.class_day || "N/A";
    const teacherDisplay = s.teacher_name || "Main";

    const timeDisplay =
      s.start_time && s.end_time
        ? `${s.start_time.substring(0, 5)}-${s.end_time.substring(0, 5)}`
        : "N/A";

    return `${dayDisplay} ${timeDisplay} (${teacherDisplay})`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 md:p-8 lg:p-12 font-sans">
        <h1 className="text-4xl lg:text-3xl font-playfair font-extrabold text-[#0f0f50] mb-8 border-b-4 border-indigo-300 pb-4 flex items-center">
          <span className="text-indigo-600"></span> Manage Courses
        </h1>

        <div className="mb-6">
          {error && (
            <Alert
              message={error}
              type="error"
              onClose={() => setError(null)}
            />
          )}
          {message && (
            <Alert
              message={message}
              type="success"
              onClose={() => setMessage(null)}
            />
          )}
        </div>

        {/* Form Area */}
        {showForm && (
          <div className="mb-12 transition-all duration-300">
            <CourseForm
              course={editingCourse}
              onSubmit={handleFormSubmit}
              onCancel={handleCancel}
              isSaving={isSaving}
              teachers={teachers}
            />
          </div>
        )}

        {/* Action Button */}
        {!showForm && (
          <button
            onClick={() => {
              setEditingCourse({ schedules: [] });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="mb-8 px-8 py-3 text-lg font-sans text-white font-semibold rounded-xl shadow-xl transition duration-200 bg-indigo-600 hover:bg-indigo-700 transform hover:scale-[1.02] active:scale-100 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add New Course
          </button>
        )}

        {/* Data Table */}
        {!showForm && (
          <div className="bg-white shadow-2xl rounded-2xl p-6 border border-gray-200">
            {loading && (
              <div className="text-center py-12 text-xl text-indigo-600 font-semibold flex justify-center items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-6 w-6 text-indigo-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading course data...
              </div>
            )}

            {!loading &&
              !error &&
              (courses.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white font-sans divide-y divide-gray-200">
                    <thead className="bg-gray-100 border-b-2 border-indigo-400">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-sans font-bold text-gray-700 uppercase tracking-wider rounded-tl-xl">
                          Image
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-sans font-bold text-gray-700 uppercase tracking-wider">
                          Course Title & Level
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-sans font-bold text-gray-700 uppercase tracking-wider hidden sm:table-cell">
                          Main Teacher
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-sans font-bold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                          Class Schedules
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-sans font-bold text-gray-700 uppercase tracking-wider rounded-tr-xl">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {courses.map((course) => (
                        <tr
                          key={course.course_id}
                          className="hover:bg-indigo-50 transition duration-150"
                        >
                          <td className="px-4 py-4">
                            {course.image_url ? (
                              <img
                                src={`${SERVER_BASE_URL}${course.image_url}`}
                                alt={course.course_name}
                                className="w-16 h-16 rounded-lg object-cover shadow-md border border-gray-200"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-xs text-gray-500 text-center leading-none p-2 font-semibold border-2 border-dashed border-gray-400">
                                No Image
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4 text-sm font-sans font-bold text-gray-900">
                            {course.course_name}
                            <span
                              className={`block text-xs font-sans font-medium mt-1 p-1 px-2 rounded-full w-fit ${
                                course.level === "Advanced"
                                  ? "bg-orange-100 text-orange-800 border border-orange-200"
                                  : "bg-green-100 text-green-800 border border-green-200"
                              }`}
                            >
                              {course.level}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm font-sans text-gray-700 hidden sm:table-cell font-medium">
                            {course.teacher_name || "N/A"}
                          </td>
                          <td className="px-4 py-4 text-sm font-sans text-gray-500 hidden lg:table-cell">
                            {course.schedules && course.schedules.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {course.schedules.map((s, i) => (
                                  <span
                                    key={i}
                                    className="bg-indigo-100 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full shadow-sm border border-indigo-200"
                                  >
                                    {formatSchedule(s)}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs font-sans font-semibold text-red-600 bg-red-100 p-1 px-2 rounded-full border border-red-300">
                                No Schedules Set
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-center text-sm font-sans font-medium space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setEditingCourse(course);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className="text-indigo-600 hover:text-indigo-900 px-3 py-2 rounded-lg hover:bg-indigo-100 transition duration-150 font-semibold"
                              aria-label={`Edit ${course.course_name}`}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(course.course_id)}
                              className="text-red-600 hover:text-red-900 px-3 py-2 rounded-lg hover:bg-red-100 transition duration-150 font-semibold"
                              aria-label={`Delete ${course.course_name}`}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="p-6 bg-yellow-100 text-yellow-800 rounded-xl border border-yellow-400 font-medium flex items-center shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-3 text-yellow-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.372 17c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  No courses found. Click 'Add New Course' above to create one.
                </p>
              ))}
          </div>
        )}
      </div>

      {/* PUBLIC WEBSITE PREVIEW SECTION */}
      <div className="bg-indigo-900 py-12 px-4 sm:px-6 lg:px-8 border-t-8 border-indigo-600 mt-12">
        <div className="container mx-auto">
          <h2 className="text-4xl font-playfair font-bold text-white mb-10 text-center">
            Public Website Preview: Featured Courses
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {courses.length > 0 ? (
              courses.slice(0, 3).map((course) => (
                <div
                  key={course.course_id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-2xl"
                >
                  {/* Course Image */}
                  <div className="overflow-hidden">
                    <img
                      src={
                        course.image_url
                          ? `${SERVER_BASE_URL}${course.image_url}`
                          : "placeholder_image_url"
                      }
                      alt={course.course_name}
                      className="w-full h-56 object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    <h3 className="text-2xl text-center font-semibold text-gray-900 mb-2">
                      {course.course_name}
                    </h3>
                    <p className="text-gray-600 text-center mb-4 text-sm line-clamp-3">
                      {course.description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="lg:col-span-3 text-center p-8 bg-indigo-700 rounded-xl shadow-lg">
                <p className="text-lg font-sans text-indigo-100">
                  No courses available yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
