import React, { useState, useEffect, useCallback } from "react";
import {
  getAllTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "../services/teachersService";
import { SERVER_ROOT_URL } from "../services/api";

const SERVER_BASE_URL = SERVER_ROOT_URL;

const Icons = {
  User: (props) => (
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
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

const Alert = ({ message, type, onClose }) => (
  <div
    className={`p-4 rounded-lg font-sans mb-4 ${
      type === "error"
        ? "bg-red-100 text-red-800 border border-red-400"
        : type === "success"
        ? "bg-green-100 text-green-800 border border-green-400"
        : "bg-blue-100 text-blue-800 border border-blue-400"
    }`}
  >
    {message}
    <button onClick={onClose} className="float-right font-bold ml-4">
      ×
    </button>
  </div>
);

const TeacherForm = ({ teacher, onSubmit, onCancel, isSaving }) => {
  const [formData, setFormData] = useState({
    full_name: teacher?.full_name || "",
    specialization: teacher?.specialization || "",
    profile_image_file: null,
    existing_profile_image: teacher?.profile_image || "",
  });

  const isNew = !teacher || Object.keys(teacher).length === 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      profile_image_file: e.target.files[0],
      existing_profile_image: e.target.files[0]
        ? null
        : prev.existing_profile_image,
    }));
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      profile_image_file: null,
      existing_profile_image: "",
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isFileRequired = isNew && !formData.existing_profile_image;

  const imageStatusText = formData.profile_image_file
    ? `New File: ${formData.profile_image_file.name}`
    : formData.existing_profile_image
    ? "Current Image Set"
    : "No Image Selected";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 md:p-8 rounded-xl shadow-2xl border border-gray-100 font-sans"
    >
      <h3 className="text-2xl font-playfair font-bold mb-6 text-gray-800 border-b pb-2">
        {isNew ? "Add New Teacher" : "Edit Teacher"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Specialization/Course
          </label>
          <input
            type="text"
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Image{" "}
            {isFileRequired && <span className="text-red-500">*</span>}
          </label>

          {(formData.existing_profile_image ||
            formData.profile_image_file ||
            isNew) && (
            <div className="relative mb-3 p-3 border border-gray-200 rounded-lg flex items-center justify-between bg-gray-50">
              <span className="text-sm font-sans text-gray-600 truncate">
                {imageStatusText}
              </span>
              {(formData.existing_profile_image ||
                formData.profile_image_file) && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-red-500 hover:text-red-700 text-sm font-semibold ml-4"
                >
                  <span className="hidden sm:inline">Remove/Clear</span>
                  <span className="sm:hidden">Clear</span>
                </button>
              )}
            </div>
          )}

          <input
            type="file"
            name="profile_image_file"
            onChange={handleFileChange}
            required={isFileRequired}
            className="mt-1 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
          />
          <p className="mt-1 text-xs text-gray-500">
            Maximum file size 5MB. Formats: .png, .jpg, .jpeg, .webp.
          </p>
        </div>
      </div>

      <div className="mt-8 flex justify-end space-x-3 font-sans">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className={`px-5 py-2 rounded-lg text-white font-semibold transition ${
            isSaving
              ? "bg-indigo-300 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 shadow-md"
          }`}
        >
          {isSaving ? "Saving..." : isNew ? "Add Teacher" : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

const TeacherCardPreview = ({ teacher }) => {
  const imageSrc = teacher.profile_image
    ? `${SERVER_BASE_URL}${teacher.profile_image}`
    : "https://via.placeholder.com/300x400?text=Teacher+Image";

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-2xl font-sans">
      <div className="overflow-hidden h-64">
        <img
          src={imageSrc}
          alt={teacher.full_name || "Teacher"}
          className="w-full aspect-[4/3] object-cover object-top transition-transform duration-500 hover:scale-105"
        />
      </div>

      <div className="p-6 text-center">
        <h3 className="text-2xl font-playfair font-bold text-[#0f0f50] mb-1">
          {teacher.full_name || "Teacher Name"}
        </h3>
        <p className="text-gray-600 font-semibold text-base">
          {teacher.specialization || "Specialization"}
        </p>
      </div>
    </div>
  );
};

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllTeachers();
      setTeachers(data);
    } catch (err) {
      setError("Failed to fetch teachers data. Please check connection.");
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
      if (editingTeacher && editingTeacher.teacher_id) {
        await updateTeacher(editingTeacher.teacher_id, formData);
        setMessage("Teacher updated successfully!");
      } else {
        await createTeacher(formData);
        setMessage("Teacher created successfully!");
      }

      setEditingTeacher(null);
      fetchData();
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
        "Are you sure you want to delete this teacher? This action is irreversible."
      )
    )
      return;

    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      await deleteTeacher(id);
      setMessage("Teacher deleted successfully.");
      fetchData();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to delete teacher.";
      setError(errorMsg);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingTeacher(null);
    setError(null);
    setMessage(null);
  };

  const showForm = editingTeacher !== null;

  const previewTeachers =
    teachers.length > 0
      ? teachers.slice(0, 3)
      : [
          {
            teacher_id: "preview",
            full_name: "Dr. Jane Doe",
            specialization: "Full Stack Development",
            profile_image:
              "https://via.placeholder.com/300x400?text=Placeholder+Teacher",
          },
        ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 md:p-8 lg:p-12 font-sans">
        <h1 className="text-4xl lg:text-3xl font-playfair font-extrabold text-[#0f0f50] mb-8 border-b-4 border-indigo-300 pb-4 flex items-center">
          <span className="text-indigo-600"></span> Manage Teachers
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

        {showForm && (
          <div className="mb-8">
            <TeacherForm
              teacher={editingTeacher}
              onSubmit={handleFormSubmit}
              onCancel={handleCancel}
              isSaving={isSaving}
            />
          </div>
        )}

        {!showForm && (
          <button
            onClick={() => {
              setEditingTeacher({});
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="mb-8 px-6 py-3 text-white font-semibold rounded-lg shadow-xl transition duration-150 font-sans bg-indigo-600 hover:bg-indigo-700 flex items-center"
          >
            <span className="text-xl mr-2">+</span> Add New Teacher
          </button>
        )}

        {loading && !showForm && (
          <div className="text-center py-10 font-sans text-lg text-gray-600">
            <svg
              className="animate-spin h-8 w-8 text-indigo-500 mx-auto mb-3"
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
            Loading teachers data...
          </div>
        )}

        {!loading &&
          !error &&
          !showForm &&
          (teachers.length > 0 ? (
            <div className="overflow-x-auto shadow-xl rounded-xl border border-gray-200 mt-6">
              <table className="min-w-full bg-white font-sans divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                      Specialization
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {teachers.map((teacher) => (
                    <tr
                      key={teacher.teacher_id}
                      className="hover:bg-indigo-50/50 transition duration-100"
                    >
                      <td className="px-4 py-3">
                        {teacher.profile_image ? (
                          <img
                            src={`${SERVER_BASE_URL}${teacher.profile_image}`}
                            alt={teacher.full_name}
                            className="w-10 h-10 rounded-full object-cover shadow-sm ring-1 ring-gray-100"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500 font-medium border border-gray-300">
                            No Img
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {teacher.full_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">
                        {teacher.specialization}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-medium space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => setEditingTeacher(teacher)}
                          className="text-indigo-600 hover:text-indigo-800 px-3 py-1 rounded-lg hover:bg-indigo-100 transition border border-indigo-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(teacher.teacher_id)}
                          className="text-red-600 hover:text-red-800 px-3 py-1 rounded-lg hover:bg-red-100 transition border border-red-200"
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
            <p className="p-6 bg-yellow-50 text-yellow-700 rounded-xl border border-yellow-200 font-sans text-center shadow-sm">
              No teachers found. Click **'+ Add New Teacher'** above to create
              one.
            </p>
          ))}
      </div>

      <div className="bg-indigo-900 py-12 px-4 sm:px-6 lg:px-8 border-t-8 border-indigo-600 mt-12">
        <div className="container mx-auto">
          <h2 className="text-4xl font-playfair font-bold text-white mb-10 text-center">
            Public Website Preview: Featured Teachers
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {teachers.length > 0 ? (
              previewTeachers.map((teacher) => (
                <TeacherCardPreview
                  key={teacher.teacher_id}
                  teacher={teacher}
                />
              ))
            ) : (
              <div className="lg:col-span-3 text-center p-8 bg-indigo-700 rounded-xl shadow-lg">
                <p className="text-lg font-sans text-indigo-100">
                  **Preview Mode:** Create teachers above to see their public
                  card.
                </p>
                <div className="mt-8">
                  <TeacherCardPreview
                    teacher={{
                      full_name: "Dr. Jane Doe",
                      specialization: "Full Stack Development",
                      profile_image:
                        "https://via.placeholder.com/300x400?text=Placeholder+Teacher",
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
