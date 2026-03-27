import React, { useState, useEffect, useCallback } from "react";
import { SERVER_ROOT_URL } from "../services/api";
import {
  getAllArtists,
  createArtist,
  updateArtist,
  deleteArtist,
} from "../services/artistsService";
import PageLoader from "../../components/PageLoader";

/** * PROFESSIONAL UI UTILS */
const LucideIcon = ({ children }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
    {children}
  </svg>
);

const Alert = ({ message, type, onClose }) => (
  <div className={`flex items-center justify-between p-4 mb-6 rounded-xl border animate-in fade-in slide-in-from-top-4 duration-300 ${
    type === "error" ? "bg-red-50 border-red-200 text-red-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"
  }`}>
    <div className="flex items-center font-medium">
      {type === "error" ? "⚠️" : "✅"} <span className="ml-3">{message}</span>
    </div>
    <button onClick={onClose} className="hover:opacity-70 transition-opacity text-xl">&times;</button>
  </div>
);

/** * COMPONENT: ArtistForm */
const ArtistForm = ({ artist, onSubmit, onCancel, isSaving }) => {
  const [formData, setFormData] = useState({
    full_name: artist?.full_name || "",
    slug: artist?.slug || "",
    bio: artist?.bio || "",
    seo_title: artist?.seo_title || "",
    seo_description: artist?.seo_description || "",
    seo_keywords: artist?.seo_keywords || "",
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(
    artist?.profile_image ? `${SERVER_ROOT_URL}${artist.profile_image}` : ""
  );

  const isNew = !artist || !artist.artist_id;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...formData, profileImageFile }); }} 
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-10 transition-all">
      <div className="bg-slate-50 border-b border-slate-200 px-8 py-4 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">
          {isNew ? "✨ Register New Artist" : "📝 Edit Artist Profile"}
        </h3>
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Step 1 of 1</span>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Profile Photo Upload */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50">
           <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-white shadow-md bg-slate-200">
              {imagePreviewUrl ? (
                <img src={imagePreviewUrl} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Photo</div>
              )}
           </div>
           <label className="cursor-pointer bg-white px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 transition shadow-sm">
             {isNew ? "Upload Photo" : "Change Photo"}
             <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
           </label>
           <p className="text-[10px] text-slate-400 mt-3 uppercase tracking-tighter">JPG, PNG or WebP</p>
        </div>

        {/* Right: Text Fields */}
        <div className="lg:col-span-8 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Artist Full Name</label>
            <input
              type="text"
              name="full_name"
              placeholder="e.g. Ramesh Chen"
              value={formData.full_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Bio / Professional Background</label>
            <textarea
              name="bio"
              placeholder="Describe the artist's style and experience..."
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Slug (Optional)</label>
            <input
              type="text"
              name="slug"
              placeholder="artist-name"
              value={formData.slug}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">SEO Title</label>
            <input
              type="text"
              name="seo_title"
              placeholder="SEO title for artist page"
              value={formData.seo_title}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">SEO Description</label>
            <textarea
              name="seo_description"
              placeholder="Short SEO description"
              value={formData.seo_description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">SEO Keywords</label>
            <input
              type="text"
              name="seo_keywords"
              placeholder="artist, music, performance"
              value={formData.seo_keywords}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-50 px-8 py-4 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition">
          Discard
        </button>
        <button type="submit" disabled={isSaving} className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50">
          {isSaving ? "Processing..." : isNew ? "Create Profile" : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default function AdminArtist() {
  const [artists, setArtists] = useState([]);
  const [editingArtist, setEditingArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllArtists();
      setArtists(data);
    } catch (err) {
      setError(err?.message || "Failed to synchronize artist database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleFormSubmit = async ({ profileImageFile, ...data }) => {
    setIsSaving(true);
    setError(null);
    
    const formData = new FormData();
    formData.append("full_name", data.full_name);
    formData.append("bio", data.bio || "");
    formData.append("slug", data.slug || "");
    formData.append("seo_title", data.seo_title || "");
    formData.append("seo_description", data.seo_description || "");
    formData.append("seo_keywords", data.seo_keywords || "");
    
    // Only include profile_image if a new file was uploaded
    if (profileImageFile) {
      formData.append("profile_image", profileImageFile);
    }

    try {
      if (editingArtist?.artist_id) {
        await updateArtist(editingArtist.artist_id, formData);
        setMessage("Artist profile updated.");
      } else {
        await createArtist(formData);
        setMessage("New artist added successfully.");
      }
      setEditingArtist(null);
      fetchData();
    } catch (err) {
      setError(err?.message || "Operation failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanent Deletion? This cannot be undone.")) return;
    try {
      await deleteArtist(id);
      setMessage("Artist record removed.");
      fetchData();
    } catch (err) {
      setError(err?.message || "Delete operation failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 text-slate-900">
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-slate-200 mb-8">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Artist Directory</h1>
              <p className="text-slate-500 mt-1">Manage and curate the roster of featured creative talents.</p>
            </div>
            {!editingArtist && (
              <button 
                onClick={() => setEditingArtist({})}
                className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all hover:scale-[1.02]"
              >
                <LucideIcon><path d="M12 5v14M5 12h14" /></LucideIcon>
                Register New Artist
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Artists</span>
                <p className="text-2xl font-black text-slate-800">{artists.length}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                <p className="text-2xl font-black text-emerald-500 underline decoration-emerald-200">Live</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6">
        {error && <Alert message={error} type="error" onClose={() => setError(null)} />}
        {message && <Alert message={message} type="success" onClose={() => setMessage(null)} />}

        {editingArtist ? (
          <ArtistForm 
            artist={editingArtist.artist_id ? editingArtist : null} 
            onSubmit={handleFormSubmit} 
            onCancel={() => setEditingArtist(null)} 
            isSaving={isSaving} 
          />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <PageLoader message="Synchronizing artist data..." />
            ) : artists.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Professional</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:table-cell">Biography Snippet</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {artists.map((a) => (
                    <tr key={a.artist_id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img 
                            src={a.profile_image ? `${SERVER_ROOT_URL}${a.profile_image}` : "https://via.placeholder.com/150"} 
                            className="w-12 h-12 rounded-xl object-cover shadow-sm ring-2 ring-white" 
                            alt="" 
                          />
                          <div>
                            <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{a.full_name}</p>
                            <p className="text-xs text-slate-400 md:hidden line-clamp-1">{a.bio || "No bio"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <p className="text-sm text-slate-500 line-clamp-1 max-w-xs italic">
                          {a.bio || "Not available"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingArtist(a)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                            <LucideIcon><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></LucideIcon>
                          </button>
                          <button onClick={() => handleDelete(a.artist_id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                            <LucideIcon><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></LucideIcon>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-20 text-center">
                <div className="text-5xl mb-4">🎨</div>
                <h3 className="text-xl font-bold text-slate-800">No artists found</h3>
                <p className="text-slate-500">Your collection is currently empty.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* PUBLIC PREVIEW SECTION */}
      <div className="container mx-auto px-6 mt-16">
        <div className="bg-slate-900 rounded-[2.5rem] p-10 lg:p-16 overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-3xl font-black text-white mb-10 text-center">Live Preview: Artist Cards</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {artists.slice(0, 3).map((artist) => (
                <div key={artist.artist_id} className="bg-white rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src={artist.profile_image ? `${SERVER_ROOT_URL}${artist.profile_image}` : "https://via.placeholder.com/300"}
                    className="w-full h-64 object-cover"
                    alt={artist.full_name}
                  />
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{artist.full_name}</h3>
                    <p className="text-slate-500 text-sm line-clamp-2">{artist.bio || "Featured artist profile."}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Decorative Background Blur */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full"></div>
        </div>
      </div>
    </div>
  );
}