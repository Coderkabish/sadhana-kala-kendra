import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { SERVER_ROOT_URL } from "../services/api";
import {
  // BOD CRUD
  getAllBOD,
  createBOD,
  updateBOD,
  deleteBOD,
  getAllPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  getAllTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  // >>> END - NEW TEAM MEMBERS CODE <<<
} from "../services/aboutService"; // Ensure Team Member functions are available in this service

const Alert = ({ message, type, onClose }) => (
  <div
    className={`p-4 rounded-lg font-roboto mb-4 ${
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

// --- 1. BOD Management Form (Inline) ---
const BODForm = ({ member, onSubmit, onCancel, isSaving }) => {
  const [formData, setFormData] = useState({
    name: member?.name || "",
    designation: member?.designation || "",
    bio: member?.bio || "",
    profile_image_file: null,
    existing_profile_image: member?.profile_image || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      profile_image_file: e.target.files[0],
      existing_profile_image: null,
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

  const isImageRequired = !member && !formData.existing_profile_image;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 md:p-8 rounded-lg shadow-xl border border-gray-100 font-roboto"
    >
      <h3 className="text-xl font-playfair font-bold mb-4 text-gray-800">
        {member?.bod_id ? "Edit BOD Member" : "Add New BOD Member"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Designation
          </label>
          <input
            type="text"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Biography/Details
          </label>
          <textarea
            name="bio"
            rows="4"
            value={formData.bio}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Image{" "}
            {isImageRequired && <span className="text-red-500">*</span>}
          </label>

          {(formData.existing_profile_image || formData.profile_image_file) && (
            <div className="relative mb-3 p-2 border border-gray-200 rounded-lg flex items-center justify-between">
              <span className="text-xs font-inter text-gray-600 truncate">
                {formData.profile_image_file
                  ? `New File: ${formData.profile_image_file.name}`
                  : "Current Image Set"}
              </span>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-red-500 hover:text-red-700 text-xs"
              >
                [Remove/Clear]
              </button>
            </div>
          )}

          <input
            type="file"
            name="profile_image_file"
            onChange={handleFileChange}
            required={isImageRequired && !formData.profile_image_file}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-3 font-inter">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className={`px-5 py-2 rounded-md text-white font-semibold ${
            isSaving ? "bg-indigo-300" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {isSaving
            ? "Saving..."
            : member?.bod_id
            ? "Save Changes"
            : "Add Member"}
        </button>
      </div>
    </form>
  );
};


const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
        // Handle common formats (like 'YYYY-MM-DD' or ISO strings 'YYYY-MM-DDT...')
        return dateString.split("T")[0]; 
    } catch (e) {
        return dateString;
    }
}; 

