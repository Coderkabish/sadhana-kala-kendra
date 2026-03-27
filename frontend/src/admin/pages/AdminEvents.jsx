import React, { useState, useEffect, useCallback } from "react";
import {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../services/eventsService";
import PageLoader from "../../components/PageLoader";

/** * PROFESSIONAL UI UTILS */
const LucideIcon = ({ children }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
    {children}
  </svg>
);

const Alert = ({ message, type, onClose }) => (
  <div className={`flex items-start md:items-center justify-between p-4 mb-6 rounded-xl border animate-in fade-in slide-in-from-top-4 duration-300 ${
    type === "error" ? "bg-red-50 border-red-200 text-red-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"
  }`}>
    <div className="flex items-center font-medium">
      <span className="shrink-0">{type === "error" ? "⚠️" : "✅"}</span> 
      <span className="ml-3 text-sm md:text-base">{message}</span>
    </div>
    <button onClick={onClose} className="hover:opacity-70 transition-opacity text-xl leading-none ml-4">&times;</button>
  </div>
);

const formatEventDataForForm = (event) => ({
  event_id: event.event_id || null,
  event_name: event.event_name || "",
  slug: event.slug || "",
  description: event.description || "",
  event_date: event.event_date ? new Date(event.event_date).toISOString().split("T")[0] : "",
  event_time: event.event_time || "18:00",
  venue: event.venue || "",
  organized_by: event.organized_by || "",
  category: event.category || "upcoming",
  seo_title: event.seo_title || "",
  seo_description: event.seo_description || "",
  seo_keywords: event.seo_keywords || "",
});

/** * COMPONENT: EventForm */
const EventForm = ({ event, onSubmit, onCancel, isSaving }) => {
  const [formData, setFormData] = useState(formatEventDataForForm(event || {}));

  useEffect(() => {
    setFormData(formatEventDataForForm(event || {}));
  }, [event]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const inputStyle = "w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none bg-white text-slate-700 text-sm md:text-base";
  const labelStyle = "block text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1";

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} 
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-10 w-full max-w-4xl mx-auto">
      <div className="bg-slate-50 border-b border-slate-200 px-5 md:px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="text-lg font-bold text-slate-800">
          {event?.event_id ? "📝 Edit Event" : "✨ Schedule Event"}
        </h3>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${formData.category === 'upcoming' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
            {formData.category} Mode
        </span>
      </div>

      <div className="p-5 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        <div className="md:col-span-2">
          <label className={labelStyle}>Event Title</label>
          <input type="text" name="event_name" value={formData.event_name} onChange={handleChange} required className={inputStyle} placeholder="e.g. Annual Art Symposium" />
        </div>

        <div className="md:col-span-2">
          <label className={labelStyle}>Slug (Optional)</label>
          <input type="text" name="slug" value={formData.slug} onChange={handleChange} className={inputStyle} placeholder="annual-art-symposium" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:col-span-2 gap-5">
            <div>
              <label className={labelStyle}>Date</label>
              <input type="date" name="event_date" value={formData.event_date} onChange={handleChange} required className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Start Time</label>
              <input type="time" name="event_time" value={formData.event_time} onChange={handleChange} required className={inputStyle} />
            </div>
        </div>

        <div>
          <label className={labelStyle}>Venue / Location</label>
          <input type="text" name="venue" value={formData.venue} onChange={handleChange} required className={inputStyle} placeholder="Grand Ballroom" />
        </div>

        <div>
          <label className={labelStyle}>Organized By</label>
          <input type="text" name="organized_by" value={formData.organized_by} onChange={handleChange} className={inputStyle} placeholder="Department Name" />
        </div>

        <div className="md:col-span-2">
          <label className={labelStyle}>Change Category</label>
          <select name="category" value={formData.category} onChange={handleChange} required className={inputStyle}>
            <option value="upcoming">Upcoming (Active)</option>
            <option value="past">Past (Archived)</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className={labelStyle}>Description & Notes</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className={inputStyle} placeholder="Provide details..."></textarea>
        </div>

        <div className="md:col-span-2">
          <label className={labelStyle}>SEO Title</label>
          <input type="text" name="seo_title" value={formData.seo_title} onChange={handleChange} className={inputStyle} placeholder="SEO title for this event" />
        </div>

        <div className="md:col-span-2">
          <label className={labelStyle}>SEO Description</label>
          <textarea name="seo_description" value={formData.seo_description} onChange={handleChange} rows="3" className={inputStyle} placeholder="Short SEO summary" ></textarea>
        </div>

        <div className="md:col-span-2">
          <label className={labelStyle}>SEO Keywords</label>
          <input type="text" name="seo_keywords" value={formData.seo_keywords} onChange={handleChange} className={inputStyle} placeholder="music event, kala kendra, recital" />
        </div>
      </div>

      <div className="bg-slate-50 px-5 md:px-8 py-4 flex flex-col-reverse sm:flex-row justify-end gap-3">
        <button type="button" onClick={onCancel} className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition">Discard</button>
        <button type="submit" disabled={isSaving} className="w-full sm:w-auto px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50">
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllEvents();
      setEvents(data);
    } catch (err) {
      setError(err?.message || "Failed to sync event records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleFormSubmit = async (formData) => {
    setIsSaving(true);
    setError(null);
    const { event_id, ...apiPayload } = formData;
    try {
      if (event_id) {
        await updateEvent(event_id, apiPayload);
        setMessage("Event successfully updated.");
      } else {
        await createEvent(apiPayload);
        setMessage("New event scheduled successfully.");
      }
      setEditingEvent(null);
      fetchData();
    } catch (err) {
      setError(err?.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Confirm deletion?")) return;
    try {
      await deleteEvent(id);
      setMessage("Event record deleted.");
      fetchData();
    } catch (err) {
      setError(err?.message || "Failed to delete record.");
    }
  };

  const filteredEvents = events
    .filter((e) => e.category === activeTab)
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-10 text-slate-900">
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-slate-200 mb-6 md:mb-10">
        <div className="container mx-auto px-4 sm:px-6 py-6 md:py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="text-left">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">Events Console</h1>
              <p className="text-slate-500 text-sm md:text-base mt-1">Manage institutional schedule and archives.</p>
            </div>
            {!editingEvent && (
              <button 
                onClick={() => setEditingEvent({ category: activeTab })}
                className="w-full md:w-auto inline-flex items-center justify-center px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
              >
                <LucideIcon><path d="M12 5v14M5 12h14" /></LucideIcon>
                Add {activeTab} Event
              </button>
            )}
          </div>

          {!editingEvent && (
            <div className="flex gap-6 md:gap-10 mt-8 border-b border-slate-100 overflow-x-auto no-scrollbar">
              {["upcoming", "past"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-[11px] md:text-sm font-bold uppercase tracking-[0.15em] transition-all whitespace-nowrap relative ${
                    activeTab === tab ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {tab} Events
                  {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full"></div>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6">
        {error && <Alert message={error} type="error" onClose={() => setError(null)} />}
        {message && <Alert message={message} type="success" onClose={() => setMessage(null)} />}

        {editingEvent ? (
          <EventForm event={editingEvent} onSubmit={handleFormSubmit} onCancel={() => setEditingEvent(null)} isSaving={isSaving} />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <PageLoader message="Syncing records..." />
            ) : filteredEvents.length > 0 ? (
              /* MOBILE SCROLL CONTAINER */
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200">
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Event Detail</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Schedule & Venue</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEvents.map((event) => (
                      <tr key={event.event_id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-5">
                          <p className="font-bold text-slate-800 text-sm md:text-base group-hover:text-indigo-600 transition-colors">{event.event_name}</p>
                          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter mt-0.5">{event.organized_by || "Internal"}</p>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="text-xs md:text-sm font-semibold text-slate-600 italic">
                              {new Date(event.event_date).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="text-[11px] md:text-xs text-slate-400 mt-0.5 font-medium">{event.event_time} • {event.venue}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button 
                              onClick={() => { setEditingEvent(event); window.scrollTo({ top: 0, behavior: "smooth" }); }} 
                              className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                              title="Edit"
                            >
                              <LucideIcon><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></LucideIcon>
                            </button>
                            <button 
                              onClick={() => handleDelete(event.event_id)} 
                              className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                              title="Delete"
                            >
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
                <div className="text-5xl md:text-6xl mb-4 grayscale opacity-50">📅</div>
                <h3 className="text-lg md:text-xl font-bold text-slate-800">Schedule is empty</h3>
                <p className="text-slate-400 text-sm mt-1">No {activeTab} events were found in the database.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}