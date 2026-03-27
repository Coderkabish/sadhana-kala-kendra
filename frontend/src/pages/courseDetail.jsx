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

const CourseDetail = () => {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/courses/${slug}`, {
          params: { _t: Math.random() } // Bypass cache
        });
        setCourse(data);
      } catch (err) {
        setError("Course not found.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) {
    return <PageLoader message="Loading course details..." />;
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <EmptyState
            title="No Course Found"
            description={error || "The course you are looking for does not exist or may have been removed."}
            className="mb-6"
          />
          <Link
            to="/courses"
            className="inline-block bg-[#cf0408] hover:bg-[#a90306] text-white font-semibold px-6 py-3 rounded-full transition"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const title = course.seo_title || `${course.course_name} | Sadhana Kala Kendra`;
  const description = course.seo_description || course.description || "Course details";
  const hasPrice = course.price !== null && course.price !== undefined && course.price !== "";
  const hasSchedules = Array.isArray(course.schedules) && course.schedules.length > 0;

  const originalPrice = hasPrice ? Number(course.price) : null;
  const safeOffers = Array.isArray(course.offers) ? course.offers : [];

  const primaryOffer = safeOffers.find((offer) => {
    const amount = Number(offer?.discount_percentage || 0);
    return Number.isFinite(amount) && amount > 0;
  }) || null;

  const getDiscountedPrice = (basePrice, offer) => {
    if (!Number.isFinite(basePrice) || !offer) return basePrice;

    const amount = Number(offer.discount_percentage || 0);
    if (!Number.isFinite(amount) || amount <= 0) return basePrice;

    if (offer.discount_type === "fixed") {
      return Math.max(0, basePrice - amount);
    }

    const percent = Math.min(100, Math.max(0, amount));
    return Math.max(0, (basePrice * (100 - percent)) / 100);
  };

  const finalPrice = Number.isFinite(originalPrice)
    ? getDiscountedPrice(originalPrice, primaryOffer)
    : null;

  const hasDiscount =
    Number.isFinite(originalPrice) &&
    Number.isFinite(finalPrice) &&
    finalPrice < originalPrice;

  const PriceDisplay = () => {
    if (!hasPrice) {
      return <span>Price on request</span>;
    }

    if (!hasDiscount) {
      return <span>NPR {originalPrice.toLocaleString()}</span>;
    }

    const badgeText =
      primaryOffer?.discount_type === "fixed"
        ? `NPR ${Number(primaryOffer.discount_percentage).toLocaleString()} OFF`
        : `${Number(primaryOffer.discount_percentage)}% OFF`;

    return (
      <div className="flex items-center gap-3">
        <span className="text-red-600 line-through text-sm font-semibold">
          NPR {originalPrice.toLocaleString()}
        </span>
        <span className="text-green-600 font-bold text-lg">
          NPR {Math.round(finalPrice).toLocaleString()}
        </span>
        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-semibold">
          {badgeText}
        </span>
      </div>
    );
  };

  const stats = [
    { label: "Instructor", value: course.teacher_name || "N/A" },
    {
      label: "Price",
      value: <PriceDisplay />,
    },
    {
      label: "Schedule Status",
      value: hasSchedules ? `${course.schedules.length} schedule option(s)` : "No schedules yet",
    },
  ];

  const formatTime = (timeValue) => {
    if (!timeValue) return "";
    const [h, m] = String(timeValue).split(":");
    const hours = Number(h);
    const minutes = Number(m);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return String(timeValue);
    const suffix = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${String(minutes).padStart(2, "0")} ${suffix}`;
  };

  return (
    <>
      <Seo
        title={title}
        description={description}
        keywords={course.seo_keywords}
        canonicalPath={`/courses/${slug}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: course.course_name,
          description,
          provider: {
            "@type": "Organization",
            name: "Sadhana Kala Kendra",
          },
        }}
      />
      <DetailPageLayout
        backTo="/courses"
        backLabel="Back to all courses"
        imageSrc={course.image_url ? asImage(course.image_url) : ""}
        imageAlt={course.course_name}
        title={course.course_name}
        description={course.description || "Course details will be updated soon."}
        stats={stats}
        sections={(
          <>
            {hasDiscount && primaryOffer && (
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 mb-8">
                <h2 className="text-xl font-bold text-yellow-900 mb-4">Special Offer Available!</h2>
                <div className="space-y-3">
                  {[primaryOffer].map((offer) => (
                    <div
                      key={offer.offer_id}
                      className="rounded-lg bg-white px-4 py-3 border border-yellow-300 shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-yellow-900">{offer.title}</p>
                          {offer.subtitle && (
                            <p className="text-xs text-yellow-700 mt-1">{offer.subtitle}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                            {offer.discount_type === "fixed"
                              ? `NPR ${Number(offer.discount_percentage).toLocaleString()} OFF`
                              : `${Number(offer.discount_percentage)}% OFF`}
                          </span>
                        </div>
                      </div>
                      {offer.description && (
                        <p className="text-xs text-gray-600 mt-2">{offer.description}</p>
                      )}
                      {offer.valid_to && (
                        <p className="text-xs text-yellow-700 font-semibold mt-2">
                          Valid until: {new Date(offer.valid_to).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="rounded-xl border border-gray-200 p-5 bg-white mb-8">
              <h2 className="text-xl font-bold text-[#191938] mb-4">Scheduled Classes</h2>
              {hasSchedules ? (
                <div className="space-y-3">
                  {course.schedules.map((schedule) => (
                    <div
                      key={schedule.schedule_id || `${schedule.class_day}-${schedule.start_time}-${schedule.end_time}`}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg bg-gray-50 px-4 py-3 border border-gray-100"
                    >
                      <p className="text-sm font-semibold text-gray-800">{schedule.class_day || "Day not set"}</p>
                      <p className="text-sm text-gray-600">
                        {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                        {schedule.teacher_name ? ` • ${schedule.teacher_name}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No schedules set for this course yet.</p>
              )}

              <p className="mt-4 text-sm font-medium text-[#191938] bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                Note: Special classes are available upon request based on student needs..
              </p>
            </div>
          </>
        )}
        actions={(
          <>
            <Link
              to="/register"
              className="inline-flex items-center justify-center bg-[#cf0408] hover:bg-[#a90306] text-white font-semibold px-6 py-3 rounded-full transition"
            >
              Apply Now
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center justify-center border border-[#191938] text-[#191938] hover:bg-[#191938] hover:text-white font-semibold px-6 py-3 rounded-full transition"
            >
              Explore More Courses
            </Link>
          </>
        )}
      />
    </>
  );
};

export default CourseDetail;
