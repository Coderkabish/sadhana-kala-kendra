import axios from "axios";

// Use environment variable with fallback for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

// Get server root URL (without /api)
const getServerRootUrl = () => {
    if (!API_BASE_URL || API_BASE_URL === "/api") {
        // In production with same domain, return empty string for relative paths
        return "";
    }
    // Remove /api from the end if present
    return API_BASE_URL.replace(/\/api\/?$/, "");
};

const SERVER_ROOT_URL = getServerRootUrl();

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    timeout: 15000, 
});

// Placeholder for the function registered by AdminRoutes
let onUnauthorizedCallback = () => {};

// Function exported to allow AdminRoutes to register the redirect logic
export const setUnauthorizedRedirectCallback = (callback) => {
    onUnauthorizedCallback = callback;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      window.location.pathname.startsWith("/admin")
    ) {
      onUnauthorizedCallback();
    }
    return Promise.reject(error);
  }
);

// Correctly export required variables
export { SERVER_ROOT_URL };

export default api;