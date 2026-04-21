/**
 * STRICT API Configuration - NO FALLBACKS TO LOCALHOST
 * Environment variables are MANDATORY in all environments
 * This ensures proper configuration management and prevents hardcoded dependencies
 */

// Validate that required environment variables are set at runtime
if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
  throw new Error(
    'FATAL ERROR: NEXT_PUBLIC_API_BASE_URL environment variable is required. ' +
    'Please set it in your .env.local or deployment environment. ' +
    'Example: NEXT_PUBLIC_API_BASE_URL=https://api.example.com'
  );
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Validate that URL is properly formatted
if (!API_BASE_URL.startsWith('http://') && !API_BASE_URL.startsWith('https://')) {
  throw new Error(
    `FATAL ERROR: NEXT_PUBLIC_API_BASE_URL must start with http:// or https://. ` +
    `Current value: ${API_BASE_URL}`
  );
}

// Remove trailing slash for consistency
export const API_CONFIG = {
  BASE_URL: API_BASE_URL.replace(/\/$/, ''),
  TIMEOUT: 30000,
} as const;

/**
 * Get the full API endpoint URL
 * @param path - API path (e.g., '/api/courses')
 * @returns Full URL
 */
export function getApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_CONFIG.BASE_URL}${normalizedPath}`;
}

/**
 * Fetch from API with error handling
 */
export async function fetchApi(
  path: string,
  options?: RequestInit
): Promise<Response> {
  const url = getApiUrl(path);
  
  try {
    const response = await fetch(url, {
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    console.error(`Failed to fetch from ${url}:`, error);
    throw error;
  }
}

export default API_CONFIG;
