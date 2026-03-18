import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../admin/services/api";
import Seo from "../components/Seo";

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

  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;
  if (!eventItem) return <div className="p-10 text-center">Loading...</div>;

  const title = eventItem.seo_title || `${eventItem.event_name} | Sadhana Kala Kendra`;
  const description = eventItem.seo_description || eventItem.description || "Event details";

  return (
    <section className="max-w-4xl mx-auto px-4 py-12">
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
      <h1 className="text-3xl font-bold mb-3">{eventItem.event_name}</h1>
      <p className="text-gray-700 mb-4">{eventItem.description}</p>
      <p className="text-sm text-gray-500">Date: {eventItem.event_date || "TBD"}</p>
      <p className="text-sm text-gray-500">Time: {eventItem.event_time || "TBD"}</p>
      <p className="text-sm text-gray-500">Venue: {eventItem.venue || "TBD"}</p>
    </section>
  );
};

export default EventDetail;
