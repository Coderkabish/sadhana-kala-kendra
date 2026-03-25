import React, { useEffect, useState, useCallback } from "react";
import {
  getAllGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} from "../services/galleryService";
import { SERVER_ROOT_URL } from "../services/api";

const Alert = ({ message, type, onClose }) => (
  <div className={`flex items-start justify-between p-4 mb-6 rounded-xl border ${type === "error" ? "bg-red-50 border-red-200 text-red-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"}`}>
    <span className="font-medium text-sm">{message}</span>
    <button onClick={onClose} className="ml-4 text-xl leading-none">&times;</button>
  </div>
);

const GalleryForm = ({ item, onSubmit, onCancel, isSaving }) => {
  const [formData, setFormData] = useState({
    title: item?.title || "",
    image_file: null,
    existing_image_url: item?.image_url || "",
  });
  const [imagePreviewUrl, setImagePreviewUrl] = useState(
    item?.image_url ? `${SERVER_ROOT_URL}${item.image_url}` : ""
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, image_file: file, existing_image_url: prev.existing_image_url }));
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6"
    >
      <h2 className="text-2xl font-black text-slate-800">{item?.media_id ? "Edit Gallery Item" : "Add Gallery Item"}</h2>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full border border-slate-300 rounded-lg px-3 py-2"
          placeholder="Enter image title"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">Image</label>
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50">
          <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-white shadow-md bg-slate-200">
            {imagePreviewUrl ? (
              <img src={imagePreviewUrl} className="w-full h-full object-cover" alt="Preview" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Photo</div>
            )}
          </div>
          <label className="cursor-pointer bg-white px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 transition shadow-sm">
            {item?.media_id ? "Change Photo" : "Upload Photo"}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              required={!item?.media_id && !formData.existing_image_url}
            />
          </label>
          <p className="text-[10px] text-slate-400 mt-3 uppercase tracking-tighter">JPG, PNG or WebP</p>

          {formData.existing_image_url ? (
            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({ ...prev, existing_image_url: "", image_file: null }));
                setImagePreviewUrl("");
              }}
              className="text-sm text-red-600 underline mt-3"
            >
              Remove current image
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-slate-300">
          Cancel
        </button>
        <button disabled={isSaving} className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold disabled:opacity-60">
          {isSaving ? "Saving..." : item?.media_id ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
};

const AdminGallery = () => {
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllGalleryItems();
      setItems(data || []);
    } catch (err) {
      setError(err?.message || "Failed to load gallery items.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSubmit = async (formData) => {
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      if (editingItem?.media_id) {
        await updateGalleryItem(editingItem.media_id, formData);
        setMessage("Gallery item updated successfully.");
      } else {
        await createGalleryItem(formData);
        setMessage("Gallery item created successfully.");
      }
      setEditingItem(null);
      await fetchItems();
    } catch (err) {
      setError(err?.data?.message || err?.message || "Failed to save gallery item.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this gallery item?")) return;

    try {
      await deleteGalleryItem(id);
      setMessage("Gallery item deleted successfully.");
      await fetchItems();
    } catch (err) {
      setError(err?.data?.message || err?.message || "Failed to delete gallery item.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12">
      <div className="bg-white border-b border-slate-200 mb-8">
        <div className="container mx-auto px-6 py-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Gallery Management</h1>
            <p className="text-slate-500">Manage gallery images and titles</p>
          </div>
          {!editingItem ? (
            <button
              onClick={() => setEditingItem({})}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold"
            >
              Add Image
            </button>
          ) : null}
        </div>
      </div>

      <div className="container mx-auto px-6">
        {error ? <Alert message={error} type="error" onClose={() => setError(null)} /> : null}
        {message ? <Alert message={message} type="success" onClose={() => setMessage(null)} /> : null}

        {editingItem ? (
          <GalleryForm
            item={editingItem}
            onSubmit={handleSubmit}
            onCancel={() => setEditingItem(null)}
            isSaving={isSaving}
          />
        ) : loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">Loading gallery items...</div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500">No gallery images yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.media_id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <img src={`${SERVER_ROOT_URL}${item.image_url}`} alt={item.title || "Gallery"} className="w-full h-52 object-cover" />
                <div className="p-4">
                  <h3 className="font-bold text-slate-800 line-clamp-2">{item.title || "Untitled"}</h3>
                  <p className="text-xs text-slate-500 mt-1">{item.created_at ? new Date(item.created_at).toLocaleString() : ""}</p>
                  <div className="mt-4 flex justify-end gap-2">
                    <button onClick={() => setEditingItem(item)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm">Edit</button>
                    <button onClick={() => handleDelete(item.media_id)} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminGallery;