const ProgramForm = ({ program, onSubmit, onCancel, isSaving }) => {
  const [formData, setFormData] = useState({
    program_date: program?.program_date ? formatDateForInput(program.program_date) : "",    title: program?.title || "",
    description: program?.description || "",
    image_file: null,
    existing_image: program?.image_url || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      image_file: e.target.files[0],
      existing_image: null,
    }));
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      image_file: null,
      existing_image: "",
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isImageRequired = !program && !formData.existing_image;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 md:p-8 rounded-lg shadow-xl border border-gray-100 font-roboto"
    >
      <h3 className="text-xl font-bold mb-4 text-gray-800">
        {program?.program_id ? "Edit Program" : "Add New Program"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Program Date
          </label>
          <input
            type="date"
            name="program_date"
            value={formData.program_date}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            maxLength="150"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Program Image{" "}
            {isImageRequired && <span className="text-red-500">*</span>}
          </label>

          {(formData.existing_image || formData.image_file) && (
            <div className="relative mb-3 p-2 border border-gray-200 rounded-lg flex items-center justify-between">
              <span className="text-xs text-gray-600 truncate">
                {formData.image_file
                  ? `New File: ${formData.image_file.name}`
                  : "Current Image Set"}
              </span>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-red-500 hover:text-red-700 text-xs"
              >
                [Remove]
              </button>
            </div>
          )}

          <input
            type="file"
            name="image_file"
            onChange={handleFileChange}
            required={isImageRequired && !formData.image_file}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className={`px-5 py-2 rounded-md text-white font-semibold ${
            isSaving ? "bg-purple-300" : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          {isSaving
            ? "Saving..."
            : program?.program_id
            ? "Save Changes"
            : "Add Program"}
        </button>
      </div>
    </form>
  );
};

// >>> START - NEW TEAM MEMBERS CODE <<<
// --- TEAM MEMBERS FORM ---
const TeamMemberForm = ({ member, onSubmit, onCancel, isSaving }) => {
  const [formData, setFormData] = useState({
    name: member?.name || "",
    subtitle: member?.subtitle || "",
    description: member?.description || "",
    image_file: null,
    existing_image: member?.image_url || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      image_file: e.target.files[0],
      existing_image: null,
    }));
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      image_file: null,
      existing_image: "",
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isImageRequired = !member && !formData.existing_image;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 md:p-8 rounded-lg shadow-xl border border-gray-100 font-roboto"
    >
      <h3 className="text-xl font-bold mb-4 text-gray-800">
        {member?.id ? "Edit Team Member" : "Add New Team Member"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-3"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Subtitle
          </label>
          <input
            type="text"
            name="subtitle"
            value={formData.subtitle}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-3"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-3"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image {isImageRequired && <span className="text-red-500">*</span>}
          </label>

          {(formData.existing_image || formData.image_file) && (
            <div className="relative mb-3 p-2 border border-gray-200 rounded-lg flex items-center justify-between">
              <span className="text-xs text-gray-600 truncate">
                {formData.image_file
                  ? `New File: ${formData.image_file.name}`
                  : "Current Image Set"}
              </span>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-red-500 text-xs"
              >
                [Remove]
              </button>
            </div>
          )}

          <input
            type="file"
            name="image_file"
            onChange={handleFileChange}
            required={isImageRequired && !formData.image_file}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className={`px-5 py-2 rounded-md text-white font-semibold ${
            isSaving ? "bg-indigo-300" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {isSaving ? "Saving..." : member?.id ? "Save Changes" : "Add Member"}
        </button>
      </div>
    </form>
  );
};
// >>> END - NEW TEAM MEMBERS CODE <<<

// --- Main AdminAbout Component ---
export default function AdminAbout() {
  const [activeTab, setActiveTab] = useState("bod");

  // State for BOD
  const [bodMembers, setBodMembers] = useState([]);
  const [editingMember, setEditingMember] = useState(null);

  // State for Programs s
  const [programs, setPrograms] = useState([]);
  const [editingProgram, setEditingProgram] = useState(null);

  // State for Team Members
  const [teamMembers, setTeamMembers] = useState([]);
  const [editingTeamMember, setEditingTeamMember] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Use centralized SERVER_ROOT_URL from api.js
  const SERVER_BASE_URL = SERVER_ROOT_URL;

  const getErrorMessage = (err, defaultMsg) => {
    const status = err.response?.status;
    if (status === 400)
      return (
        err.response?.data?.error ||
        "Bad Request: Please check required fields."
      );
    if (status === 401)
      return "Unauthorized: Session expired or invalid token. Please log in.";
    if (status === 403) return "Access Denied: You do not have permission.";
    if (status === 404) return "Resource not found.";
    if (status === 500)
      return "Server Error: Could not connect to the database or internal error.";
    return err.response?.data?.error || defaultMsg;
  };

  // --- Data Fetching ---
  const fetchData = useCallback(async (tab) => {
    setLoading(true);
    setError(null);
    try {
      if (tab === "bod") {
        const data = await getAllBOD();
        setBodMembers(data);
        console.log("Fetched BOD Data:", data);
      } else if (tab === "programs") {
        const data = await getAllPrograms();
        setPrograms(data);
      }
      // >>>  - NEW TEAM MEMBERS CODE <<<
      else if (tab === "team") {
        const data = await getAllTeamMembers();
        setTeamMembers(data);
      }
      // >>> END - NEW TEAM MEMBERS CODE <<<
    } catch (err) {
      console.error(`Error fetching ${tab} data:`, err);
      setError(getErrorMessage(err, `Failed to fetch ${tab} data.`));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab, fetchData]);

  // --- General Handlers ---
  const handleFormSubmit = async (formData) => {
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      if (activeTab === "bod") {
        if (editingMember?.bod_id) {
          // Check for existing ID to determine update
          await updateBOD(editingMember.bod_id, formData);
          setMessage("BOD member updated successfully!");
        } else {
          // This is where the file upload logic is crucial
          await createBOD(formData);
          setMessage("BOD member created successfully!");
        }
        setEditingMember(null);
      } else if (activeTab === "programs") {
        if (editingProgram?.program_id) {
          await updateProgram(editingProgram.program_id, formData);
          setMessage("Program updated successfully!");
        } else {
          await createProgram(formData);
          setMessage("Program created successfully!");
        }
        setEditingProgram(null);
      }
      // >>> START - NEW TEAM MEMBERS CODE (handleFormSubmit) <<<
      else if (activeTab === "team") {
        if (editingTeamMember?.id) {
          await updateTeamMember(editingTeamMember.id, formData);
          setMessage("Team member updated successfully!");
        } else {
          await createTeamMember(formData);
          setMessage("Team member created successfully!");
        }
        setEditingTeamMember(null);
      }
      // >>> END - NEW TEAM MEMBERS CODE (handleFormSubmit) <<<

      fetchData(activeTab);
    } catch (err) {
      setError(
        getErrorMessage(err, "An unexpected error occurred during save.")
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        `Are you sure you want to delete this ${activeTab} record?`
      )
    )
      return;

    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (activeTab === "bod") {
        await deleteBOD(id);
      } else if (activeTab === "programs") {
        await deleteProgram(id);
      }
      // >>>  - NEW TEAM MEMBERS CODE (handleDelete) <<<
      else if (activeTab === "team") {
        await deleteTeamMember(id);
      }

      setMessage("Record deleted successfully.");
      fetchData(activeTab);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete record."));
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingMember(null);
    setEditingProgram(null);
    // >>> START - NEW TEAM MEMBERS CODE (handleCancel) <<<
    setEditingTeamMember(null);
    // >>> END - NEW TEAM MEMBERS CODE (handleCancel) <<<
    setError(null);
    setMessage(null);
  };

  // Conditional Rendering for Form/Table
  const isEditing =
    activeTab === "bod"
      ? editingMember?.bod_id
      : activeTab === "programs"
      ? editingProgram?.program_id
      : editingTeamMember?.id;

  const isAdding =
    activeTab === "bod"
      ? editingMember !== null && !editingMember.bod_id
      : activeTab === "programs"
      ? editingProgram !== null && !editingProgram.program_id
      : // >>> START - NEW TEAM MEMBERS CODE (isAdding) <<<
        editingTeamMember !== null && !editingTeamMember.id;
  // >>> END - NEW TEAM MEMBERS CODE (isAdding) <<<
  const showForm = isEditing || isAdding;

  // --- Inline Render Functions (No changes needed, keeping original styles) ---
  const renderBODTable = () => (
    <div className="overflow-x-auto shadow-md rounded-lg mt-6">
      <table className="min-w-full bg-white font-roboto">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Image
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
              Designation
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {bodMembers.map((member) => (
            <tr
              key={member.bod_id}
              className="hover:bg-gray-50 transition duration-100"
            >
              <td className="px-4 py-3">
                {member.profile_image ? (
                  <img
                    src={`${SERVER_BASE_URL}${member.profile_image}`}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                    No Img
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                {member.name}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">
                {member.designation}
              </td>
              <td className="px-4 py-3 text-center text-sm font-medium space-x-2">
                <button
                  onClick={() => setEditingMember(member)}
                  className="text-indigo-600 hover:text-indigo-900 px-2 py-1 rounded-md hover:bg-indigo-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(member.bod_id)}
                  className="text-red-600 hover:text-red-900 px-2 py-1 rounded-md hover:bg-red-50"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderProgramsTable = () => (
    <div className="overflow-x-auto shadow-md rounded-lg mt-6">
      <table className="min-w-full bg-white font-roboto">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Image
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Title
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
              Description Snippet
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {programs.map((program) => (
            <tr
              key={program.program_id}
              className="hover:bg-gray-50 transition duration-100"
            >
              <td className="px-4 py-3">
                {program.image_url ? (
                  <img
                    src={`${SERVER_BASE_URL}${program.image_url}`}
                    alt={program.title}
                    className="w-16 h-16 rounded object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                    No Img
                  </div>
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                {new Date(program.program_date).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                {program.title}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                {program.description?.substring(0, 70)}
                {program.description?.length > 70 ? "..." : ""}
              </td>
              <td className="px-4 py-3 text-center text-sm font-medium space-x-2">
                <button
                  onClick={() => setEditingProgram(program)}
                  className="text-purple-600 hover:text-purple-900 px-2 py-1 rounded-md hover:bg-purple-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(program.program_id)}
                  className="text-red-600 hover:text-red-900 px-2 py-1 rounded-md hover:bg-red-50"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // >>> START - NEW TEAM MEMBERS CODE (renderTeamMembersTable) <<<
  const renderTeamMembersTable = () => (
    <div className="overflow-x-auto shadow-md rounded-lg mt-6">
      <table className="min-w-full bg-white font-roboto">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Image
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
              Subtitle
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {teamMembers.map((member) => (
            <tr
              key={member.id}
              className="hover:bg-gray-50 transition duration-100"
            >
              <td className="px-4 py-3">
                {member.image_url ? (
                  <img
                    src={`${SERVER_BASE_URL}${member.image_url}`}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                    No Img
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                {member.name}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">
                {member.subtitle}
              </td>
              <td className="px-4 py-3 text-center text-sm font-medium space-x-2">
                <button
                  onClick={() => setEditingTeamMember(member)}
                  className="text-indigo-600 hover:text-indigo-900 px-2 py-1 rounded-md hover:bg-indigo-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="text-red-600 hover:text-red-900 px-2 py-1 rounded-md hover:bg-red-50"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  // >>> END - NEW TEAM MEMBERS CODE (renderTeamMembersTable) <<<

  return (
    <div className="container mx-auto p-4 md:p-8 lg:p-12 font-sans">
      <h1 className="text-4xl lg:text-3xl font-playfair font-extrabold text-[#0f0f50] mb-8 border-b-4 border-indigo-300 pb-4 flex items-center">
        Manage About Us Content
      </h1>

      <div className="mb-6">
        {error && (
          <Alert message={error} type="error" onClose={() => setError(null)} />
        )}
        {message && (
          <Alert
            message={message}
            type="success"
            onClose={() => setMessage(null)}
          />
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 font-semibold">
          <button
            onClick={() => {
              setActiveTab("bod");
              handleCancel();
            }}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition duration-150 ${
              activeTab === "bod"
                ? "border-indigo-500 text-indigo-600 font-sans"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Board of Directors (BOD)
          </button>
          <button
            onClick={() => {
              setActiveTab("programs"); // Changed from "journey"
              handleCancel();
            }}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition duration-150 ${
              activeTab === "programs"
                ? "border-purple-500 text-purple-600 font-sans"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Programs
          </button>
          {/* >>> START - NEW TEAM MEMBERS CODE (Tab Navigation Button) <<< */}
          <button
            onClick={() => {
              setActiveTab("team");
              handleCancel();
            }}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition duration-150 ${
              activeTab === "team"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Team Members
          </button>
          {/* >>> END - NEW TEAM MEMBERS CODE (Tab Navigation Button) <<< */}
        </nav>
      </div>

      {/* Form Area */}
      {showForm && (
        <div className="mb-8">
          {activeTab === "bod" ? (
            <BODForm
              member={editingMember}
              onSubmit={handleFormSubmit}
              onCancel={handleCancel}
              isSaving={isSaving}
            />
          ) : activeTab === "programs" ? (
            <ProgramForm
              program={editingProgram}
              onSubmit={handleFormSubmit}
              onCancel={handleCancel}
              isSaving={isSaving}
            />
          ) : (
            activeTab === "team" && (
              // >>> START - NEW TEAM MEMBERS CODE (Form Area) <<<
              <TeamMemberForm
                member={editingTeamMember}
                onSubmit={handleFormSubmit}
                onCancel={handleCancel}
                isSaving={isSaving}
              />
              // >>> END - NEW TEAM MEMBERS CODE (Form Area) <<<
            )
          )}
        </div>
      )}

      {/* Action Button */}
      {!showForm && (
        <button
          onClick={() => {
            // Pass an empty object to trigger 'Add' mode in Form components
            if (activeTab === "bod") setEditingMember({});
            if (activeTab === "programs") setEditingProgram({});
            // >>> START - NEW TEAM MEMBERS CODE (Action Button) <<<
            if (activeTab === "team") setEditingTeamMember({});
            // >>> END - NEW TEAM MEMBERS CODE (Action Button) <<<
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`mb-8 px-6 py-3 text-white font-semibold font-sans rounded-lg shadow-md transition duration-150 font-inter ${
            activeTab === "bod" || activeTab === "team" // Apply indigo style to BOD and Team
              ? "bg-indigo-600 hover:bg-indigo-700"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          + Add New{" "}
          {activeTab === "bod"
            ? "Member"
            : activeTab === "programs"
            ? "Milestone"
            : "Member"}
        </button>
      )}

      {/* Data Table */}
      {loading && !showForm && (
        <div className="text-center py-10 font-sans text-lg text-gray-600">
          Loading {activeTab} data...
        </div>
      )}

      {!loading && !error && !showForm && (
        <>
          {activeTab === "bod" && bodMembers.length > 0 && renderBODTable()}
          {activeTab === "bod" && bodMembers.length === 0 && (
            <p className="p-4 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200 font-sans">
              No Board of Directors members found. Click "Add New Member" to
              start.
            </p>
          )}

          {activeTab === "programs" &&
            programs.length > 0 &&
            renderProgramsTable()}
          {activeTab === "programs" && programs.length === 0 && (
            <p className="p-4 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200 font-roboto">
              No Programs found. Click "Add New Program" to start.
            </p>
          )}

          {/* >>> START - NEW TEAM MEMBERS CODE (Table Area) <<< */}
          {!loading &&
            !error &&
            !showForm &&
            activeTab === "team" &&
            teamMembers.length > 0 &&
            renderTeamMembersTable()}
          {!loading &&
            !error &&
            !showForm &&
            activeTab === "team" &&
            teamMembers.length === 0 && (
              <p className="p-4 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200 font-roboto">
                No Team Members found. Click "Add New Member" to start.
              </p>
            )}
          {/* >>> END - NEW TEAM MEMBERS CODE (Table Area) <<< */}
        </>
      )}
    </div>
  );
}
