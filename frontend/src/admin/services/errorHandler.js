export const handleError = (error) => {
  // Backend responded with a status code outside 2xx
  if (error.response) {
    const message = 
      error.response.data?.message || 
      error.response.statusText || 
      "Request failed";
    
    throw { 
      message,
      status: error.response.status,
      data: error.response.data || null,
    };
  }

  // Request was made but no response received (server down, CORS, timeout)
  if (error.request) {
    if (error.code === 'ECONNABORTED') {
      throw {
        message: "Upload timeout. File may be too large or connection is slow.",
        request: error.request,
      };
    }
    throw {
      message: "Network error. Please check your connection.",
      request: error.request,
    };
  }

  // Something else happened
  throw {
    message: error.message || "Unexpected error occurred",
  };
};
