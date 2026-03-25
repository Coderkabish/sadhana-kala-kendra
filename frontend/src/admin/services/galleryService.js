import api from "./api";
import { handleError } from "./errorHandler";

const GALLERY_API = "/gallery";

const createFormData = (data, isUpdate = false) => {
  const formData = new FormData();
  formData.append("title", data.title || "");

  if (data.image_file) {
    formData.append("image", data.image_file);
  } else if (isUpdate && data.existing_image_url === "") {
    formData.append("clear_image", "true");
  }

  return formData;
};

export const getAllGalleryItems = async () => {
  try {
    const response = await api.get(GALLERY_API);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const createGalleryItem = async (data) => {
  try {
    const formData = createFormData(data, false);
    const response = await api.post(GALLERY_API, formData, { withCredentials: true });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateGalleryItem = async (id, data) => {
  try {
    const formData = createFormData(data, true);
    const response = await api.put(`${GALLERY_API}/${id}`, formData, { withCredentials: true });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteGalleryItem = async (id) => {
  try {
    const response = await api.delete(`${GALLERY_API}/${id}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
