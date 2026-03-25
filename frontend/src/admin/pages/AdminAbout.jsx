import React, { useState, useEffect, useCallback } from "react";
import { SERVER_ROOT_URL } from "../services/api";
import {
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
} from "../services/aboutService";

const LucideIcon = ({ children }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">{children}</svg>
);

const Alert = ({ message, type, onClose }) => (
  <div className={`flex items-start md:items-center justify-between p-4 mb-6 rounded-xl border animate-in fade-in slide-in-from-top-4 duration-300 ${type === "error" ? "bg-red-50 border-red-200 text-red-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"}`}>
    <div className="flex items-center font-medium">
      <span className="shrink-0">{type === "error" ? "⚠️" : "✅"}</span>
      <span className="ml-3 text-sm md:text-base">{message}</span>
    </div>
    <button onClick={onClose} className="hover:opacity-70 transition-opacity text-xl leading-none ml-4">&times;</button>
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
  const profilePreviewUrl = formData.profile_image_file
    ? URL.createObjectURL(formData.profile_image_file)
    : formData.existing_profile_image
    ? `${SERVER_ROOT_URL}${formData.existing_profile_image}`
    : "";

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
            Profile Image {isImageRequired && <span className="text-red-500">*</span>}
          </label>

          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50">
            <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-white shadow-md bg-slate-200">
              {profilePreviewUrl ? (
                <img src={profilePreviewUrl} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Photo</div>
              )}
            </div>
            <label className="cursor-pointer bg-white px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 transition shadow-sm">
              {member?.bod_id ? "Change Photo" : "Upload Photo"}
              <input
                type="file"
                name="profile_image_file"
                className="hidden"
                onChange={handleFileChange}
                required={isImageRequired && !formData.profile_image_file}
                accept="image/*"
              />
            </label>
            <p className="text-[10px] text-slate-400 mt-3 uppercase tracking-tighter">JPG, PNG or WebP</p>
            {(formData.existing_profile_image || formData.profile_image_file) && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-sm text-red-600 underline mt-3"
              >
                Remove current image
              </button>
            )}
          </div>
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
    slug: program?.slug || "",
    description: program?.description || "",
    seo_title: program?.seo_title || "",
    seo_description: program?.seo_description || "",
    seo_keywords: program?.seo_keywords || "",
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
  const programPreviewUrl = formData.image_file
    ? URL.createObjectURL(formData.image_file)
    : formData.existing_image
    ? `${SERVER_ROOT_URL}${formData.existing_image}`
    : "";

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
            Slug (Optional)
          </label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            placeholder="annual-music-fest"
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
          <label className="block text-sm font-medium text-gray-700">
            SEO Title
          </label>
          <input
            type="text"
            name="seo_title"
            value={formData.seo_title}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            SEO Description
          </label>
          <textarea
            name="seo_description"
            rows="3"
            value={formData.seo_description}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            SEO Keywords
          </label>
          <input
            type="text"
            name="seo_keywords"
            value={formData.seo_keywords}
            onChange={handleChange}
            placeholder="music, culture, programs"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Program Image {isImageRequired && <span className="text-red-500">*</span>}
          </label>

          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50">
            <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-white shadow-md bg-slate-200">
              {programPreviewUrl ? (
                <img src={programPreviewUrl} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Photo</div>
              )}
            </div>
            <label className="cursor-pointer bg-white px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 transition shadow-sm">
              {program?.program_id ? "Change Photo" : "Upload Photo"}
              <input
                type="file"
                name="image_file"
                className="hidden"
                onChange={handleFileChange}
                required={isImageRequired && !formData.image_file}
                accept="image/*"
              />
            </label>
            <p className="text-[10px] text-slate-400 mt-3 uppercase tracking-tighter">JPG, PNG or WebP</p>
            {(formData.existing_image || formData.image_file) && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-sm text-red-600 underline mt-3"
              >
                Remove current image
              </button>
            )}
          </div>
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
  const memberPreviewUrl = formData.image_file
    ? URL.createObjectURL(formData.image_file)
    : formData.existing_image
    ? `${SERVER_ROOT_URL}${formData.existing_image}`
    : "";

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

          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50">
            <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-white shadow-md bg-slate-200">
              {memberPreviewUrl ? (
                <img src={memberPreviewUrl} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Photo</div>
              )}
            </div>
            <label className="cursor-pointer bg-white px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 transition shadow-sm">
              {member?.id ? "Change Photo" : "Upload Photo"}
              <input
                type="file"
                name="image_file"
                className="hidden"
                onChange={handleFileChange}
                required={isImageRequired && !formData.image_file}
                accept="image/*"
              />
            </label>
            <p className="text-[10px] text-slate-400 mt-3 uppercase tracking-tighter">JPG, PNG or WebP</p>
            {(formData.existing_image || formData.image_file) && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-sm text-red-600 underline mt-3"
              >
                Remove current image
              </button>
            )}
          </div>
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
    <div className="min-h-screen bg-[#f8fafc] pb-10 text-slate-900">
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-slate-200 mb-6 md:mb-10">
        <div className="container mx-auto px-4 sm:px-6 py-6 md:py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="text-left">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">About Console</h1>
              <p className="text-slate-500 text-sm md:text-base mt-1">Manage About Us, Programs, and Team Members.</p>
            </div>
            {!showForm && (
              <button
                onClick={() => {
                  if (activeTab === "bod") setEditingMember({});
                  if (activeTab === "programs") setEditingProgram({});
                  if (activeTab === "team") setEditingTeamMember({});
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="w-full md:w-auto inline-flex items-center justify-center px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
              >
                <LucideIcon><path d="M12 5v14M5 12h14" /></LucideIcon>
                Add {activeTab === "bod" ? "BOD Member" : activeTab === "programs" ? "Program" : "Team Member"}
              </button>
            )}
          </div>
          {!showForm && (
            <div className="flex gap-6 md:gap-10 mt-8 border-b border-slate-100 overflow-x-auto no-scrollbar">
              {[
                { key: "bod", label: "BOD" },
                { key: "programs", label: "Programs" },
                { key: "team", label: "Team" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); handleCancel(); }}
                  className={`pb-4 text-[11px] md:text-sm font-bold uppercase tracking-[0.15em] transition-all whitespace-nowrap relative ${activeTab === tab.key ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
                >
                  {tab.label}
                  {activeTab === tab.key && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full"></div>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6">
        {error && <Alert message={error} type="error" onClose={() => setError(null)} />}
        {message && <Alert message={message} type="success" onClose={() => setMessage(null)} />}

        {showForm ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-10 w-full max-w-4xl mx-auto">
            {activeTab === "bod" ? (
              <BODForm member={editingMember} onSubmit={handleFormSubmit} onCancel={handleCancel} isSaving={isSaving} />
            ) : activeTab === "programs" ? (
              <ProgramForm program={editingProgram} onSubmit={handleFormSubmit} onCancel={handleCancel} isSaving={isSaving} />
            ) : (
              <TeamMemberForm member={editingTeamMember} onSubmit={handleFormSubmit} onCancel={handleCancel} isSaving={isSaving} />
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-16 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-400 text-sm font-medium tracking-wide">Syncing records...</p>
              </div>
            ) : (
              <>
                {activeTab === "bod" && bodMembers.length > 0 && renderBODTable()}
                {activeTab === "bod" && bodMembers.length === 0 && (
                  <div className="p-16 md:p-24 text-center">
                    <div className="text-5xl md:text-6xl mb-4 grayscale opacity-50">👤</div>
                    <h3 className="text-lg md:text-xl font-bold text-slate-800">No BOD Members</h3>
                    <p className="text-slate-400 text-sm mt-1">No Board of Directors members found in the database.</p>
                  </div>
                )}
                {activeTab === "programs" && programs.length > 0 && renderProgramsTable()}
                {activeTab === "programs" && programs.length === 0 && (
                  <div className="p-16 md:p-24 text-center">
                    <div className="text-5xl md:text-6xl mb-4 grayscale opacity-50">🎯</div>
                    <h3 className="text-lg md:text-xl font-bold text-slate-800">No Programs</h3>
                    <p className="text-slate-400 text-sm mt-1">No Programs found in the database.</p>
                  </div>
                )}
                {activeTab === "team" && teamMembers.length > 0 && renderTeamMembersTable()}
                {activeTab === "team" && teamMembers.length === 0 && (
                  <div className="p-16 md:p-24 text-center">
                    <div className="text-5xl md:text-6xl mb-4 grayscale opacity-50">👥</div>
                    <h3 className="text-lg md:text-xl font-bold text-slate-800">No Team Members</h3>
                    <p className="text-slate-400 text-sm mt-1">No Team Members found in the database.</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
