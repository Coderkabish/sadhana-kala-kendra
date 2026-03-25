import React, { useEffect, useMemo, useState } from "react";
import {
  createOffer,
  deleteOffer,
  getAllOffersForAdmin,
  updateOffer,
} from "../services/offersService";
import { SERVER_ROOT_URL } from "../services/api";

const toFormModel = (offer = {}) => ({
  offer_id: offer.offer_id || null,
  title: offer.title || "",
  subtitle: offer.subtitle || "",
  description: offer.description || "",
  image_url: offer.image_url || "",
  cta_text: offer.cta_text || "",
  cta_link: offer.cta_link || "",
  valid_from: offer.valid_from ? new Date(offer.valid_from).toISOString().split("T")[0] : "",
  valid_to: offer.valid_to ? new Date(offer.valid_to).toISOString().split("T")[0] : "",
  seo_title: offer.seo_title || "",
  seo_description: offer.seo_description || "",
  seo_keywords: offer.seo_keywords || "",
  display_order: offer.display_order ?? 0,
  is_active: offer.is_active ?? 1,
});

const resolveImage = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const fixed = url.startsWith("/") ? url : `/${url}`;
  return `${SERVER_ROOT_URL}${fixed}`;
};

const AdminOffers = () => {
  const [offers, setOffers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(toFormModel());
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const imagePreview = useMemo(() => {
    if (imageFile) return URL.createObjectURL(imageFile);
    return resolveImage(formData.image_url);
  }, [formData.image_url, imageFile]);

  const fetchOffers = async () => {
    setLoading(true);
    setError("");
    try {
      const rows = await getAllOffersForAdmin();
      setOffers(Array.isArray(rows) ? rows : []);
    } catch {
      setError("Failed to load offers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    return () => {
      if (imageFile) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imageFile, imagePreview]);

  const startCreate = () => {
    setEditing({});
    setFormData(toFormModel());
    setImageFile(null);
    setMessage("");
    setError("");
  };

  const startEdit = (offer) => {
    setEditing(offer);
    setFormData(toFormModel(offer));
    setImageFile(null);
    setMessage("");
    setError("");
  };

  const cancelForm = () => {
    setEditing(null);
    setFormData(toFormModel());
    setImageFile(null);
  };

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const onSave = async (event) => {
    event.preventDefault();
    if (!formData.title.trim()) {
      setError("Title is required.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "offer_id") return;
      if (value !== undefined && value !== null) payload.append(key, value);
    });
    if (imageFile) {
      payload.append("image", imageFile);
    }

    try {
      if (formData.offer_id) {
        await updateOffer(formData.offer_id, payload);
        setMessage("Offer updated successfully.");
      } else {
        await createOffer(payload);
        setMessage("Offer created successfully.");
      }
      cancelForm();
      fetchOffers();
    } catch (err) {
      setError(err?.message || "Failed to save offer.");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this offer?")) return;
    try {
      await deleteOffer(id);
      setMessage("Offer deleted.");
      fetchOffers();
    } catch (err) {
      setError(err?.message || "Failed to delete offer.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-10 text-slate-900">
      <div className="bg-white border-b border-slate-200 mb-6 md:mb-10">
        <div className="container mx-auto px-4 sm:px-6 py-6 md:py-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">Offers Console</h1>
            <p className="text-slate-500 mt-1">Create and manage public offers with SEO metadata.</p>
          </div>
          {!editing && (
            <button
              onClick={startCreate}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
            >
              Add Offer
            </button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6">
        {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">{error}</div>}
        {message && <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">{message}</div>}

        {editing ? (
          <form onSubmit={onSave} className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="text-sm font-semibold">Title</label>
              <input name="title" value={formData.title} onChange={onChange} className="mt-1 w-full border border-slate-300 rounded-xl px-4 py-2.5" required />
            </div>

            <div>
              <label className="text-sm font-semibold">Subtitle</label>
              <input name="subtitle" value={formData.subtitle} onChange={onChange} className="mt-1 w-full border border-slate-300 rounded-xl px-4 py-2.5" />
            </div>

            <div>
              <label className="text-sm font-semibold">Display Order</label>
              <input name="display_order" type="number" value={formData.display_order} onChange={onChange} className="mt-1 w-full border border-slate-300 rounded-xl px-4 py-2.5" />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold">Description</label>
              <textarea name="description" rows="4" value={formData.description} onChange={onChange} className="mt-1 w-full border border-slate-300 rounded-xl px-4 py-2.5" />
            </div>

            <div>
              <label className="text-sm font-semibold">CTA Text</label>
              <input name="cta_text" value={formData.cta_text} onChange={onChange} className="mt-1 w-full border border-slate-300 rounded-xl px-4 py-2.5" />
            </div>

            <div>
              <label className="text-sm font-semibold">CTA Link</label>
              <input name="cta_link" value={formData.cta_link} onChange={onChange} className="mt-1 w-full border border-slate-300 rounded-xl px-4 py-2.5" />
            </div>

            <div>
              <label className="text-sm font-semibold">Valid From</label>
              <input name="valid_from" type="date" value={formData.valid_from} onChange={onChange} className="mt-1 w-full border border-slate-300 rounded-xl px-4 py-2.5" />
            </div>

            <div>
              <label className="text-sm font-semibold">Valid To</label>
              <input name="valid_to" type="date" value={formData.valid_to} onChange={onChange} className="mt-1 w-full border border-slate-300 rounded-xl px-4 py-2.5" />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold">SEO Title</label>
              <input name="seo_title" value={formData.seo_title} onChange={onChange} className="mt-1 w-full border border-slate-300 rounded-xl px-4 py-2.5" />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold">SEO Description</label>
              <textarea name="seo_description" rows="3" value={formData.seo_description} onChange={onChange} className="mt-1 w-full border border-slate-300 rounded-xl px-4 py-2.5" />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold">SEO Keywords</label>
              <input name="seo_keywords" value={formData.seo_keywords} onChange={onChange} placeholder="music school, offer, admission" className="mt-1 w-full border border-slate-300 rounded-xl px-4 py-2.5" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-3">Image</label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50">
                <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-white shadow-md bg-slate-200">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Offer preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Photo</div>
                  )}
                </div>
                <label className="cursor-pointer bg-white px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 transition shadow-sm">
                  {formData.offer_id ? "Change Photo" : "Upload Photo"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
                <p className="text-[10px] text-slate-400 mt-3 uppercase tracking-tighter">JPG, PNG or WebP</p>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="inline-flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" name="is_active" checked={Number(formData.is_active) === 1} onChange={onChange} />
                Active offer
              </label>
            </div>

            <div className="md:col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={cancelForm} className="px-6 py-2.5 border border-slate-300 rounded-xl font-semibold">Cancel</button>
              <button type="submit" disabled={saving} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold disabled:opacity-60">
                {saving ? "Saving..." : "Save Offer"}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-slate-500">Loading offers...</div>
            ) : offers.length === 0 ? (
              <div className="p-10 text-center text-slate-500">No offers found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-245 text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-5 py-3 text-xs uppercase text-slate-500">Title</th>
                      <th className="px-5 py-3 text-xs uppercase text-slate-500">Order</th>
                      <th className="px-5 py-3 text-xs uppercase text-slate-500">Status</th>
                      <th className="px-5 py-3 text-xs uppercase text-slate-500">Validity</th>
                      <th className="px-5 py-3 text-xs uppercase text-slate-500">Image</th>
                      <th className="px-5 py-3 text-xs uppercase text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offers.map((offer) => (
                      <tr key={offer.offer_id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">{offer.title}</p>
                          <p className="text-xs text-slate-500">{offer.subtitle || "-"}</p>
                        </td>
                        <td className="px-5 py-4">{offer.display_order ?? 0}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${Number(offer.is_active) === 1 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                            {Number(offer.is_active) === 1 ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">
                          {offer.valid_from || "-"} to {offer.valid_to || "-"}
                        </td>
                        <td className="px-5 py-4">
                          {offer.image_url ? (
                            <img src={resolveImage(offer.image_url)} alt={offer.title} className="w-16 h-10 object-cover rounded border" />
                          ) : (
                            <span className="text-xs text-slate-400">No image</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => startEdit(offer)} className="px-3 py-1.5 text-xs rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100">Edit</button>
                            <button onClick={() => onDelete(offer.offer_id)} className="px-3 py-1.5 text-xs rounded-lg bg-red-50 text-red-700 hover:bg-red-100">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOffers;
