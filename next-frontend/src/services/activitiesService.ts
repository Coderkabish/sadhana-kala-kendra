import { API_CONFIG } from '../config/api';

const API_BASE = API_CONFIG.BASE_URL;

// Helper function to generate slug from title
export function generateActivitySlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export interface Activity {
  id?: number;
  activity_name?: string;
  name?: string;
  description?: string;
  created_by?: string;
  created_at?: string;
  display_order?: number;
  is_active?: boolean;
}

export async function getAllActivities() {
  const url = `${API_BASE}/api/activities`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch activities');
  return res.json();
}

export async function getActivityBySlug(slug: string) {
  const res = await fetch(`${API_BASE}/api/activities/${slug}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch activity');
  return res.json();
}

// Admin CRUD operations
export const activitiesService = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE}/api/activities/`, { 
        credentials: 'include',
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to fetch activities');
      return await response.json();
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  },

  getById: async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/activities/${id}`, { 
        credentials: 'include',
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to fetch activity');
      return await response.json();
    } catch (error) {
      console.error('Error fetching activity:', error);
      throw error;
    }
  },

  create: async (data: FormData | Partial<Activity>) => {
    try {
      const isFormData = data instanceof FormData;
      const response = await fetch(`${API_BASE}/api/activities/`, {
        method: 'POST',
        ...(isFormData ? {} : { headers: { 'Content-Type': 'application/json' } }),
        credentials: 'include',
        body: isFormData ? data : JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  },

  update: async (id: number, data: FormData | Partial<Activity>) => {
    try {
      const isFormData = data instanceof FormData;
      const response = await fetch(`${API_BASE}/api/activities/${id}`, {
        method: 'PUT',
        ...(isFormData ? {} : { headers: { 'Content-Type': 'application/json' } }),
        credentials: 'include',
        body: isFormData ? data : JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating activity:', error);
      throw error;
    }
  },

  delete: async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/activities/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  },
};
