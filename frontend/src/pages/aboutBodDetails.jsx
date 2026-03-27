import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import api, { SERVER_ROOT_URL } from "../admin/services/api";
import Seo from "../components/Seo";
import PageLoader from "../components/PageLoader";
import EmptyState from "../components/EmptyState";
import DetailPageLayout from "../components/DetailPageLayout";
import styles from "./aboutBodDetails.module.css";

const asImage = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${SERVER_ROOT_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const AboutBodDetails = () => {
  const { slug } = useParams();
  const [bodMember, setBodMember] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch basic BOD member info
        const { data: member } = await api.get(`/about/bod/${slug}`);
        setBodMember(member);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching BOD member:", err);
        setError("BOD member not found.");
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <EmptyState
          title="No BOD Member Found"
          description={error}
          className="max-w-2xl"
        />
      </div>
    );
  }
  if (loading || !bodMember) return <PageLoader message="Loading BOD member details..." />;

  const title = bodMember.seo_title || `${bodMember.name} | Sadhana Kala Kendra`;
  const description = bodMember.seo_description || bodMember.designation || "Board member at Sadhana Kala Kendra";
  const keywords = bodMember.seo_keywords || `${bodMember.name}, board member, sadhana kala kendra`;
  const image = bodMember.profile_image ? asImage(bodMember.profile_image) : null;

  const sections = (
    <div className="space-y-8">
      {/* Profile Section */}
      <div className="text-center">
        {bodMember.profile_image && (
          <img
            src={asImage(bodMember.profile_image)}
            alt={bodMember.name}
            className="w-40 h-40 rounded-full mx-auto mb-6 object-cover shadow-lg"
          />
        )}
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{bodMember.name}</h1>
        {bodMember.designation && (
          <p className="text-xl text-red-600 font-semibold mb-6 uppercase tracking-wide">{bodMember.designation}</p>
        )}
      </div>

      {/* Bio/Description Section */}
      {bodMember.bio ? (
        <div className="bg-gray-50 p-8 rounded-lg">
          <p className="text-lg text-gray-800 leading-relaxed">{bodMember.bio}</p>
        </div>
      ) : (
        <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 rounded-lg">
          <p className="text-gray-700">No bio information available yet.</p>
        </div>
      )}

      {/* Detailed Content Section */}
      {bodMember.details_content ? (
        <div className={`${styles.detailsContent} bg-white p-8 rounded-lg shadow-sm border border-gray-200`}>
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(bodMember.details_content),
            }}
          />
        </div>
      ) : null}
    </div>
  );

  return (
    <>
      <Seo 
        title={title} 
        description={description}
        keywords={keywords}
        canonicalPath={`/about/bod/${slug}`}
        image={image}
        ogType="profile"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: bodMember.name,
          jobTitle: bodMember.designation || "Board Member",
          organization: {
            "@type": "Organization",
            name: "Sadhana Kala Kendra"
          },
          image: image,
          description: description
        }}
      />
      <DetailPageLayout
        sections={sections}
        breadcrumbs={[
          { label: "Home", link: "/" },
          { label: "About", link: "/about" },
          { label: "Board of Directors", link: "/about?section=bod" },
          { label: bodMember.name, link: "" },
        ]}
      />
    </>
  );
};

export default AboutBodDetails;
