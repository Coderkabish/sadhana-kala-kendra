import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../admin/services/api";
import Seo from "../components/Seo";
import PageLoader from "../components/PageLoader";
import EmptyState from "../components/EmptyState";
import DetailPageLayout from "../components/DetailPageLayout";

const EventDetail = () => {
  const { slug } = useParams();
  const [eventItem, setEventItem] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/events/${slug}`);
        setEventItem(data);
      } catch {
        setError("Event not found.");
      }
    };
    load();
  }, [slug]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <EmptyState
          title="No Event Found"
          description={error}
          className="max-w-2xl"
        />
      </div>
    );
  }
  if (!eventItem) return <PageLoader message="Loading event details..." />;

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

  const title = eventItem.seo_title || `${eventItem.event_name} | Sadhana Kala Kendra`;
  const description = eventItem.seo_description || eventItem.description || "Event details";
  const stats = [
    { label: "Date", value: formatDateDisplay(eventItem.event_date) },
    { label: "Time", value: eventItem.event_time || "TBD" },
    { label: "Venue", value: eventItem.venue || "TBD" },
  ];

  return (
    <>
      <Seo
        title={title}
        description={description}
        keywords={eventItem.seo_keywords}
        canonicalPath={`/events/${slug}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Event",
          name: eventItem.event_name,
          startDate: eventItem.event_date || undefined,
          location: eventItem.venue
            ? {
                "@type": "Place",
                name: eventItem.venue,
              }
            : undefined,
          organizer: {
            "@type": "Organization",
            name: eventItem.organized_by || "Sadhana Kala Kendra",
          },
          description,
        }}
      />

      <DetailPageLayout
        backTo="/events"
        backLabel="Back to all events"
        title={eventItem.event_name}
        description={eventItem.description || "Event details will be updated soon."}
        stats={stats}
        sections={(
          <div className="rounded-xl border border-gray-200 p-5 bg-white mb-8">
        
            <p className="text-sm text-gray-700 mb-2">
              Organized by: <span className="font-bold">{eventItem.organized_by || "Sadhana Kala Kendra"}</span>
            </p>
          </div>
        )}
        actions={(  
          <Link
            to="/events"
            className="inline-flex items-center justify-center border border-[#191938] text-[#191938] hover:bg-[#191938] hover:text-white font-semibold px-6 py-3 rounded-full transition"
          >
            Explore More Events
          </Link>
        )}
      />
    </>
  );
};

export default EventDetail;
