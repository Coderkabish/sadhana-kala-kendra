import React from "react";
import { Helmet } from "react-helmet-async";

const isLocalOrigin = (origin) => {
  if (!origin) return true;
  try {
    const { hostname } = new URL(origin);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return true;
  }
};

const Seo = ({
  title,
  description,
  keywords,
  canonicalPath,
  jsonLd,
  ogType = "website",
  image,
  twitterCard = "summary_large_image",
}) => {
  const configuredOrigin = (import.meta.env.VITE_SITE_URL || "").replace(/\/$/, "");
  const runtimeOrigin =
    configuredOrigin || (typeof window !== "undefined" ? window.location.origin : "");
  const siteOrigin = isLocalOrigin(runtimeOrigin) ? "" : runtimeOrigin;
  const canonical = canonicalPath && siteOrigin ? `${siteOrigin}${canonicalPath}` : undefined;
  const imageUrl = image
    ? image.startsWith("http")
      ? image
      : siteOrigin
      ? `${siteOrigin}${image.startsWith("/") ? image : `/${image}`}`
      : undefined
    : undefined;

  return (
    <Helmet>
      {title ? <title>{title}</title> : null}
      {description ? <meta name="description" content={description} /> : null}
      {keywords ? <meta name="keywords" content={keywords} /> : null}
      {canonical ? <link rel="canonical" href={canonical} /> : null}
      {title ? <meta property="og:title" content={title} /> : null}
      {description ? <meta property="og:description" content={description} /> : null}
      {canonical ? <meta property="og:url" content={canonical} /> : null}
      {imageUrl ? <meta property="og:image" content={imageUrl} /> : null}
      <meta property="og:type" content={ogType} />
      {twitterCard ? <meta name="twitter:card" content={twitterCard} /> : null}
      {title ? <meta name="twitter:title" content={title} /> : null}
      {description ? <meta name="twitter:description" content={description} /> : null}
      {canonical ? <meta name="twitter:url" content={canonical} /> : null}
      {imageUrl ? <meta name="twitter:image" content={imageUrl} /> : null}
      {jsonLd ? (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      ) : null}
    </Helmet>
  );
};

export default Seo;
