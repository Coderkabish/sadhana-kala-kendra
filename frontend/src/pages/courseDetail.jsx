import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api, { SERVER_ROOT_URL } from "../admin/services/api";
import Seo from "../components/Seo";

const asImage = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${SERVER_ROOT_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const CourseDetail = () => {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/courses/${slug}`);
        setCourse(data);
      } catch {
        setError("Course not found.");
      }
    };
    load();
  }, [slug]);

  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;
  if (!course) return <div className="p-10 text-center">Loading...</div>;

  const title = course.seo_title || `${course.course_name} | Sadhana Kala Kendra`;
  const description = course.seo_description || course.description || "Course details";

  return (
    <section className="max-w-4xl mx-auto px-4 py-12">
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
      {course.image_url ? (
        <img src={asImage(course.image_url)} alt={course.course_name} className="w-full h-72 object-cover rounded-xl mb-6" />
      ) : null}
      <h1 className="text-3xl font-bold mb-3">{course.course_name}</h1>
      <p className="text-gray-700 mb-4">{course.description}</p>
      <p className="text-sm text-gray-500">Level: {course.level || "N/A"}</p>
      <p className="text-sm text-gray-500">Teacher: {course.teacher_name || "N/A"}</p>
    </section>
  );
};

export default CourseDetail;
