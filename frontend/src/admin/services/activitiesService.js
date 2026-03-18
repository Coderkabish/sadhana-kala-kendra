import api from "./api";
import { handleError } from "./errorHandler";

const ACTIVITIES_API = "/activities";

export const getAllActivities = async () => {
    try {
        const response = await api.get(ACTIVITIES_API);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const createActivity = async (data) => {
    try {
        const response = await api.post(ACTIVITIES_API, data);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const updateActivity = async (id, data) => {
    try {
        const response = await api.put(`${ACTIVITIES_API}/${id}`, data);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const deleteActivity = async (id) => {
    try {
        const response = await api.delete(`${ACTIVITIES_API}/${id}`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const getActivityById = async (id) => {
    try {
        const response = await api.get(`${ACTIVITIES_API}/${id}`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};
