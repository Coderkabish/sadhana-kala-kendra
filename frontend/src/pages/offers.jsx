import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPublicOffers } from "../services/offersService";
import api, { SERVER_ROOT_URL } from "../admin/services/api";
import Seo from "../components/Seo";
import PageLoader from "../components/PageLoader";
import EmptyState from "../components/EmptyState";

const buildImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const fixed = path.startsWith("/") ? path : `/${path}`;
  return `${SERVER_ROOT_URL}${fixed}`;
};

const normalizeCtaUrl = (rawUrl) => {
  if (!rawUrl) return "";
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const formatDateOnly = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [courseMap, setCourseMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch offers
        const offersData = await getPublicOffers();
        setOffers(Array.isArray(offersData) ? offersData : []);
        
        // Fetch all courses to build a map for course offer display
        const coursesResponse = await api.get("/courses");
        const coursesData = coursesResponse.data || [];
        const map = {};
        coursesData.forEach((course) => {
          map[course.id] = course.title;
        });
        setCourseMap(map);
      } catch (err) {
        setError("Failed to load offers.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <section className="py-16 md:py-20 bg-gray-50 min-h-screen">
      <Seo
        title="Current Offers and Discounts | Sadhana Kala Kendra"
        description="Browse current offers, limited-time admissions, and special training opportunities at Sadhana Kala Kendra for music, dance, and performing arts students."
        keywords="music school offers, dance class discounts, admission offers Nepal, Sadhana Kala Kendra offers, performing arts promotions"
        canonicalPath="/offers"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0f0f50] font-['Inter']">
            Special <span className="text-red-600">Offers</span>
          </h1>
          <p className="mt-3 text-gray-600 text-base sm:text-lg max-w-3xl mx-auto font-['Roboto']">
            Explore ongoing offers and limited-time opportunities at Sadhana Kala Kendra.
          </p>
        </div>

        {loading ? (
          <PageLoader message="Loading offers content..." />
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-center">
            {error}
          </div>
        ) : offers.length === 0 ? (
          <EmptyState
            title="No Offers Found"
            description="No active offers are available right now."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {offers.map((offer) => (
              <article
                key={offer.offer_id}
                className="group bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-2xl transition duration-300"
              >
                <div className="h-52 bg-gray-100 overflow-hidden">
                  {offer.image_url ? (
                    <img
                      src={buildImageUrl(offer.image_url)}
                      alt={offer.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">No image</div>
                  )}
                </div>
                <div className="p-6 flex flex-col h-[calc(100%-13rem)]">
                  {offer.course_id && courseMap[offer.course_id] && (
                    <div className="mb-2">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        Course: {courseMap[offer.course_id]}
                      </span>
                    </div>
                  )}
                  <h2 className="text-xl font-bold text-[#191938] mb-1 font-['Inter'] line-clamp-2">{offer.title}</h2>
                  {offer.subtitle && (
                    <p className="text-sm font-semibold text-red-600 mb-3 line-clamp-1">{offer.subtitle}</p>
                  )}
                  {(offer.valid_from || offer.valid_to) && (
                    <p className="text-xs text-gray-500 mb-2 font-['Roboto']">
                      Valid: {formatDateOnly(offer.valid_from) || "Any"} to {formatDateOnly(offer.valid_to) || "Any"}
                    </p>
                  )}
                  <p className="text-gray-700 text-sm leading-relaxed line-clamp-4 font-['Roboto'] flex-1">
                    {offer.description || "Offer details will be updated soon."}
                  </p>

                  {offer.slug ? (
                    <Link
                      to={`/offers/${offer.slug}`}
                      className="mt-5 inline-flex w-fit items-center gap-2 px-4 py-2 rounded-full border border-indigo-700 text-indigo-700 font-semibold hover:bg-indigo-50 transition"
                    >
                      View Detail Page
                    </Link>
                  ) : null}

                  {offer.cta_link && (
                    <a
                      href={normalizeCtaUrl(offer.cta_link)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-flex w-fit items-center gap-2 px-4 py-2 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                    >
                      {offer.cta_text || "Know More"}
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Offers;
