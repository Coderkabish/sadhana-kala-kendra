/**
 * Frontend SEO Service
 * Fetches SEO metadata from the backend API
 */

import { API_CONFIG } from "../config/api";

// Type definitions
interface SEOMeta {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  og?: Record<string, string>;
  twitter?: Record<string, string>;
}

interface SEOResponse {
  success: boolean;
  data?: {
    meta?: SEOMeta;
    schema?: Record<string, unknown>;
  };
}

interface Breadcrumb {
  name: string;
  url: string;
}

interface SEOMetadataParams {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
}

interface JSONLDSchema {
  "@context": string;
  "@type": string;
  [key: string]: unknown;
}

const API_BASE_URL = API_CONFIG.BASE_URL;

export class SEOService {
  /**
   * Fetch SEO metadata for a dynamic item
   * @param type - Content type (course, event, news, teacher, etc.)
   * @param slug - Item slug
   * @returns SEO metadata
   */
  static async fetchItemSEO(type: string, slug: string): Promise<{ meta?: SEOMeta; schema?: Record<string, unknown> } | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/seo/meta/${type}/${slug}`, {
        // Cache this for 1 hour on client
        next: { revalidate: 3600 },
      });

      if (!response.ok) {
        console.warn(`Failed to fetch SEO metadata for ${type}/${slug}`);
        return null;
      }

      const data: SEOResponse = await response.json();
      return data.data || null;
    } catch (error) {
      console.error("Error fetching item SEO:", error);
      return null;
    }
  }

  /**
   * Fetch SEO metadata for a static page
   * @param page - Page name (home, about, courses, etc.)
   * @returns SEO metadata
   */
  static async fetchPageSEO(page: string): Promise<{ meta?: SEOMeta; schema?: Record<string, unknown> } | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/seo/page/${page}`, {
        // Cache this for 24 hours
        next: { revalidate: 86400 },
      });

      if (!response.ok) {
        console.warn(`Failed to fetch SEO metadata for page: ${page}`);
        return null;
      }

      const data: SEOResponse = await response.json();
      return data.data || null;
    } catch (error) {
      console.error("Error fetching page SEO:", error);
      return null;
    }
  }

  /**
   * Fetch organization schema
   * @returns Organization schema
   */
  static async fetchOrganizationSchema(): Promise<JSONLDSchema | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/seo/organization`, {
        next: { revalidate: 86400 },
      });

      if (!response.ok) {
        console.warn("Failed to fetch organization schema");
        return null;
      }

      const data: SEOResponse = await response.json();
      return (data.data?.schema as JSONLDSchema) || null;
    } catch (error) {
      console.error("Error fetching organization schema:", error);
      return null;
    }
  }

  /**
   * Generate breadcrumb schema
   * @param breadcrumbs - Array of { name, url }
   * @returns Breadcrumb schema
   */
  static async generateBreadcrumbSchema(breadcrumbs: Breadcrumb[]): Promise<JSONLDSchema | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/seo/breadcrumb`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ breadcrumbs }),
      });

      if (!response.ok) {
        console.warn("Failed to generate breadcrumb schema");
        return null;
      }

      const data: SEOResponse = await response.json();
      return (data.data?.schema as JSONLDSchema) || null;
    } catch (error) {
      console.error("Error generating breadcrumb schema:", error);
      return null;
    }
  }

  /**
   * Build complete SEO metadata for a page
   * Combines meta tags, schemas, and other SEO data
   * @param params - SEO metadata parameters
   * @returns Complete SEO data
   */
  static buildSEOMetadata(params: SEOMetadataParams): Record<string, unknown> {
    const {
      title = "Sadhana Kala Kendra",
      description = "A premier cultural institute dedicated to preserving and promoting traditional Indian arts",
      keywords = "classical music, Indian arts",
      canonical = "https://www.sadhanakalakendra.com",
      ogImage = "https://www.sadhanakalakendra.com/og-image.png",
      ogType = "website",
      twitterCard = "summary_large_image",
    } = params;

    return {
      title,
      description,
      keywords,
      canonical,
      og: {
        title,
        description,
        image: ogImage,
        type: ogType,
        url: canonical,
      },
      twitter: {
        card: twitterCard,
        title,
        description,
        image: ogImage,
      },
    };
  }

  /**
   * Add JSON-LD schema to page head
   * @param schema - JSON-LD schema object
   */
  static addJSONLD(schema: JSONLDSchema): void {
    if (typeof window === "undefined") return;

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  }
}

export default SEOService;
