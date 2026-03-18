import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOfferById } from "../services/offersService";
import { SERVER_ROOT_URL } from "../admin/services/api";
import Seo from "../components/Seo";

const asImage = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${SERVER_ROOT_URL}${path.startsWith("/") ? path : `/${path}`}`;
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

  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;
  if (!offer) return <div className="p-10 text-center">Loading...</div>;

  const title = offer.seo_title || `${offer.title} | Sadhana Kala Kendra`;
  const description = offer.seo_description || offer.description || "Offer details";

  return (
    <section className="max-w-4xl mx-auto px-4 py-12">
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
      {offer.image_url ? (
        <img src={asImage(offer.image_url)} alt={offer.title} className="w-full h-72 object-cover rounded-xl mb-6" />
      ) : null}
      <h1 className="text-3xl font-bold mb-3">{offer.title}</h1>
      {offer.subtitle ? <p className="text-red-600 mb-2">{offer.subtitle}</p> : null}
      <p className="text-gray-700 mb-4">{offer.description}</p>
      {offer.cta_link ? (
        <a href={offer.cta_link} target="_blank" rel="noreferrer" className="inline-block px-5 py-2 bg-red-600 text-white rounded-full">
          {offer.cta_text || "Know More"}
        </a>
      ) : null}
    </section>
  );
};

export default OfferDetail;
