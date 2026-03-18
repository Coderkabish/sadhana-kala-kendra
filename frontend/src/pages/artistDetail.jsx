import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api, { SERVER_ROOT_URL } from "../admin/services/api";
import Seo from "../components/Seo";

const asImage = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${SERVER_ROOT_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const ArtistDetail = () => {
  const { slug } = useParams();
  const [artist, setArtist] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/artists/${slug}`);
        setArtist(data);
      } catch {
        setError("Artist not found.");
      }
    };
    load();
  }, [slug]);

  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;
  if (!artist) return <div className="p-10 text-center">Loading...</div>;

  const title = artist.seo_title || `${artist.full_name} | Sadhana Kala Kendra`;
  const description = artist.seo_description || artist.bio || "Artist profile";

  return (
    <section className="max-w-4xl mx-auto px-4 py-12">
      <Seo
        title={title}
        description={description}
        keywords={artist.seo_keywords}
        canonicalPath={`/artists/${slug}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: artist.full_name,
          description,
        }}
      />
      {artist.profile_image ? (
        <img src={asImage(artist.profile_image)} alt={artist.full_name} className="w-full h-72 object-cover rounded-xl mb-6" />
      ) : null}
      <h1 className="text-3xl font-bold mb-3">{artist.full_name}</h1>
      <p className="text-gray-700">{artist.bio}</p>
    </section>
  );
};

export default ArtistDetail;
