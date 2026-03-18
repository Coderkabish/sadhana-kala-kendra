import React, { useState, useEffect, useCallback } from "react";
import {
  getAllTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "../services/teachersService";
import { SERVER_ROOT_URL } from "../services/api";

/** * PROFESSIONAL UI UTILS 
 */
const getImageUrl = (imagePath) => {
  if (!imagePath) return "https://via.placeholder.com/300x400?text=Profile+Missing";
  if (imagePath.startsWith("http")) return imagePath;
  const fixed = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${SERVER_ROOT_URL}${fixed}`;
};

// Reusable Icon Components for a cleaner look
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

/** * COMPONENT: TeacherForm
 * Professional form with better visual hierarchy
 */
const TeacherForm = ({ teacher, onSubmit, onCancel, isSaving }) => {
  const [formData, setFormData] = useState({
    full_name: teacher?.full_name || "",
    specialization: teacher?.specialization || "",
    profile_image_file: null,
    existing_profile_image: teacher?.profile_image || "",
  });

  const isNew = !teacher || !teacher.teacher_id;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profile_image_file: file, existing_profile_image: null }));
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} 
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-10 transition-all">
      <div className="bg-slate-50 border-b border-slate-200 px-8 py-4 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">
          {isNew ? "✨ Register New Faculty" : "📝 Update Faculty Profile"}
        </h3>
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Step 1 of 1</span>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Image Upload Preview */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50">
           <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-white shadow-md bg-slate-200">
              <img 
                src={formData.profile_image_file ? URL.createObjectURL(formData.profile_image_file) : getImageUrl(formData.existing_profile_image)} 
                className="w-full h-full object-cover" 
                alt="Preview" 
              />
           </div>
           <label className="cursor-pointer bg-white px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 transition shadow-sm">
              Change Photo
              <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
           </label>
           <p className="text-[10px] text-slate-400 mt-3 uppercase tracking-tighter">Recommended: 400x400px (JPG/PNG)</p>
        </div>

        {/* Right: Fields */}
        <div className="lg:col-span-8 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Teacher Full Name</label>
            <input
              type="text"
              name="full_name"
              placeholder="e.g. Badri Sharma"
              value={formData.full_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Department / Specialization</label>
            <input
              type="text"
              name="specialization"
              placeholder="e.g. Vocal"
              value={formData.specialization}
              onChange={handleChange}
              required
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
          {isSaving ? "Processing..." : isNew ? "Create Profile" : "Save Updates"}
        </button>
      </div>
    </form>
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
    try {
      const data = await getAllTeachers();
      setTeachers(data);
    } catch (err) {
      setError("Failed to synchronize data with server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleFormSubmit = async (formData) => {
    setIsSaving(true);
    setError(null);
    try {
      if (editingTeacher && editingTeacher.teacher_id) {
        await updateTeacher(editingTeacher.teacher_id, formData);
        setMessage("Faculty record updated successfully.");
      } else {
        await createTeacher(formData);
        setMessage("New faculty member added to the directory.");
      }
      setEditingTeacher(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Confirm Deletion? This will permanently remove this teacher.")) return;
    try {
      await deleteTeacher(id);
      setMessage("Record removed.");
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
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Faculty Management</h1>
              <p className="text-slate-500 mt-1">Configure and manage your educational institution's teaching staff.</p>
            </div>
            {!editingTeacher && (
              <button 
                onClick={() => setEditingTeacher({})}
                className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all hover:scale-[1.02]"
              >
                <LucideIcon><path d="M12 5v14M5 12h14" /></LucideIcon>
                Add Faculty Member
              </button>
            )}
          </div>
          
          {/* TOP STATS MINI-CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Staff</span>
                <p className="text-2xl font-black text-slate-800">{teachers.length}</p>
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

        {editingTeacher ? (
          <TeacherForm 
            teacher={editingTeacher} 
            onSubmit={handleFormSubmit} 
            onCancel={() => setEditingTeacher(null)} 
            isSaving={isSaving} 
          />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-20 text-center">
                <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-500 font-medium">Synchronizing database...</p>
              </div>
            ) : teachers.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Faculty Member</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:table-cell">Specialization</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teachers.map((t) => (
                    <tr key={t.teacher_id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img src={getImageUrl(t.profile_image)} className="w-12 h-12 rounded-xl object-cover shadow-sm ring-2 ring-white" alt="" />
                          <div>
                            <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{t.full_name}</p>
                            <p className="text-xs text-slate-400 md:hidden">{t.specialization}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold tracking-tight">
                          {t.specialization}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingTeacher(t)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                            <LucideIcon><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></LucideIcon>
                          </button>
                          <button onClick={() => handleDelete(t.teacher_id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
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
                <div className="text-5xl mb-4">🏫</div>
                <h3 className="text-xl font-bold text-slate-800">No faculty members found</h3>
                <p className="text-slate-500">Your directory is currently empty. Start by adding your first teacher.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}