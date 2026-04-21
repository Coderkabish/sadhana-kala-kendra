/**
 * Shared Helper Functions
 * This file contains utility functions used across multiple components and pages
 * Consolidates duplicate code for better maintainability
 */

import { API_CONFIG, getApiUrl } from '@/config/api';

/**
 * Convert a string or object to a URL-safe slug
 * Handles both direct string slugs and title-based slug generation
 * @param item - String or object with slug/title/name properties
 * @returns URL-safe slug string
 */
export const toSlug = (item: any): string => {
  if (typeof item === 'string') return item;
  if (item?.slug) return item.slug;
  
  const titleField = item?.title || item?.name || item?.event_name || 'item';
  return String(titleField)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

/**
 * Build a complete image URL from a relative or absolute path
 * Handles both API-based paths and external URLs
 * @param path - Image path (relative or absolute URL)
 * @returns Complete image URL
 */
export const buildImageUrl = (path: string | undefined | null): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;

  const apiBase = API_CONFIG.BASE_URL;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiBase}${normalizedPath}`;
};

/**
 * Alias for buildImageUrl - maintains backward compatibility
 * @param imagePath - Image path
 * @returns Complete image URL
 */
export const getImageUrl = (imagePath?: string): string => {
  return buildImageUrl(imagePath);
};

/**
 * Convert API-based image path to full URL using getApiUrl helper
 * @param imagePath - Image path from API
 * @returns Complete image URL
 */
export const formatImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath) return '';
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return getApiUrl(normalizedPath);
};

/**
 * Format date for display in long format
 * Example: "Monday, April 7, 2025"
 * @param dateString - ISO date string or Date
 * @returns Formatted date string
 */
export const formatDateDisplay = (dateString: string | undefined): string => {
  if (!dateString) return 'TBD';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'TBD';
  }
};

/**
 * Format date for display in short format
 * Example: "Apr 7, 2025"
 * @param dateString - ISO date string or Date
 * @returns Formatted date string
 */
export const formatDateOnly = (dateString: string | undefined): string => {
  if (!dateString) return 'TBD';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return 'TBD';
  }
};

/**
 * Format date for HTML input elements (YYYY-MM-DD format)
 * @param dateStr - ISO date string
 * @returns Date in YYYY-MM-DD format or empty string
 */
export const formatDateForInput = (dateStr?: string): string => {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

/**
 * Sanitize user input by removing HTML tags and trimming whitespace
 * Helps prevent XSS vulnerabilities
 * @param input - User input string
 * @returns Sanitized string
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input.trim().replace(/<\/?[^>]+(>|$)/g, '');
};

/**
 * Normalize a CTA link URL
 * Ensures proper protocol for external links
 * @param rawUrl - Raw URL from data
 * @returns Normalized URL
 */
export const normalizeCtaUrl = (rawUrl: string): string => {
  if (!rawUrl) return '';
  
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

/**
 * Convert image path to API-based image URL
 * Legacy function for compatibility (prefer buildImageUrl)
 * @param path - Image path
 * @returns API-based image URL
 */
export const asImage = (path: string | null): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;

  const apiBase = API_CONFIG.BASE_URL;
  return `${apiBase}${path.startsWith('/') ? path : `/${path}`}`;
};

/**
 * Get placeholder image URL for missing images
 * @param alt - Alt text to include in placeholder
 * @returns Placeholder image URL
 */
export const getImagePlaceholder = (alt: string = 'Image'): string => {
  return `https://via.placeholder.com/300x400?text=${encodeURIComponent(alt)}`;
};

/**
 * Validate if a string is a valid URL
 * @param url - URL to validate
 * @returns True if valid URL, false otherwise
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
