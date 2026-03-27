import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaPlay } from "react-icons/fa";
import DOMPurify from "dompurify";
import { getNewsById } from "../services/newsService";
import Seo from "../components/Seo";
import PageLoader from "../components/PageLoader";
import EmptyState from "../components/EmptyState";
import DetailPageLayout from "../components/DetailPageLayout";
import styles from "./newsDetails.module.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, "") || "";

const toAbsoluteUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  return url.startsWith("http") ? url : `${API_BASE}${url}`;
};

const formatDisplayDate = (value) => {
  if (!value) return "Recent";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getYouTubeId = (urlString) => {
  try {
    const url = new URL(urlString);
    let id = "";
    if (url.hostname === "youtu.be") {
      id = url.pathname.slice(1);
    } else if (url.searchParams.get("v")) {
      id = url.searchParams.get("v");
    } else if (url.pathname.includes("/embed/")) {
      id = url.pathname.split("/embed/")[1];
    } else if (url.pathname.includes("/shorts/")) {
      id = url.pathname.split("/shorts/")[1];
    }
    return id.split("?")[0];
  } catch {
    return "";
  }
};

const ClickToPlayYouTube = ({ videoId, videoKey, title, isPlaying, onPlay }) => {
  const iframeRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isPlaying) {
      setIsPaused(false);
    }
  }, [isPlaying]);

  const sendYouTubeCommand = (command) => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;

    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({
        event: "command",
        func: command,
        args: [],
      }),
      "*"
    );
  };

  if (!videoId) return null;

  if (isPlaying) {
    return (
      <div className="relative h-full w-full">
        <iframe
          ref={iframeRef}
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1&enablejsapi=1`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          className="rounded-lg w-full aspect-video pointer-events-none"
        ></iframe>

        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (isPaused) {
                sendYouTubeCommand("playVideo");
                setIsPaused(false);
              } else {
                sendYouTubeCommand("pauseVideo");
                setIsPaused(true);
              }
            }}
            className="rounded-full bg-white/95 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#1f2a44] shadow-md"
          >
            {isPaused ? "Resume" : "Pause"}
          </button>
          <button
            type="button"
            onClick={() => {
              sendYouTubeCommand("stopVideo");
              setIsPaused(false);
              onPlay(null);
            }}
            className="rounded-full bg-[#cf0408] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-md"
          >
            Stop
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onPlay(videoKey)}
      className="group relative h-full w-full overflow-hidden rounded-lg"
      aria-label={`Play ${title}`}
    >
      <img
        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
        alt={`${title} thumbnail`}
        className="h-full w-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/35 transition-colors duration-300 group-hover:bg-black/45" />
      <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
        <FaPlay className="text-2xl" />
      </span>
    </button>
  );
};

const NewsDetail = () => {
  const { slug } = useParams();
  const [news, setNews] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeVideoKey, setActiveVideoKey] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getNewsById(slug);
        setNews(data);

        if (data?.news_id) {
          const res = await fetch(`${API_BASE}/api/news/${data.news_id}/resources`);
          if (res.ok) {
            setResources(await res.json());
          } else {
            setResources([]);
          }
        }
      } catch {
        setError("News not found or failed to load.");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [slug]);

  const imageResources = useMemo(
    () => resources.filter((resource) => resource.resource_type === "image" && resource.resource_url),
    [resources]
  );

  const youtubeResources = useMemo(
    () => resources.filter((resource) => resource.resource_type === "youtube" && resource.resource_url),
    [resources]
  );

  if (loading) return <PageLoader message="Loading news details..." />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <EmptyState title="No News Found" description={error} className="max-w-2xl" />
      </div>
    );
  }

  if (!news) return null;

  const title = news.seo_title || `${news.title} | Sadhana Kala Kendra`;
  const description = news.seo_description || news.rich_content || "News details";
  const stats = [
    { label: "Published Date", value: formatDisplayDate(news.news_date) },
    { label: "Source", value: "Sadhana Kala Kendra" },
  ];

  return (
    <>
      <Seo
        title={title}
        description={description}
        keywords={news.seo_keywords}
        canonicalPath={`/news/${slug}`}
        image={news.image_url ? toAbsoluteUrl(news.image_url) : undefined}
        ogType="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: news.title,
          datePublished: news.news_date || undefined,
          description,
          image: news.image_url ? toAbsoluteUrl(news.image_url) : undefined,
          author: {
            "@type": "Organization",
            name: "Sadhana Kala Kendra",
          },
        }}
      />

      <DetailPageLayout
        backTo="/events"
        backLabel="Back to all updates"
        imageSrc={news.image_url ? toAbsoluteUrl(news.image_url) : ""}
        imageAlt={news.title}
        imageFitClass="object-contain"
        title={news.title}
        stats={stats}
        sections={(
          <>
            {news.rich_content && (
              <div className={`${styles.newsContent} bg-white p-8 rounded-lg shadow-sm border border-gray-200 mb-8`}>
                <div
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(news.rich_content),
                  }}
                />
              </div>
            )}

            {imageResources.length > 0 ? (
              <div className="rounded-xl border border-gray-200 p-5 bg-white mb-8">
                <h2 className="text-xl font-bold text-[#191938] mb-4">Related Images</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imageResources.map((img, idx) => {
                    const absoluteUrl = toAbsoluteUrl(img.resource_url);
                    return (
                      <a
                        key={img.resource_id || idx}
                        href={absoluteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-lg overflow-hidden border border-gray-100"
                      >
                        <img
                          src={absoluteUrl}
                          alt={`${news.title} related ${idx + 1}`}
                          className="w-full h-40 object-cover"
                          loading="lazy"
                        />
                      </a>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {youtubeResources.length > 0 ? (
              <div className="rounded-xl border border-gray-200 p-5 bg-white mb-8">
                <h2 className="text-xl font-bold text-[#191938] mb-4">Related Videos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {youtubeResources.map((yt, idx) => {
                    const videoId = getYouTubeId(yt.resource_url);
                    if (!videoId) return null;
                    const videoKey = yt.resource_id || idx;
                    return (
                      <div key={yt.resource_id || idx} className="rounded-lg overflow-hidden border border-gray-100 bg-black">
                        <ClickToPlayYouTube
                          videoId={videoId}
                          videoKey={videoKey}
                          title={`YouTube Video ${idx + 1}`}
                          isPlaying={activeVideoKey === videoKey}
                          onPlay={(key) => setActiveVideoKey(key)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </>
        )}
        actions={(
          <Link
            to="/events"
            className="inline-flex items-center justify-center border border-[#191938] text-[#191938] hover:bg-[#191938] hover:text-white font-semibold px-6 py-3 rounded-full transition"
          >
            Explore More Updates
          </Link>
        )}
      />
    </>
  );
};

export default NewsDetail;
