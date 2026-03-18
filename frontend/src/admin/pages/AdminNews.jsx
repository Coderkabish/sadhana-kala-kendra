
import React, { useState, useEffect, useRef } from "react";
import {
  getAllNews,
  getNewsResources,
  createNews,
  updateNews,
  deleteNews,
} from "../services/newsService";
import { SERVER_ROOT_URL } from "../services/api";

const LucideIcon = ({ children }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">{children}</svg>
);

const Alert = ({ message, type, onClose }) => (
  <div className={`flex items-start md:items-center justify-between p-4 mb-6 rounded-xl border animate-in fade-in slide-in-from-top-4 duration-300 ${type === "error" ? "bg-red-50 border-red-200 text-red-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"}`}> <div className="flex items-center font-medium"><span className="shrink-0">{type === "error" ? "⚠️" : "✅"}</span> <span className="ml-3 text-sm md:text-base">{message}</span></div><button onClick={onClose} className="hover:opacity-70 transition-opacity text-xl leading-none ml-4">&times;</button></div>
);

const formatNewsDataForForm = (news) => ({
  news_id: news.news_id || null,
  title: news.title || "",
  slug: news.slug || "",
  content: news.content || "",
  news_date: news.news_date ? new Date(news.news_date).toISOString().split("T")[0] : "",
  image_url: news.image_url || "",
  seo_title: news.seo_title || "",
  seo_description: news.seo_description || "",
  seo_keywords: news.seo_keywords || "",
});

