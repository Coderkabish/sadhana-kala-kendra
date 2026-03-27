import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOfferById } from "../services/offersService";
import { SERVER_ROOT_URL } from "../admin/services/api";
import Seo from "../components/Seo";
import PageLoader from "../components/PageLoader";
import EmptyState from "../components/EmptyState";
import DetailPageLayout from "../components/DetailPageLayout";

const asImage = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${SERVER_ROOT_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const normalizeCtaUrl = (rawUrl) => {
  if (!rawUrl) return "";
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const OfferDetail = () => {
  const { slug } = useParams();
  const [offer, setOffer] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getOfferById(slug);
        setOffer(data);
      } catch {
        setError("Offer not found.");
      }
    };
    load();
  }, [slug]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <EmptyState
          title="No Offer Found"
          description={error}
          className="max-w-2xl"
        />
      </div>
    );
  }
  if (!offer) return <PageLoader message="Loading offer details..." />;

  const title = offer.seo_title || `${offer.title} | Sadhana Kala Kendra`;
  const description = offer.seo_description || offer.description || "Offer details";
  const stats = [
    { label: "Status", value: "Active Offer" },
  ];

  return (
    <>
      <Seo
        title={title}
        description={description}
        keywords={offer.seo_keywords}
        canonicalPath={`/offers/${slug}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Offer",
          name: offer.title,
          description,
          validFrom: offer.valid_from || undefined,
          priceCurrency: "NPR",
        }}
      />

      <DetailPageLayout
        backTo="/offers"
        backLabel="Back to all offers"
        imageSrc={offer.image_url ? asImage(offer.image_url) : ""}
        imageAlt={offer.title}
        title={offer.title}
        description={offer.description || "Offer details will be updated soon."}
        stats={stats}
        actions={(
          <>
            {offer.cta_link ? (
              <a
                href={normalizeCtaUrl(offer.cta_link)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center bg-[#cf0408] hover:bg-[#a90306] text-white font-semibold px-6 py-3 rounded-full transition"
              >
                {offer.cta_text || "Know More"}
              </a>
            ) : null}
            <Link
              to="/offers"
              className="inline-flex items-center justify-center border border-[#191938] text-[#191938] hover:bg-[#191938] hover:text-white font-semibold px-6 py-3 rounded-full transition"
            >
              Explore More Offers
            </Link>
          </>
        )}
      />
    </>
  );
};

export default OfferDetail;
