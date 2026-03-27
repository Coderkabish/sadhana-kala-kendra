import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { SERVER_ROOT_URL } from "../admin/services/api";
import Seo from "../components/Seo";
import PageLoader from "../components/PageLoader";
import EmptyState from "../components/EmptyState";
import DetailPageLayout from "../components/DetailPageLayout";

const toProgramSlug = (program) => {
  if (program?.slug) return program.slug;
  return String(program?.title || "program")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const asImage = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${SERVER_ROOT_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const formatDisplayDate = (value) => {
  if (!value) return "Date not available";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const AboutProgramDetail = () => {
  const { slug } = useParams();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProgram = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get("/programs");
        const programs = Array.isArray(data) ? data : [];
        const match = programs.find((item) => toProgramSlug(item) === slug);
        if (!match) {
          setError("Program not found.");
          return;
        }
        setProgram(match);
      } catch {
        setError("Program details failed to load.");
      } finally {
        setLoading(false);
      }
    };

    loadProgram();
  }, [slug]);

  const description = useMemo(() => {
    if (!program?.description) return "Program details will be updated soon.";
    return program.description;
  }, [program]);

  if (loading) return <PageLoader message="Loading program details..." />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <EmptyState title="No Program Found" description={error} className="max-w-2xl" />
      </div>
    );
  }

  if (!program) return null;

  const title = `${program.title} | Sadhana Kala Kendra`;
  const stats = [
    { label: "Program Date", value: formatDisplayDate(program.program_date) },
    { label: "Organizer", value: "Sadhana Kala Kendra" },
  ];

  return (
    <>
      <Seo
        title={title}
        description={description}
        canonicalPath={`/about/${slug}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "EducationalEvent",
          name: program.title,
          description,
          startDate: program.program_date || undefined,
          organizer: {
            "@type": "Organization",
            name: "Sadhana Kala Kendra",
          },
        }}
      />

      <DetailPageLayout
        backTo="/about"
        backLabel="Back to About"
        imageSrc={program.image_url ? asImage(program.image_url) : ""}
        imageAlt={program.title}
        imageFitClass="object-contain"
        title={program.title}
        description={description}
        stats={stats}
        actions={(
          <Link
            to="/events"
            className="inline-flex items-center justify-center border border-[#191938] text-[#191938] hover:bg-[#191938] hover:text-white font-semibold px-6 py-3 rounded-full transition"
          >
            Explore All Programs
          </Link>
        )}
      />
    </>
  );
};

export default AboutProgramDetail;
