import React, { useState, useEffect } from "react";
import RegisterService from "../admin/services/registerServices";
import { getAllCourses } from "../admin/services/coursesService";
import Seo from "../components/Seo";

// Icon for the registration page
const UserPlus = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 10h-6" />
    <path d="M19 7h6" />
  </svg>
);

const VisitorRegister = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    course_id: "",
    address: "",
    age: "",
    occupation: "",
    photo: null,
  });

  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await getAllCourses();
        setCourses(coursesData);
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    };
    fetchCourses();
  }, []);

  const sanitizeInput = (input) => {
    if (typeof input !== "string") return input;
    return input.trim().replace(/<\/?[^>]+(>|$)/g, "");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage("");
    setMessageType("");
  };

  const handlePhotoChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      photo: e.target.files[0] ? "photo-placeholder.jpg" : null,
    }));
  };

  const validateForm = () => {
    const { full_name, email, phone, course_id } = formData;

    if (!full_name || !email || !phone || !course_id) {
      setMessage("Please fill in the Full Name, Email, Course and Phone fields.");
      setMessageType("error");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Please enter a valid email address.");
      setMessageType("error");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    }

    const phoneRegex = /^\d{7,15}$/;
    if (!phoneRegex.test(phone.replace(/[^0-9]/g, ""))) {
      setMessage("Please enter a valid phone number (digits only, 7-15 length).");
      setMessageType("error");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage("");
    setMessageType("");

    const submissionData = {
      full_name: sanitizeInput(formData.full_name),
      email: sanitizeInput(formData.email),
      phone: sanitizeInput(formData.phone),
      course_id: parseInt(formData.course_id),
      address: sanitizeInput(formData.address),
      age: parseInt(formData.age) || null,
      occupation: sanitizeInput(formData.occupation),
      photo: formData.photo,
    };

    try {
      const response = await RegisterService.createPublicRegistration(submissionData);
      setMessage(response.message || "Registration completed successfully! We will contact you soon.");
      setMessageType("success");
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        course_id: "",
        address: "",
        age: "",
        occupation: "",
        photo: null,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Registration Error:", err);
      const errorMessage =
        err.response?.data?.message ||
        "An unexpected error occurred during registration. Please try again.";
      setMessage(errorMessage);
      setMessageType("error");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 font-['Roboto']">
      <Seo
        title="Student Registration | Join Sadhana Kala Kendra Programs"
        description="Register for music, dance, and instrument courses at Sadhana Kala Kendra by submitting your enrollment details and preferred training program online."
        keywords="Sadhana Kala Kendra registration, music class enrollment, dance course admission, student registration Nepal, performing arts admission"
        canonicalPath="/register"
      />
      <div className="container mx-auto max-w-2xl">
        {/* Title Section */}
        <h2 className="text-4xl md:text-5xl font-extrabold text-[#0f0f50] mb-4 font-['Inter']">
                        Student {''}  
                        <span className="text-red-600 font-['Playfair_Display']">
                            Enrollment Form
                        </span>
                    </h2>
        <p className="text-center text-gray-600 mb-8 text-lg">
          Join our community! Please provide your details and select your desired course to begin your musical journey. 
        </p>

        {/* Message Area */}
        {message && (
          <div
            className={`p-4 mb-6 rounded-lg text-sm font-medium transition duration-300 ${
              messageType === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 md:p-12 rounded-2xl shadow-2xl shadow-gray-200 space-y-8 border border-gray-100"
        >
          {/* Mandatory Fields */}
          <h2 className="text-xl font-semibold text-[#0f0f50] border-b border-teal-100 pb-3">Mandatory Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                id="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500 transition duration-150"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500 transition duration-150"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500 transition duration-150"
            />
          </div>

          <div>
            <label htmlFor="course_id" className="block text-sm font-medium text-gray-700">
              Select Course <span className="text-red-500">*</span>
            </label>
            <select
              name="course_id"
              id="course_id"
              value={formData.course_id}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500 transition duration-150 bg-white"
            >
              <option value="">-- Choose a Course --</option>
              {courses.map((course) => (
                <option key={course.course_id} value={course.course_id}>
                  {course.course_name}
                  {course.duration ? ` (${course.duration})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Optional Fields */}
          <h2 className="text-xl font-semibold text-[#0f0f50] border-b border-teal-100 pb-3 mt-8">Additional Information</h2>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              name="address"
              id="address"
              value={formData.address}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500 transition duration-150"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                Age
              </label>
              <input
                type="number"
                name="age"
                id="age"
                value={formData.age}
                onChange={handleChange}
                min="1"
                max="100"
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500 transition duration-150"
              />
            </div>

            <div>
              <label htmlFor="occupation" className="block text-sm font-medium text-gray-700">
                Occupation
              </label>
              <input
                type="text"
                name="occupation"
                id="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500 transition duration-150"
              />
            </div>
          </div>

          {/* Photo Input */}
          <div>
            <label htmlFor="photo" className="block text-sm font-medium text-gray-700">
              Photo (Optional)
            </label>
            <input
              type="file"
              name="photo"
              id="photo"
              onChange={handlePhotoChange}
              accept="image/*"
              className="mt-1 block w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
            />
            <p className="mt-1 text-xs text-gray-500">Max file size 2MB. Jpg, Png only.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center py-3 px-4 rounded-lg shadow-md text-lg font-semibold text-white transition duration-300 transform hover:scale-[1.01] ${
              loading
                ? "bg-teal-400 cursor-not-allowed"
                : "bg-blue-800 hover:bg-blue-950 focus:ring-4 focus:ring-teal-200"
            }`}
          >
            {loading ? (
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              "Submit Registration"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VisitorRegister;