const NewsForm = ({ news, onSubmit, onCancel, isSaving }) => {
    // Generic handler for controlled inputs
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };
  const [formData, setFormData] = useState(formatNewsDataForForm(news || {}));
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(() => {
    if (news?.image_url) {
      return news.image_url.startsWith('http') ? news.image_url : (SERVER_ROOT_URL + news.image_url);
    }
    return "";
  });
  const [extraImages, setExtraImages] = useState([]); // File objects
  const [extraImagePreviews, setExtraImagePreviews] = useState([]); // URLs
  const [ytLinks, setYtLinks] = useState([""]);
  const fileInputRef = useRef();


  useEffect(() => {
    setFormData(formatNewsDataForForm(news || {}));
    setImageFile(null);
    if (news?.image_url) {
      setImagePreview(news.image_url.startsWith('http') ? news.image_url : (SERVER_ROOT_URL + news.image_url));
    } else {
      setImagePreview("");
    }

    // Handle optional images and YT links for editing
    if (news?.resources && Array.isArray(news.resources)) {
      // Separate images and yt links
      const imageResources = news.resources.filter(r => r.resource_type === 'image');
      const ytResources = news.resources.filter(r => r.resource_type === 'youtube');
      // Store existing image URLs directly in extraImages
      setExtraImages(imageResources.map(r => r.resource_url.startsWith('http') ? r.resource_url : (SERVER_ROOT_URL + r.resource_url)));
      setExtraImagePreviews(imageResources.map(r => r.resource_url.startsWith('http') ? r.resource_url : (SERVER_ROOT_URL + r.resource_url)));
      setYtLinks(ytResources.length > 0 ? ytResources.map(r => r.resource_url) : [""]);
    } else {
      setExtraImages([]);
      setExtraImagePreviews([]);
      setYtLinks([""]);
    }
  }, [news]);

  // Extra images (dynamic add/remove)
  // Only one definition for handleExtraImagesChange and helpers
  const handleExtraImagesChange = (e, idx) => {
    const file = e.target.files[0];
    setExtraImages(prev => {
      const updated = [...prev];
      updated[idx] = file;
      return updated;
    });
    setExtraImagePreviews(prev => {
      const updated = [...prev];
      updated[idx] = file ? URL.createObjectURL(file) : "";
      return updated;
    });
  };
  const addExtraImage = () => {
    setExtraImages(prev => [...prev, null]);
    setExtraImagePreviews(prev => [...prev, ""]);
  };
  const removeExtraImage = (idx) => {
    setExtraImages((prev) => prev.filter((_, i) => i !== idx));
    setExtraImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Extra images


  // YT links
  const handleYtLinkChange = (idx, value) => {
    setYtLinks((prev) => prev.map((l, i) => (i === idx ? value : l)));
  };
  const addYtLink = () => setYtLinks((prev) => [...prev, ""]);
  const removeYtLink = (idx) => setYtLinks((prev) => prev.filter((_, i) => i !== idx));

  const inputStyle = "w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none bg-white text-slate-700 text-sm md:text-base";
  const labelStyle = "block text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1";

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const submitData = { ...formData };
      if (imageFile) submitData.image = imageFile;
      // Attach extra images and yt links as resources
      // Separate new uploads and existing URLs
      submitData.extraImagesToUpload = extraImages.filter(f => f && typeof f !== 'string');
      submitData.existingImagesToKeep = extraImages.filter(f => typeof f === 'string');
      submitData.ytLinks = ytLinks.filter(l => l.trim());
      onSubmit(submitData);
    }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-10 w-full max-w-4xl mx-auto">
      <div className="bg-slate-50 border-b border-slate-200 px-5 md:px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="text-lg font-bold text-slate-800">{news?.news_id ? "📝 Edit News" : "📰 Add News"}</h3>
      </div>
      <div className="p-5 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Image Upload Preview (matches Teacher page) */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50">
          <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-white shadow-md bg-slate-200">
            <img
              src={imagePreview || (formData.image && typeof formData.image === 'string' ? formData.image : "https://via.placeholder.com/128x128?text=No+Image")}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <label className="mt-2 w-full flex flex-col items-center cursor-pointer text-indigo-600 hover:text-indigo-800">
            <span>Change Photo</span>
            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
          </label>
          <p className="text-[10px] text-slate-400 mt-3 uppercase tracking-tighter">Recommended: 400x400px (JPG/PNG)</p>
        </div>
        {/* Extra Images */}
        <div className="lg:col-span-8">
          <label className={labelStyle}>Optional Images</label>
          <div className="flex flex-wrap gap-3 mt-2">
            {extraImages.map((img, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <img src={typeof img === 'string' ? img : (extraImagePreviews[idx] || "https://via.placeholder.com/80x80?text=No+Image")}
                  alt="Extra Preview"
                  className="w-20 h-20 object-contain rounded-lg border border-slate-200 bg-slate-100" />
                <input type="file" accept="image/*" onChange={e => handleExtraImagesChange(e, idx)} className="block text-xs" />
                <button type="button" onClick={() => removeExtraImage(idx)} className="text-xs text-red-600 hover:underline">Remove</button>
              </div>
            ))}
            <button type="button" onClick={addExtraImage} className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 text-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-400 transition">+</button>
          </div>
        </div>
        {/* YT Links */}
        <div className="lg:col-span-8">
          <label className={labelStyle}>YouTube Video Links</label>
          {ytLinks.map((link, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input type="url" value={link} onChange={e => handleYtLinkChange(idx, e.target.value)} placeholder="https://youtube.com/watch?v=..." className={inputStyle + " flex-1"} />
              {ytLinks.length > 1 && (
                <button type="button" onClick={() => removeYtLink(idx)} className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-lg">Remove</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addYtLink} className="mt-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold">+ Add Video Link</button>
        </div>
        {/* Right: Fields */}
        <div className="lg:col-span-8 space-y-5">
          <div>
            <label className={labelStyle}>Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required className={inputStyle} placeholder="e.g. New Award Announced" />
          </div>
          <div>
            <label className={labelStyle}>Slug (Optional)</label>
            <input type="text" name="slug" value={formData.slug} onChange={handleChange} className={inputStyle} placeholder="new-award-announced" />
          </div>
          <div>
            <label className={labelStyle}>Date</label>
            <input type="date" name="news_date" value={formData.news_date} onChange={handleChange} required className={inputStyle} />
          </div>
          <div>
            <label className={labelStyle}>Content</label>
            <textarea name="content" value={formData.content} onChange={handleChange} rows="3" className={inputStyle} placeholder="Write news details..."></textarea>
          </div>
          <div>
            <label className={labelStyle}>SEO Title</label>
            <input type="text" name="seo_title" value={formData.seo_title} onChange={handleChange} className={inputStyle} placeholder="SEO title for search engines" />
          </div>
          <div>
            <label className={labelStyle}>SEO Description</label>
            <textarea name="seo_description" value={formData.seo_description} onChange={handleChange} rows="3" className={inputStyle} placeholder="Short SEO description" ></textarea>
          </div>
          <div>
            <label className={labelStyle}>SEO Keywords</label>
            <input type="text" name="seo_keywords" value={formData.seo_keywords} onChange={handleChange} className={inputStyle} placeholder="music school, bharatanatyam, workshop" />
          </div>
        </div>
      </div>
      <div className="bg-slate-50 px-5 md:px-8 py-4 flex flex-col-reverse sm:flex-row justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-8 py-2.5 bg-white text-slate-700 rounded-xl font-bold border border-slate-300 hover:bg-slate-100 transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="w-full sm:w-auto px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save News"}
        </button>
      </div>

    </form>
  );
}


  export default function AdminNews() {
  const [newsList, setNewsList] = useState([]);
  const [editingNews, setEditingNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllNews();
      setNewsList(data);
    } catch (err) {
      setError("Failed to sync news records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleFormSubmit = async (formData) => {
    setIsSaving(true);
    setError(null);

    const {
      news_id,
      image,
      extraImagesToUpload,
      existingImagesToKeep,
      ytLinks,
      ...apiPayload
    } = formData;

    const form = new FormData();

    Object.entries(apiPayload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        form.append(key, value);
      }
    });

    if (image) {
      form.append("image", image);
    }

    if (Array.isArray(extraImagesToUpload) && extraImagesToUpload.length > 0) {
      extraImagesToUpload.forEach((img) => form.append("extraImages", img));
    }

    if (Array.isArray(existingImagesToKeep) && existingImagesToKeep.length > 0) {
      existingImagesToKeep.forEach((url) => form.append("existingImagesToKeep", url));
    }

    form.append("ytLinks", JSON.stringify(Array.isArray(ytLinks) ? ytLinks : []));

    try {
      if (news_id) {
        await updateNews(news_id, form);
        setMessage("News successfully updated.");
      } else {
        await createNews(form);
        setMessage("News added successfully.");
      }
      setEditingNews(null);
      fetchData();
    } catch (err) {
      setError(err?.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async (news) => {
    try {
      const resources = await getNewsResources(news.news_id);
      setEditingNews({ ...news, resources });
    } catch (err) {
      setEditingNews(news);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Confirm deletion?")) return;
    try {
      await deleteNews(id);
      setMessage("News record deleted.");
      fetchData();
    } catch (err) {
      setError(err?.message || "Failed to delete record.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-10 text-slate-900">
      <div className="bg-white border-b border-slate-200 mb-6 md:mb-10">
        <div className="container mx-auto px-4 sm:px-6 py-6 md:py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="text-left">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">News Console</h1>
              <p className="text-slate-500 text-sm md:text-base mt-1">Manage all news and announcements.</p>
            </div>
            {!editingNews && (
              <button onClick={() => setEditingNews({})} className="w-full md:w-auto inline-flex items-center justify-center px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                <LucideIcon><path d="M12 5v14M5 12h14" /></LucideIcon>
                Add News
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 sm:px-6">
        {error && <Alert message={error} type="error" onClose={() => setError(null)} />}
        {message && <Alert message={message} type="success" onClose={() => setMessage(null)} />}
        {editingNews ? (
          <NewsForm
            news={{
              ...editingNews,
              resources: editingNews.resources || editingNews.news_resources || [],
            }}
            onSubmit={handleFormSubmit}
            onCancel={() => setEditingNews(null)}
            isSaving={isSaving}
          />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-16 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-400 text-sm font-medium tracking-wide">Syncing records...</p>
              </div>
            ) : newsList.length > 0 ? (
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
                <table className="w-full text-left border-collapse min-w-175">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200">
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Title</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Image</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {newsList.map((news) => (
                      <tr key={news.news_id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-5">
                          <p className="font-bold text-slate-800 text-sm md:text-base group-hover:text-indigo-600 transition-colors">{news.title}</p>
                          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter mt-0.5">{news.news_date}</p>
                        </td>
                        <td className="px-6 py-5">{news.news_date}</td>
                        <td className="px-6 py-5">
                          {news.image_url ? (
                            <img src={news.image_url.startsWith('http') ? news.image_url : `${SERVER_ROOT_URL}${news.image_url}`} alt="News" className="w-16 h-16 object-cover rounded-lg border border-slate-200" />
                          ) : (
                            <span className="text-slate-400 text-xs">No Image</span>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex gap-2">
                            <button onClick={() => handleEdit(news)} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Edit">
                              <LucideIcon><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></LucideIcon>
                            </button>
                            <button onClick={() => handleDelete(news.news_id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Delete">
                              <LucideIcon><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></LucideIcon>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-16 md:p-24 text-center">
                <div className="text-5xl md:text-6xl mb-4 grayscale opacity-50">📰</div>
                <h3 className="text-lg md:text-xl font-bold text-slate-800">No news found</h3>
                <p className="text-slate-400 text-sm mt-1">No news records were found in the database.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
