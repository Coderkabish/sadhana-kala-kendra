import React, { useState, useEffect, useCallback } from "react";
import {
  getAllActivities,
  createActivity,
  updateActivity,
  deleteActivity,
} from "../services/activitiesService";

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

/** * COMPONENT: ActivityForm */
const ActivityForm = ({ activity, onSubmit, onCancel, isSaving }) => {
  const [formData, setFormData] = useState({
    title: activity?.title || "",
    description: activity?.description || "",
    video_url: activity?.video_url || "",
  });

  const isNew = !activity || !activity.activity_id;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} 
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-10 transition-all">
      <div className="bg-slate-50 border-b border-slate-200 px-8 py-4 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">
          {isNew ? "✨ Post New Activity" : "📝 Edit Activity Details"}
        </h3>
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Step 1 of 1</span>
      </div>

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Activity Title</label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Annual Musical Gala 2026"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Video URL (YouTube/Facebook)</label>
            <input
              type="url"
              name="video_url"
              placeholder="https://youtube.com/watch?v=..."
              value={formData.video_url}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description</label>
          <textarea
            name="description"
            placeholder="Provide context about this activity..."
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
          />
        </div>
      </div>

      <div className="bg-slate-50 px-8 py-4 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition">
          Discard
        </button>
        <button type="submit" disabled={isSaving} className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50">
          {isSaving ? "Processing..." : isNew ? "Publish Activity" : "Update Activity"}
        </button>
      </div>
    </form>
  );
};

export default function AdminActivities() {
  const [activities, setActivities] = useState([]);
  const [editingActivity, setEditingActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllActivities();
      setActivities(data || []);
    } catch (err) {
      setError("Failed to synchronize activities with server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleFormSubmit = async (formData) => {
    setIsSaving(true);
    setError(null);
    try {
      if (editingActivity && editingActivity.activity_id) {
        await updateActivity(editingActivity.activity_id, formData);
        setMessage("Activity updated successfully.");
      } else {
        await createActivity(formData);
        setMessage("New activity published.");
      }
      setEditingActivity(null);
      fetchData();
    } catch (err) {
      setError("Operation failed. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Confirm Deletion? This will remove this activity entry.")) return;
    try {
      await deleteActivity(id);
      setMessage("Activity removed.");
      fetchData();
    } catch (err) {
      setError("Delete operation failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 text-slate-900">
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-slate-200 mb-8">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Activity Management</h1>
              <p className="text-slate-500 mt-1">Manage event highlights and video performances.</p>
            </div>
            {!editingActivity && (
              <button 
                onClick={() => setEditingActivity({})}
                className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all hover:scale-[1.02]"
              >
                <LucideIcon><path d="M12 5v14M5 12h14" /></LucideIcon>
                Add New Activity
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Posts</span>
                <p className="text-2xl font-black text-slate-800">{activities.length}</p>
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

        {editingActivity ? (
          <ActivityForm 
            activity={editingActivity} 
            onSubmit={handleFormSubmit} 
            onCancel={() => setEditingActivity(null)} 
            isSaving={isSaving} 
          />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-20 text-center">
                <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-500 font-medium">Fetching activities...</p>
              </div>
            ) : activities.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Activity Title</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest hidden lg:table-cell">Video Link</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activities.map((a) => (
                    <tr key={a.activity_id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{a.title}</p>
                          <p className="text-xs text-slate-400 line-clamp-1 max-w-xs">{a.description || "No description provided."}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <a href={a.video_url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 underline truncate max-w-50 block">
                          {a.video_url}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingActivity(a)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                            <LucideIcon><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></LucideIcon>
                          </button>
                          <button onClick={() => handleDelete(a.activity_id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
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
                <div className="text-5xl mb-4">🎬</div>
                <h3 className="text-xl font-bold text-slate-800">No activities recorded</h3>
                <p className="text-slate-500">Your gallery is empty. Share your first video highlight.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}