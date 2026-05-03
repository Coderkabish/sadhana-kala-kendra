import { API_BASE_URL } from './api';

export interface Registration {
  registration_id?: string | number;
  id?: string | number;
  student_name: string;
  email: string;
  phone: string;
  course_name: string;
  age?: number;
  occupation?: string;
  address?: string;
  registration_date: string;
  status: 'Read' | 'Unread';
}

export const registrationsService = {
  async getAll(): Promise<Registration[]> {
    try {
      const url = `${API_BASE_URL}/api/register/registration`;
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return Array.isArray(data) ? data : data.data || [];
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
      throw error;
    }
  },

  async getById(id: string | number): Promise<Registration> {
    const url = `${API_BASE_URL}/api/register/registration/${id}`;
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async create(data: Partial<Registration>): Promise<Registration> {
    const url = `${API_BASE_URL}/api/register/registration`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async update(id: string | number, data: Partial<Registration>): Promise<Registration> {
    const url = `${API_BASE_URL}/api/register/registration/${id}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async updateStatus(id: string | number, status: 'Read' | 'Unread'): Promise<Registration> {
    const url = `${API_BASE_URL}/api/register/registration/${id}/status`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async delete(id: string | number): Promise<{ success: boolean }> {
    const url = `${API_BASE_URL}/api/register/registration/${id}`;
    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },
};
