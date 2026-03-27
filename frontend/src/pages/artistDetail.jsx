import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { SERVER_ROOT_URL } from "../admin/services/api";
import Seo from "../components/Seo";
import PageLoader from "../components/PageLoader";
import EmptyState from "../components/EmptyState";
import DetailPageLayout from "../components/DetailPageLayout";

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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <EmptyState
          title="No Artist Found"
          description={error}
          className="max-w-2xl"
        />
      </div>
    );
  }
  if (!artist) return <PageLoader message="Loading artist details..." />;

  const title = artist.seo_title || `${artist.full_name} | Sadhana Kala Kendra`;
  const description = artist.seo_description || artist.bio || "Artist profile";

  return (
    <>
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

      <DetailPageLayout
        backTo="/artists"
        backLabel="Back to all artists"
        imageSrc={artist.profile_image ? asImage(artist.profile_image) : ""}
        imageAlt={artist.full_name}
        title={artist.full_name}
        description={artist.bio || "Artist profile details will be updated soon."}
        actions={(
          <Link
            to="/artists"
            className="inline-flex items-center justify-center border border-[#191938] text-[#191938] hover:bg-[#191938] hover:text-white font-semibold px-6 py-3 rounded-full transition"
          >
            Explore More Artists
          </Link>
        )}
      />
    </>
  );
};

export default ArtistDetail;
