import React, { useEffect, useMemo, useState } from "react";
import {
  createOffer,
  deleteOffer,
  getAllOffersForAdmin,
  updateOffer,
} from "../services/offersService";
import { getAllCourses } from "../services/coursesService";
import { SERVER_ROOT_URL } from "../services/api";
import PageLoader from "../../components/PageLoader";

const toFormModel = (offer = {}) => ({
  offer_id: offer.offer_id || null,
  course_id: offer.course_id || null,
  title: offer.title || "",
  subtitle: offer.subtitle || "",
  description: offer.description || "",
  image_url: offer.image_url || "",
  discount_percentage: offer.discount_percentage ?? 0,
  discount_type: offer.discount_type || "percentage",
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

const formatDateOnly = (dateString) => {
  if (!dateString) return "-";
  return dateString.split("T")[0];
};

const resolveImage = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const fixed = url.startsWith("/") ? url : `/${url}`;
  return `${SERVER_ROOT_URL}${fixed}`;
};

const AdminOffers = () => {
  const [offers, setOffers] = useState([]);
  const [courses, setCourses] = useState([]);
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

  const courseMap = useMemo(() => {
    const map = {};
    courses.forEach(c => {
      map[c.course_id] = c.course_name;
    });
    return map;
  }, [courses]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [offersData, coursesData] = await Promise.all([
        getAllOffersForAdmin(),
        getAllCourses(),
      ]);
      setOffers(Array.isArray(offersData) ? offersData : []);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
    } catch (err) {
      setError(err?.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
      [name]: type === "checkbox" ? (checked ? 1 : 0) : (name === "course_id" ? (value ? Number(value) : null) : value),
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
      // Always include course_id (even if null), and skip other empty values
      if (key === "course_id") {
        payload.append(key, value || "");
      } else if (value !== undefined && value !== null && value !== "") {
        payload.append(key, value);
      }
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
      fetchData();
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
      fetchData();
    } catch (err) {
      setError(err?.message || "Failed to delete offer.");
    }
  };

  const isCourseOffer = formData.course_id;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-10 text-slate-900">
      <div className="bg-white border-b border-slate-200 mb-6 md:mb-10">
        <div className="container mx-auto px-4 sm:px-6 py-6 md:py-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">Offers Console</h1>
            <p className="text-slate-500 mt-1">Manage public offers and course-specific discounts.</p>
          </div>
          {!editing && (
            <button
              onClick={startCreate}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
            >
              + Add Offer
            </button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6">
        {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">{error}</div>}
        {message && <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">{message}</div>}

        {editing ? (
          <form onSubmit={onSave} className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8">
            {/* Offer Type */}
            <div className="mb-8 pb-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Offer Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`flex items-center p-4 border-2 border-slate-200 rounded-xl transition ${
                  formData.offer_id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-indigo-300'
                }`} style={{ borderColor: isCourseOffer ? 'rgb(226, 232, 240)' : '#818cf8' }}>
                  <input
                    type="radio"
                    checked={!isCourseOffer}
                    onChange={() => setFormData(prev => ({ ...prev, course_id: null }))}
                    disabled={!!formData.offer_id}
                    className="mr-3"
                  />
                  <div>
                    <p className="font-semibold text-slate-800">Public Offer</p>
                    <p className="text-xs text-slate-500">Banner/homepage offer</p>
                  </div>
                </label>
                <label className={`flex items-center p-4 border-2 border-slate-200 rounded-xl transition ${
                  formData.offer_id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-indigo-300'
                }`} style={{ borderColor: isCourseOffer ? '#818cf8' : 'rgb(226, 232, 240)' }}>
                  <input
                    type="radio"
                    checked={isCourseOffer}
                    onChange={() => setFormData(prev => ({ ...prev, course_id: courses[0]?.course_id || null }))}
                    disabled={!!formData.offer_id}
                    className="mr-3"
                  />
                  <div>
                    <p className="font-semibold text-slate-800">Course Offer</p>
                    <p className="text-xs text-slate-500">Discount for specific course</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Course Selection (if Course Offer) */}
            {isCourseOffer && (
              <div className="mb-8 pb-6 border-b border-slate-200">
                <label className="text-sm font-semibold">Select Course</label>
                <select
                  name="course_id"
                  value={String(formData.course_id || "")}
                  onChange={onChange}
                  className="mt-2 w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required={isCourseOffer}
                >
                  <option value="">-- Select a course --</option>
                  {courses.map(course => (
                    <option key={course.course_id} value={String(course.course_id)}>
                      {course.course_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Basic Information */}
            <div className="mb-8 pb-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold">Title *</label>
                  <input name="title" value={formData.title} onChange={onChange} className="mt-1 w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                </div>

                <div>
                  <label className="text-sm font-semibold">Subtitle</label>
                  <input name="subtitle" value={formData.subtitle} onChange={onChange} className="mt-1 w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>

                <div>
                  <label className="text-sm font-semibold">Display Order</label>
                  <input name="display_order" type="number" value={formData.display_order} onChange={onChange} className="mt-1 w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold">Description</label>
                  <textarea name="description" rows="3" value={formData.description} onChange={onChange} className="mt-1 w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            </div>

            {/* Discount Information (for Course Offers) */}
            {isCourseOffer && (
              <div className="mb-8 pb-6 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Discount Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-semibold">Discount Percentage</label>
                    <input name="discount_percentage" type="number" step="0.01" min="0" max="100" value={formData.discount_percentage} onChange={onChange} className="mt-1 w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>

                  <div>
                    <label className="text-sm font-semibold">Discount Type</label>
                    <select name="discount_type" value={formData.discount_type} onChange={onChange} className="mt-1 w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="percentage">Percentage (%)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Validity Period */}
            <div className="mb-8 pb-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Validity Period</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-semibold">Valid From</label>
                  <input name="valid_from" type="date" value={formData.valid_from} onChange={onChange} className="mt-1 w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>

                <div>
                  <label className="text-sm font-semibold">Valid To</label>
                  <input name="valid_to" type="date" value={formData.valid_to} onChange={onChange} className="mt-1 w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            </div>

            {/* CTA (Call To Action) */}
            <div className="mb-8 pb-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Call To Action</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-semibold">CTA Text</label>
                  <input name="cta_text" value={formData.cta_text} onChange={onChange} className="mt-1 w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>

                <div>
                  <label className="text-sm font-semibold">CTA Link</label>
                  <input name="cta_link" value={formData.cta_link} onChange={onChange} className="mt-1 w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="mb-8 pb-6 border-b border-slate-200">
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
                  <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="hidden" />
                </label>
                <p className="text-[10px] text-slate-400 mt-3 uppercase tracking-tighter">JPG, PNG or WebP</p>
              </div>
            </div>

            {/* SEO Information */}
            <div className="mb-8 pb-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">SEO Information</h3>
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="text-sm font-semibold">SEO Title</label>
                  <input name="seo_title" value={formData.seo_title} onChange={onChange} className="mt-1 w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>

                <div>
                  <label className="text-sm font-semibold">SEO Description</label>
                  <textarea name="seo_description" rows="2" value={formData.seo_description} onChange={onChange} className="mt-1 w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>

                <div>
                  <label className="text-sm font-semibold">SEO Keywords</label>
                  <input name="seo_keywords" value={formData.seo_keywords} onChange={onChange} placeholder="music school, offer, promotion" className="mt-1 w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="mb-8">
              <label className="inline-flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" name="is_active" checked={Number(formData.is_active) === 1} onChange={onChange} />
                Active offer
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={cancelForm} className="px-6 py-2.5 border border-slate-300 rounded-xl font-semibold hover:bg-slate-50 transition">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-60 transition">
                {saving ? "Saving..." : "Save Offer"}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            {loading ? (
              <PageLoader message="Loading offers..." />
            ) : offers.length === 0 ? (
              <div className="p-10 text-center text-slate-500">No offers found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-5 py-3 text-xs uppercase font-semibold text-slate-600">Title</th>
                      <th className="px-5 py-3 text-xs uppercase font-semibold text-slate-600">Type</th>
                      <th className="px-5 py-3 text-xs uppercase font-semibold text-slate-600">Course</th>
                      <th className="px-5 py-3 text-xs uppercase font-semibold text-slate-600">Discount</th>
                      <th className="px-5 py-3 text-xs uppercase font-semibold text-slate-600">Status</th>
                      <th className="px-5 py-3 text-xs uppercase font-semibold text-slate-600">Validity</th>
                      <th className="px-5 py-3 text-xs uppercase font-semibold text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offers.map((offer) => (
                      <tr key={offer.offer_id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">{offer.title}</p>
                          <p className="text-xs text-slate-500">{offer.subtitle || "-"}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${offer.course_id ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                            {offer.course_id ? "Course" : "Public"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">
                          {offer.course_id ? (courseMap[offer.course_id] || "Unknown") : "-"}
                        </td>
                        <td className="px-5 py-4 text-sm">
                          {offer.discount_percentage > 0 ? (
                            <span className="font-semibold text-amber-600">{offer.discount_percentage}% {offer.discount_type === 'percentage' ? 'off' : ''}</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${Number(offer.is_active) === 1 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                            {Number(offer.is_active) === 1 ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">
                          {offer.valid_from || offer.valid_to ? `${formatDateOnly(offer.valid_from)} to ${formatDateOnly(offer.valid_to)}` : 'Always'}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => startEdit(offer)} className="px-3 py-1.5 text-xs rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition">Edit</button>
                            <button onClick={() => onDelete(offer.offer_id)} className="px-3 py-1.5 text-xs rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition">Delete</button>
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
