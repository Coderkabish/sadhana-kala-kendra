import api from "./api";
import { handleError } from "./errorHandler";

const OFFERS_API = "/offers";

export const getPublicOffers = async (limit) => {
  try {
    const query = limit ? `?limit=${encodeURIComponent(limit)}` : "";
    const response = await api.get(`${OFFERS_API}${query}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getAllOffersForAdmin = async () => {
  try {
    const response = await api.get(`${OFFERS_API}/admin/all`, { withCredentials: true });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getOfferById = async (id) => {
  try {
    const response = await api.get(`${OFFERS_API}/${id}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const createOffer = async (data) => {
  try {
    const response = await api.post(OFFERS_API, data, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateOffer = async (id, data) => {
  try {
    const response = await api.put(`${OFFERS_API}/${id}`, data, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteOffer = async (id) => {
  try {
    const response = await api.delete(`${OFFERS_API}/${id}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
