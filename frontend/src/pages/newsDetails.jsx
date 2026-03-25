import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getNewsById } from "../services/newsService";
import Seo from "../components/Seo";

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') || '';

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

const NewsDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeVideoKey, setActiveVideoKey] = useState(null);
  const [isActiveVideoPaused, setIsActiveVideoPaused] = useState(false);
  const videoIframeRefs = useRef({});

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getNewsById(slug);
        setNews(data);
        // Use news_id to fetch resources
        if (data?.news_id) {
          const res = await fetch(`${API_BASE}/api/news/${data.news_id}/resources`);
          if (res.ok) {
            setResources(await res.json());
          } else {
            setResources([]);
          }
        }
      } catch (err) {
        setError("News not found or failed to load.");
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [slug]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }
    };

    if (selectedImage) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [selectedImage]);

  const imageResources = useMemo(
    () => resources.filter((resource) => resource.resource_type === "image" && resource.resource_url),
    [resources]
  );

  const youtubeResources = useMemo(
    () => resources.filter((resource) => resource.resource_type === "youtube" && resource.resource_url),
    [resources]
  );

  const sendYouTubeCommand = (videoKey, command) => {
    const iframe = videoIframeRefs.current[videoKey];
    if (!iframe || !iframe.contentWindow) return;

    iframe.contentWindow.postMessage(
      JSON.stringify({
        event: "command",
        func: command,
        args: [],
      }),
      "*"
    );
  };

  if (loading) return <div className="p-20 text-center text-[#0f0f50] font-['Inter'] text-xl">Loading...</div>;
  if (error) return <div className="p-20 text-center text-red-600 font-['Inter']">{error}</div>;
  if (!news) return null;

  // Utility to safely get YouTube video ID
  const getYouTubeId = (urlString) => {
    try {
      const url = new URL(urlString);
      let id = '';
      if (url.hostname === 'youtu.be') {
        id = url.pathname.slice(1);
      } else if (url.searchParams.get('v')) {
        id = url.searchParams.get('v');
      } else if (url.pathname.includes('/embed/')) {
        id = url.pathname.split('/embed/')[1];
      } else if (url.pathname.includes('/shorts/')) {
        id = url.pathname.split('/shorts/')[1];
      }
      return id.split('?')[0]; // Remove extra query strings
    } catch {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8f4ef_0%,#fffdf9_22%,#fff_100%)] font-['Roboto'] pb-20">
      <Seo
        title={news.seo_title || `${news.title} | Sadhana Kala Kendra`}
        description={news.seo_description || news.content}
        keywords={news.seo_keywords}
        canonicalPath={`/news/${slug}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: news.title,
          datePublished: news.news_date || undefined,
          description: news.seo_description || news.content,
          author: {
            "@type": "Organization",
            name: "Sadhana Kala Kendra",
          },
        }}
      />
      <div className="sticky top-0 z-50 border-b border-[#e9e1d6] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-[#eadfce] bg-white px-4 py-2 text-sm font-bold text-[#1f2a44] transition-colors hover:border-[#cf0408] hover:text-[#cf0408] font-['Inter']"
          >
            <span className="text-lg">←</span>
            Back
          </button>
          <span className="text-[11px] font-black uppercase tracking-[0.35em] text-[#cf0408] font-['Inter']">
            Sadhana News Desk
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-8 md:px-6 md:pt-12">
        <article className="overflow-hidden rounded-4xl border border-[#eee4d7] bg-white shadow-[0_20px_80px_rgba(30,35,45,0.08)]">
          <div className="relative overflow-hidden border-b border-[#efe7db] bg-[radial-gradient(circle_at_top_left,#fff5ef_0%,#fff_42%,#f8f1e8_100%)] px-6 py-10 md:px-10 md:py-14">
            <div className="absolute -right-16 top-0 h-40 w-40 rounded-full bg-[#cf0408]/8 blur-3xl" />
            <div className="absolute left-0 top-12 h-32 w-32 rounded-full bg-[#1f2a44]/6 blur-3xl" />

            <div className="relative mx-auto max-w-4xl text-center">
              

              <h1 className="mx-auto max-w-4xl text-2xl font-black leading-tight text-[#17213a] md:text-4xl md:leading-[1.1] font-['Inter']">
                {news.title}
              </h1>

            </div>
          </div>

          <div>
            <div className="px-6 py-8 md:px-10 md:py-10">
              {news.image_url && (
                <button
                  type="button"
                  onClick={() => setSelectedImage({ src: toAbsoluteUrl(news.image_url), title: news.title })}
                  className="group mb-8 block w-full overflow-hidden rounded-3xl border border-[#ece3d7] bg-[#f5f1ea] text-left shadow-sm"
                >
                  <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-[#f2ede5]">
                    <img
                      src={toAbsoluteUrl(news.image_url)}
                      alt={news.title}
                      className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-linear-to-t from-black/60 to-transparent px-5 py-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <span className="text-sm font-semibold">Open image</span>
                      <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]">
                        View
                      </span>
                    </div>
                  </div>
                </button>
              )}

              <div className="mx-auto max-w-3xl">
                <div className="mb-8 flex flex-wrap items-center gap-3 border-y border-[#efe6da] py-4 text-xs font-bold uppercase tracking-[0.25em] text-[#6a7078] font-['Inter']">
                  <span className="rounded-full bg-[#f7efe5] px-3 py-1 text-[#9e4b2f]">Published</span>
                  <span>{formatDisplayDate(news.news_date)}</span>
                </div>

                <div className="prose prose-lg max-w-none text-[#2e3440] prose-p:leading-8 prose-p:text-[17px] prose-p:text-[#2f3744] prose-headings:font-['Inter'] prose-headings:text-[#17213a]">
                  {news.content
                    ?.split(/\n+/)
                    .filter(Boolean)
                    .map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                </div>
              </div>

              {imageResources.length > 0 && (
                <section className="mt-14 border-t border-[#efe7db] pt-10">
                  <div className="mb-6 flex items-end justify-between gap-4">
                    <div>

                      <h2 className="mt-2 text-2xl font-black text-[#17213a] font-['Inter']">
                        Related Images
                      </h2>
                    </div>
                    <p className="hidden text-sm text-[#707785] md:block">
                      Click any image to open it in full view.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {imageResources.map((img, idx) => {
                      const absoluteUrl = toAbsoluteUrl(img.resource_url);
                      return (
                        <button
                          key={img.resource_id || idx}
                          type="button"
                          onClick={() =>
                            setSelectedImage({
                              src: absoluteUrl,
                              title: `${news.title} - Image ${idx + 1}`,
                            })
                          }
                          className="group relative aspect-square overflow-hidden rounded-2xl border border-[#ece3d7] bg-[#f5f1ea] text-left shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
                        >
                          <img
                            src={absoluteUrl}
                            alt={`${news.title} related ${idx + 1}`}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                          <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-[#17213a] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            View
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {youtubeResources.length > 0 && (
                <section className="mt-14 border-t border-[#efe7db] pt-10">
                  <div className="mb-6">
                    <h2 className="mt-2 text-2xl font-black text-[#17213a] font-['Inter']">
                      Related Videos
                    </h2>
                  </div>

                  <div className="space-y-8">
                    {youtubeResources.map((yt, idx) => {
                      const videoId = getYouTubeId(yt.resource_url);
                      if (!videoId) return null;
                      const videoKey = yt.resource_id || idx;
                      const isPlaying = activeVideoKey === videoKey;
                      return (
                        <div
                          key={videoKey}
                          className="overflow-hidden rounded-3xl border border-[#ece3d7] bg-[#111] shadow-xl"
                        >
                          <div className="aspect-video w-full">
                            {isPlaying ? (
                              <div className="relative h-full w-full">
                                <iframe
                                  ref={(el) => {
                                    if (el) {
                                      videoIframeRefs.current[videoKey] = el;
                                    }
                                  }}
                                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1&enablejsapi=1`}
                                  title={`YouTube Video ${idx + 1}`}
                                  width="100%"
                                  height="100%"
                                  className="h-full w-full pointer-events-none"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                                  allowFullScreen
                                  style={{ border: 0 }}
                                ></iframe>

                                <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (isActiveVideoPaused) {
                                        sendYouTubeCommand(videoKey, "playVideo");
                                        setIsActiveVideoPaused(false);
                                      } else {
                                        sendYouTubeCommand(videoKey, "pauseVideo");
                                        setIsActiveVideoPaused(true);
                                      }
                                    }}
                                    className="rounded-full bg-white/95 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#1f2a44] shadow-md"
                                  >
                                    {isActiveVideoPaused ? "Resume" : "Pause"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveVideoKey(null);
                                      setIsActiveVideoPaused(false);
                                    }}
                                    className="rounded-full bg-[#cf0408] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-md"
                                  >
                                    Stop
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveVideoKey(videoKey);
                                  setIsActiveVideoPaused(false);
                                }}
                                className="group relative h-full w-full overflow-hidden"
                                aria-label={`Play video ${idx + 1}`}
                              >
                                <img
                                  src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                                  alt={`YouTube thumbnail ${idx + 1}`}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/35 transition-colors duration-300 group-hover:bg-black/45" />
                                <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-600 text-2xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                                  ▶
                                </span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>

          </div>
        </article>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-h-full max-w-full" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#cf0408]/85 text-2xl font-light text-white shadow-lg transition-colors hover:bg-[#cf0408]"
              onClick={() => setSelectedImage(null)}
              aria-label="Close image viewer"
            >
              &times;
            </button>
            <img
              src={selectedImage.src}
              alt={selectedImage.title || "Preview"}
              className="max-h-[85vh] max-w-[92vw] rounded-3xl object-contain shadow-2xl"
            />
            {selectedImage.title && (
              <p className="mt-4 max-w-[92vw] truncate px-4 text-center text-sm font-semibold text-white md:text-base">
                {selectedImage.title}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsDetail;
