import api from "./api";
import { handleError } from "./errorHandler";
const COURSES_API = "/courses";

const createFormData = (data, isUpdate) => {
  const formData = new FormData();
  const mainTeacherName = data.teacher_name || "";

  formData.append("title", data.title);
  formData.append("slug", data.slug || "");
  formData.append("description", data.description || "");
  formData.append("level", data.level || "");
  formData.append("price", data.price ?? "");
  formData.append("teacher_name", mainTeacherName);
  formData.append("seo_title", data.seo_title || "");
  formData.append("seo_description", data.seo_description || "");
  formData.append("seo_keywords", data.seo_keywords || "");

  const processedSchedules = (data.schedules || []).map((schedule) => {
    let classDayValue = "";
    if (schedule.class_day_from && schedule.class_day_to) {
      classDayValue = `${schedule.class_day_from} to ${schedule.class_day_to}`;
    } else if (schedule.class_day_from) {
      classDayValue = schedule.class_day_from;
    } else if (schedule.class_day) {
      classDayValue = schedule.class_day;
    }

    const scheduleTeacherName = schedule.teacher_name || mainTeacherName;

    return {
      class_day: classDayValue,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      schedule_id: schedule.schedule_id,
      teacher_name: scheduleTeacherName,
    };
  });

  formData.append("schedules", JSON.stringify(processedSchedules));

  if (data.course_image_file) {
    formData.append("image", data.course_image_file);
  } else if (isUpdate && data.existing_image_url === "") {
    formData.append("clear_image", "true");
  }

  return formData;
};

export const getAllCourses = async () => {
  try {
    const response = await api.get(COURSES_API, { withCredentials: true });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const createCourse = async (data) => {
  try {
    const formData = createFormData(data, false);
    const response = await api.post(COURSES_API, formData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateCourse = async (id, data) => {
  try {
    const formData = createFormData(data, true);
    const response = await api.put(`${COURSES_API}/${id}`, formData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteCourse = async (id) => {
  try {
    const response = await api.delete(`${COURSES_API}/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
