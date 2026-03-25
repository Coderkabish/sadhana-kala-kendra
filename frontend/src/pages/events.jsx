
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getUpcomingEvents, getPastEvents } from "../admin/services/eventsService";
import { getAllNews } from "../admin/services/newsService";
import Seo from "../components/Seo";


const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);

  const fetchEvents = useCallback(async (tab) => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (tab === "upcoming") {
        data = await getUpcomingEvents();
        data.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
      } else {
        data = await getPastEvents();
        data.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
      }
      setEvents(data);
    } catch (err) {
      setError(`Failed to load ${tab} events. Please try again later.`);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNews = useCallback(async () => {
    setNewsLoading(true);
    setNewsError(null);
    try {
      const data = await getAllNews();
      setNews(data);
    } catch (err) {
      setNewsError("Failed to load news. Please try again later.");
    } finally {
      setNewsLoading(false);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchEvents(activeTab);
  }, [activeTab, fetchEvents]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const formatDateDisplay = (dateString) => {
    if (!dateString) return "TBD";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const UpcomingEventCard = ({ event }) => (
    <div
      key={event.event_id}
      className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition duration-300 flex flex-col"
    >
      <div className="p-5 sm:p-6 flex flex-col flex-1">
        <h3 className="text-xl sm:text-2xl font-semibold text-[#191938] mb-2 font-['Playfair_Display']">
          {event.event_name}
        </h3>

        <p className="text-red-600 text-sm font-bold mb-1 font-['Inter'] flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {formatDateDisplay(event.event_date)} | {event.event_time}
        </p>

        <p className="text-gray-500 text-sm mb-4 font-['Inter'] flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1 text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {event.venue}
        </p>

        <p className="text-gray-700 text-sm sm:text-base font-['Roboto'] flex-1 leading-relaxed">
          {event.description}
        </p>

        <p className="mt-4 text-xs text-gray-500 italic">
          Organized by: {event.organized_by || "Our School"}
        </p>
        {event.slug ? (
          <button
            type="button"
            onClick={() => navigate(`/events/${event.slug}`)}
            className="mt-4 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
          >
            View Details
          </button>
        ) : null}
      </div>
    </div>
  );

  const PastEventListItem = ({ event }) => (
    <div className="border-b border-gray-200 py-4 px-3 md:px-6 hover:bg-gray-100 transition duration-150">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start">
        <div className="md:w-3/5">
          <h4 className="text-lg font-semibold text-[#191938] font-['Playfair_Display']">
            {event.event_name}
          </h4>
          <p className="text-sm text-gray-600 mt-1 font-['Roboto']">
            {event.description}
          </p>
        </div>
        <div className="md:w-2/5 md:text-right mt-2 md:mt-0">
          <p className="text-xs font-bold text-red-600 font-['Inter']">
            {formatDateDisplay(event.event_date)}
          </p>
          <p className="text-xs text-gray-500 font-['Inter']">{event.venue}</p>
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <Seo
        title="Events and News Updates | Sadhana Kala Kendra Nepal"
        description="See upcoming events, past programs, and latest institutional updates from Sadhana Kala Kendra, including performances, workshops, and cultural activities."
        keywords="Sadhana Kala Kendra events, Nepal music events, dance workshops, cultural programs, art school news, upcoming performances"
        canonicalPath="/events"
      />
      {/* News Section */}
      <div className="max-w-7xl mx-auto mb-20 px-4">
        <div className="flex flex-col items-center justify-center mb-10 border-b border-gray-200 pb-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0f0f50] mb-4 font-['Inter']">
              Latest <span className="text-red-600 font-['Playfair_Display']">Updates</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 font-['Roboto'] max-w-2xl mx-auto">
              Stay updated with the latest happenings at our Kala Kendra.
            </p>
          </div>
        </div>

        {newsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse bg-white rounded-2xl h-80 shadow-sm"></div>
            ))}
          </div>
        ) : newsError ? (
          <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-100 text-center">
            {newsError}
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
            <p className="text-gray-500 italic">No news updates available at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((item) => {
              const newsDate = item.news_date ? new Date(item.news_date) : null;
              return (
                <article
                  key={item.news_id}
                  onClick={() => navigate(`/news/${item.slug || item.news_id}`)}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col overflow-hidden cursor-pointer"
                >
                  <div className="relative h-52 overflow-hidden bg-gray-100 flex items-center justify-center">
                    {item.image_url ? (
                      <img
                        src={item.image_url.startsWith("http") ? item.image_url : ((import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, "") : "") + item.image_url)}
                        alt={item.title}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 bg-gray-100"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-sm text-gray-400 font-medium">No image</span>
                    )}
                    {newsDate && (
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-center shadow-md">
                        <span className="block text-xs font-bold text-red-600 uppercase tracking-wider">
                          {newsDate.toLocaleString("default", { month: "short" })}
                        </span>
                        <span className="block text-lg font-black text-indigo-900 leading-none">
                          {newsDate.getDate()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h4 className="text-xl font-bold text-indigo-950 mb-3 group-hover:text-red-600 transition-colors line-clamp-2 font-['Playfair_Display']">
                      {item.title}
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3 font-['Roboto']">
                      {item.content}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
      {/* Events Section */}
      <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 px-4">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0f0f50] mb-4 font-['Inter']">
          Event <span className="text-red-600 font-['Playfair_Display']">Timeline</span>
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 font-['Roboto']">
          Explore our upcoming plans and look back at our history.
        </p>
        <div className="mt-8 border-b border-gray-200 inline-block">
          <div className="flex space-x-8 justify-center">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`pb-2 font-bold transition-colors text-lg ${
                activeTab === "upcoming"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-indigo-600"
              }`}
            >
              Upcoming Events
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`pb-2 font-bold transition-colors text-lg ${
                activeTab === "past"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-indigo-600"
              }`}
            >
              Past Events
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4">
        {loading && (
          <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#cf0408] mx-auto mb-4"></div>
              <p className="text-xl text-[#191938] font-['Inter']">
                Loading {activeTab} events...
              </p>
            </div>
          </div>
        )}
        {error && (
          <div className="p-4 rounded-lg bg-red-100 text-red-800 border border-red-400 text-center">
            {error}
          </div>
        )}
        {!loading && !error && events.length === 0 && (
          <div className="col-span-full text-center text-gray-500 text-lg p-8 bg-yellow-50 rounded-lg font-['Roboto']">
            <h3 className="text-xl font-semibold text-gray-700 font-['Playfair_Display']">
              No {activeTab === "upcoming" ? "Upcoming" : "Past"} Events Found
            </h3>
            <p className="mt-2 text-gray-500 font-['Roboto']">
              {activeTab === "upcoming"
                ? "Check back soon for new announcements!"
                : "This list will be updated as events conclude."}
            </p>
          </div>
        )}
        {!loading && !error && events.length > 0 && (
          <>
            {activeTab === "upcoming" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {events.map((event) => (
                  <UpcomingEventCard key={event.event_id} event={event} />
                ))}
              </div>
            )}
            {activeTab === "past" && (
              <div className="bg-white rounded-xl shadow-lg divide-y divide-gray-100">
                {events.map((event) => (
                  <PastEventListItem key={event.event_id} event={event} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Events;
