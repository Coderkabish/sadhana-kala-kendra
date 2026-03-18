import api from '../services/api';
import { handleError } from "../services/errorHandler";

const NEWS_API = '/news';

export const getAllNews = async () => {
    try {
        const response = await api.get(NEWS_API, { withCredentials: true });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const getNewsById = async (id) => {
    try {
        const response = await api.get(`${NEWS_API}/${id}`, { withCredentials: true });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const getNewsResources = async (id) => {
    try {
        const response = await api.get(`${NEWS_API}/${id}/resources`, { withCredentials: true });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const createNews = async (data) => {
    try {
        const response = await api.post(NEWS_API, data, {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const updateNews = async (id, data) => {
    try {
        const response = await api.put(`${NEWS_API}/${id}`, data, {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const deleteNews = async (id) => {
    try {
        const response = await api.delete(`${NEWS_API}/${id}`, { withCredentials: true });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};
