import React from "react";
import { Helmet } from "react-helmet-async";

const Seo = ({ title, description, keywords, canonicalPath, jsonLd }) => {
  const siteOrigin = typeof window !== "undefined" ? window.location.origin : "";
  const canonical = canonicalPath ? `${siteOrigin}${canonicalPath}` : undefined;

  return (
    <Helmet>
      {title ? <title>{title}</title> : null}
      {description ? <meta name="description" content={description} /> : null}
      {keywords ? <meta name="keywords" content={keywords} /> : null}
      {canonical ? <link rel="canonical" href={canonical} /> : null}
      {title ? <meta property="og:title" content={title} /> : null}
      {description ? <meta property="og:description" content={description} /> : null}
      {canonical ? <meta property="og:url" content={canonical} /> : null}
      <meta property="og:type" content="website" />
      {jsonLd ? (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      ) : null}
    </Helmet>
  );
};

export default Seo;
