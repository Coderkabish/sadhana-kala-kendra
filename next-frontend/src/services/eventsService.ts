const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface Event {
  event_id?: number;
  id?: number;
  event_name: string;
  title?: string;
  slug?: string;
  description: string;
  rich_content?: string;
  event_date: string;
  event_time?: string;
  venue?: string;
  location?: string;
  organized_by?: string;
  category?: string;
  display_order?: number;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

export interface Program {
  id: number;
  program_name: string;
  program_description?: string;
  rich_content?: string;
  image_url?: string;
  program_date?: string;
  display_order?: number;
  slug?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

export async function getUpcomingEvents() {
  const res = await fetch(`${API_BASE}/api/events?category=upcoming`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch upcoming events');
  return res.json();
}

export async function getPastEvents() {
  const res = await fetch(`${API_BASE}/api/events?category=past`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch past events');
  return res.json();
}

export async function getEventBySlug(slug: string) {
  const res = await fetch(`${API_BASE}/api/events/${slug}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch event');
  return res.json();
}

export async function getAllPrograms() {
  const res = await fetch(`${API_BASE}/api/events/programs`, { 
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch programs');
  return res.json();
}

export async function getProgramBySlug(slug: string) {
  const res = await fetch(`${API_BASE}/api/events/programs/${slug}`, { 
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch program');
  return res.json();
}

export async function getProgramById(id: number) {
  return programsService.getById(id);
}

export async function createProgram(data: FormData | Partial<Program>) {
  return programsService.create(data);
}

export async function updateProgram(id: number, data: FormData | Partial<Program>) {
  return programsService.update(id, data);
}

export async function deleteProgram(id: number) {
  return programsService.delete(id);
}

// Admin CRUD operations
export const eventsService = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE}/api/events/`, { 
        credentials: 'include',
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to fetch events');
      return await response.json();
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  getById: async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/events/${id}`, { 
        credentials: 'include',
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to fetch event');
      return await response.json();
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  },

  create: async (data: Partial<Event>) => {
    try {
      const response = await fetch(`${API_BASE}/api/events/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  update: async (id: number, data: Partial<Event>) => {
    try {
      const response = await fetch(`${API_BASE}/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  delete: async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/events/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  },
};

// Admin CRUD operations for Programs
export const programsService = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE}/api/events/programs`, { 
        credentials: 'include',
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to fetch programs');
      return await response.json();
    } catch (error) {
      console.error('Error fetching programs:', error);
      throw error;
    }
  },

  getById: async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/events/programs/${id}`, { 
        credentials: 'include',
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to fetch program');
      return await response.json();
    } catch (error) {
      console.error('Error fetching program:', error);
      throw error;
    }
  },

  create: async (data: FormData | Partial<Program>) => {
    try {
      const isFormData = data instanceof FormData;
      const response = await fetch(`${API_BASE}/api/events/programs`, {
        method: 'POST',
        ...(isFormData ? {} : { headers: { 'Content-Type': 'application/json' } }),
        credentials: 'include',
        body: isFormData ? data : JSON.stringify(data),
      });
      if (!response.ok) {
        let errorMessage = `API Error: ${response.status}`;
        try {
          const error = await response.json();
          console.error('API error response:', error);
          errorMessage = error.details || error.message || error.sqlMessage || JSON.stringify(error);
        } catch (e) {
          const text = await response.text();
          console.error('API error text:', text);
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating program:', error);
      throw error;
    }
  },

  update: async (id: number, data: FormData | Partial<Program>) => {
    try {
      const isFormData = data instanceof FormData;
      const response = await fetch(`${API_BASE}/api/events/programs/${id}`, {
        method: 'PUT',
        ...(isFormData ? {} : { headers: { 'Content-Type': 'application/json' } }),
        credentials: 'include',
        body: isFormData ? data : JSON.stringify(data),
      });
      if (!response.ok) {
        let errorMessage = `API Error: ${response.status}`;
        try {
          const error = await response.json();
          console.error('API error response:', error);
          errorMessage = error.details || error.message || error.sqlMessage || JSON.stringify(error);
        } catch (e) {
          const text = await response.text();
          console.error('API error text:', text);
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating program:', error);
      throw error;
    }
  },

  delete: async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/events/programs/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        let errorMessage = `API Error: ${response.status}`;
        try {
          const error = await response.json();
          console.error('API error response:', error);
          errorMessage = error.details || error.message || error.sqlMessage || JSON.stringify(error);
        } catch (e) {
          const text = await response.text();
          console.error('API error text:', text);
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting program:', error);
      throw error;
    }
  },
};
