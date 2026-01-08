import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import api, { SERVER_ROOT_URL } from "../services/api";
import {
  getAllArtists,
  createArtist,
  updateArtist,
  deleteArtist,
} from "../services/artistsService"; // Note: Service functions updated to handle FormData

// --- Shared Components ---

// Component for displaying temporary messages
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

// --- Artist Form Component ---

// Added serverRootUrl prop
const ArtistForm = ({
  artist,
  onSubmit,
  onCancel,
  isSaving,
  serverRootUrl,
}) => {
  const [formData, setFormData] = useState({
    full_name: artist?.full_name || "",
    bio: artist?.bio || "",
  });

  // State to hold the selected file object
  const [profileImageFile, setProfileImageFile] = useState(null);

  // Calculate initial URL using the passed prop
  const initialImageUrl = artist?.profile_image
    ? serverRootUrl + artist.profile_image
    : "";
  const [imagePreviewUrl, setImagePreviewUrl] = useState(initialImageUrl);

  // Reset URL preview when component mounts/unmounts or artist changes
  useEffect(() => {
    // Recalculate preview URL when a new artist is selected for editing
    setImagePreviewUrl(
      artist?.profile_image ? serverRootUrl + artist.profile_image : ""
    );
    setProfileImageFile(null); // Clear file input when switching artists

    return () => {
      // Cleanup function for local file URL preview
      if (profileImageFile) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [artist, serverRootUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfileImageFile(file);

    if (file) {
      // Create a local URL for file preview
      const localUrl = URL.createObjectURL(file);
      setImagePreviewUrl(localUrl);
    } else {
      // If file is cleared, revert to existing image (if editing) or empty string
      setImagePreviewUrl(
        artist?.profile_image ? serverRootUrl + artist.profile_image : ""
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pass both form data and the file object to the parent for FormData construction
    onSubmit({ ...formData, profileImageFile });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 md:p-8 rounded-lg shadow-xl border border-gray-100 font-roboto"
    >
      <h3 className="text-xl font-playfair font-bold mb-6 text-gray-800">
        {artist?.artist_id ? "Edit Artist" : "Add New Artist"}
      </h3>

      <div className="grid grid-cols-1 gap-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
          />
        </div>

        {/* Profile Image File Input (REDESIGNED) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Image
          </label>
          <div className="flex items-center space-x-4">
            {/* Custom styled file input button */}
            <label
              htmlFor="profile_image_upload"
              className="cursor-pointer bg-indigo-600 text-white font-medium py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 transition duration-150"
            >
              Choose File
            </label>
            {/* Hidden native input */}
            <input
              id="profile_image_upload"
              type="file"
              name="profile_image"
              onChange={handleFileChange}
              accept=".png,.jpg,.jpeg,.webp"
              className="hidden"
            />
            {/* Status text */}
            <span className="text-gray-500 text-sm">
              {profileImageFile?.name ||
                (artist?.profile_image && !profileImageFile
                  ? "Existing file chosen"
                  : "No file chosen")}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Only .png, .jpg, .jpeg, .webp files are allowed.
          </p>

          {/* Image Preview */}
          {imagePreviewUrl && (
            <div className="mt-3 p-2 border border-gray-200 rounded-md">
              <h4 className="text-xs font-semibold text-gray-600 mb-1">
                Preview:
              </h4>
              <img
                src={imagePreviewUrl}
                alt="Profile Preview"
                className="w-16 h-16 object-cover rounded-full border border-gray-300"
              />
            </div>
          )}
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Bio / Description
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows="4"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
          ></textarea>
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
            : artist?.artist_id
            ? "Save Changes"
            : "Add Artist"}
        </button>
      </div>
    </form>
  );
};

// --- Main AdminArtist Component ---

export default function AdminArtist() {
  const [artists, setArtists] = useState([]);
  const [editingArtist, setEditingArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Use centralized SERVER_ROOT_URL from api.js
  const serverRootUrl = SERVER_ROOT_URL;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllArtists();
      setArtists(data);
    } catch (err) {
      setError("Failed to fetch artists data. Please check connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFormSubmit = async ({ profileImageFile, ...data }) => {
    setIsSaving(true);
    setError(null);
    setMessage(null);

    // 1. Construct FormData for file upload
    const formData = new FormData();
    formData.append("full_name", data.full_name);
    formData.append("bio", data.bio || "");

    // 2. Append the file only if a new file is selected
    if (profileImageFile) {
      // 'profile_image' must match the expected field name in multer/backend
      formData.append("profile_image", profileImageFile);
    }

    try {
      if (editingArtist?.artist_id) {
        // For updates, we send FormData. Backend must be smart enough to keep old image if 'profile_image' is missing.
        await updateArtist(editingArtist.artist_id, formData);
        setMessage("Artist updated successfully!");
      } else {
        // For creation
        await createArtist(formData);
        setMessage("Artist created successfully!");
      }

      setEditingArtist(null); // Exit form view
      fetchData(); // Refresh list
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "An unknown error occurred while saving the artist.";
      setError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this artist?")) return;

    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      await deleteArtist(id);
      setMessage("Artist deleted successfully.");
      fetchData(); // Refresh list
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to delete artist.";
      setError(errorMsg);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingArtist(null);
    setError(null);
    setMessage(null);
  };

  const showForm = editingArtist !== null;

  return (
    <div className="container mx-auto p-4 md:p-8 lg:p-12 font-sans">
      {/* Page Title */}
      <h1 className="text-4xl lg:text-3xl font-playfair font-extrabold text-[#0f0f50] mb-8 border-b-4 border-indigo-300 pb-4 flex items-center">
        Manage Artists
      </h1>

      {/* Alerts */}
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

      {/* Form Area */}
      {showForm && (
        <div className="mb-8">
          <ArtistForm
            artist={editingArtist?.artist_id ? editingArtist : null}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            isSaving={isSaving}
            serverRootUrl={SERVER_ROOT_URL}
          />
        </div>
      )}

      {/* Add Artist Button */}
      {!showForm && (
        <button
          onClick={() => {
            setEditingArtist({});
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="mb-8 px-8 py-3 text-lg font-sans text-white font-semibold 
                       rounded-xl shadow-xl bg-indigo-600 
                       hover:bg-indigo-700 hover:scale-[1.02] transition"
        >
          + Add New Artist
        </button>
      )}

      {/* Loading State */}
      {loading && !showForm && (
        <div className="text-center py-10 font-roboto text-lg text-gray-600">
          Loading artists data...
        </div>
      )}

      {/* Data Table */}
      {!loading &&
        !error &&
        !showForm &&
        (artists.length > 0 ? (
          <div className="overflow-x-auto bg-white shadow-2xl rounded-2xl p-6 border border-gray-200 mt-6">
            <table className="min-w-full bg-white font-roboto">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-sans font-bold text-gray-700 uppercase tracking-wider">
                    Profile
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-sans font-bold text-gray-700 uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-sans font-bold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                    Bio (Snippet)
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-sans font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {artists.map((artist) => (
                  <tr
                    key={artist.artist_id}
                    className="hover:bg-indigo-50 transition duration-150"
                  >
                    {/* Profile Image */}
                    <td className="px-4 py-3">
                      {artist.profile_image ? (
                        <img
                          src={`${SERVER_ROOT_URL}${artist.profile_image}`}
                          alt={artist.full_name}
                          className="w-12 h-12 rounded-full object-cover shadow-md border border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-sm font-bold">
                          N/A
                        </div>
                      )}
                    </td>

                    {/* Name */}
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {artist.full_name}
                    </td>

                    {/* Bio */}
                    <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                      {artist.bio
                        ? `${artist.bio.substring(0, 50)}...`
                        : "No bio provided"}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-center text-sm font-medium space-x-3">
                      <button
                        onClick={() => setEditingArtist(artist)}
                        className="text-indigo-600 hover:text-indigo-900 px-3 py-2 rounded-lg 
                                                   hover:bg-indigo-100 transition duration-150 font-semibold"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(artist.artist_id)}
                        className="text-red-600 hover:text-red-900 px-3 py-2 rounded-lg 
                                                   hover:bg-red-100 transition duration-150 font-semibold"
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
          <p className="p-4 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200 font-roboto">
            No artists found. Click 'Add New Artist' to create one.
          </p>
        ))}

      {/* PUBLIC WEBSITE PREVIEW SECTION (unchanged) */}
      {/* DO NOT TOUCH — AS REQUESTED */}
      <div className="bg-indigo-900 py-12 px-4 sm:px-6 lg:px-8 border-t-8 border-indigo-600 mt-16">
        <div className="container mx-auto">
          <h2 className="text-4xl font-playfair font-bold text-white mb-10 text-center">
            Public Website Preview: Featured Artists
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {artists.length > 0 ? (
              artists.slice(0, 3).map((artist) => (
                <div
                  key={artist.artist_id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-2xl"
                >
                  {/* Image */}
                  <div className="overflow-hidden">
                    <img
                      src={
                        artist.profile_image
                          ? `${SERVER_ROOT_URL}${artist.profile_image}`
                          : "placeholder_image_url"
                      }
                      alt={artist.full_name}
                      className="w-full h-56 object-cover object-top transition-transform duration-500 hover:scale-105"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl text-center font-semibold text-[#0f0f50] mb-2">
                      {artist.full_name}
                    </h3>
                    <p className="text-gray-700 text-center mb-4 text-sm line-clamp-3">
                      {artist.bio || "No bio available."}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="lg:col-span-3 text-center p-8 bg-indigo-700 rounded-xl shadow-lg">
                <p className="text-lg text-indigo-100">
                  No artists available yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
