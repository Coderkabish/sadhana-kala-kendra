import { programsService as eventsProgramsService } from './eventsService';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

// Data normalization functions to map backend fields to frontend expectations
const normalizeBOD = (data: any): BOD | BOD[] => {
  const normalizeSingleBOD = (item: any): BOD => {
    const nameParts = (item.name || '').split(' ');
    const firstname = nameParts[0] || '';
    const lastname = nameParts.slice(1).join(' ') || '';
    
    return {
      id: item.bod_id || item.id,
      firstname,
      lastname,
      designation: item.designation,
      profile_image: item.profile_image,
      details_content: item.details_content,
      display_order: item.display_order,
      slug: item.slug,
      seo_title: item.seo_title,
      seo_description: item.seo_description,
      seo_keywords: item.seo_keywords,
    };
  };

  if (Array.isArray(data)) {
    return data.map(normalizeSingleBOD);
  }
  return normalizeSingleBOD(data);
};

const normalizeTeamMember = (data: any): TeamMember | TeamMember[] => {
  if (Array.isArray(data)) {
    return data.map(item => ({
      ...item,
      id: item.id,
      designation: item.designation || item.subtitle,
    })) as TeamMember[];
  }
  return {
    ...data,
    id: data.id,
    designation: data.designation || data.subtitle,
  } as TeamMember;
};

export interface BOD {
  id: number;
  firstname: string;
  lastname: string;
  designation: string;
  profile_image?: string;
  details_content?: string;
  display_order?: number;
  slug?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

export interface TeamMember {
  id: number;
  name: string;
  designation: string;
  image_url?: string;
  description?: string;
  display_order?: number;
}

export async function getAllBOD() {
  const res = await fetch(`${API_BASE}/api/about/bod`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch BOD members');
  return res.json();
}

export async function getBODBySlug(slug: string) {
  const res = await fetch(`${API_BASE}/api/about/bod/${slug}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch BOD member');
  return res.json();
}

export async function getAllTeamMembers() {
  const res = await fetch(`${API_BASE}/api/about/team-members`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch team members');
  return res.json();
}

// Admin CRUD operations for BOD
export const bodService = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE}/api/about/bod`, { 
        credentials: 'include',
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to fetch BOD members');
      const data = await response.json();
      return normalizeBOD(data);
    } catch (error) {
      console.error('Error fetching BOD members:', error);
      throw error;
    }
  },

  getById: async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/about/bod/${id}`, { 
        credentials: 'include',
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to fetch BOD member');
      const data = await response.json();
      return normalizeBOD(data);
    } catch (error) {
      console.error('Error fetching BOD member:', error);
      throw error;
    }
  },

  create: async (data: FormData | Partial<BOD>) => {
    try {
      const isFormData = data instanceof FormData;
      const response = await fetch(`${API_BASE}/api/about/bod/`, {
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
        console.error('Final error message:', errorMessage);
        throw new Error(errorMessage);
      }
      const result = await response.json();
      return normalizeBOD(result);
    } catch (error) {
      console.error('Error creating BOD member:', error);
      throw error;
    }
  },

  update: async (id: number, data: FormData | Partial<BOD>) => {
    try {
      const isFormData = data instanceof FormData;
      const response = await fetch(`${API_BASE}/api/about/bod/${id}`, {
        method: 'PUT',
        ...(isFormData ? {} : { headers: { 'Content-Type': 'application/json' } }),
        credentials: 'include',
        body: isFormData ? data : JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      const result = await response.json();
      return normalizeBOD(result);
    } catch (error) {
      console.error('Error updating BOD member:', error);
      throw error;
    }
  },

  delete: async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/about/bod/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting BOD member:', error);
      throw error;
    }
  },
};

// Admin CRUD operations for Team Members
export const teamMembersService = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE}/api/about/team-members`, { 
        credentials: 'include',
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to fetch team members');
      const data = await response.json();
      return normalizeTeamMember(data);
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
  },

  getById: async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/about/team-members/${id}`, { 
        credentials: 'include',
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to fetch team member');
      const data = await response.json();
      return normalizeTeamMember(data);
    } catch (error) {
      console.error('Error fetching team member:', error);
      throw error;
    }
  },

  create: async (data: FormData | Partial<TeamMember>) => {
    try {
      const isFormData = data instanceof FormData;
      const response = await fetch(`${API_BASE}/api/about/team-members`, {
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
        console.error('Final error message:', errorMessage);
        throw new Error(errorMessage);
      }
      const result = await response.json();
      return normalizeTeamMember(result);
    } catch (error) {
      console.error('Error creating team member:', error);
      throw error;
    }
  },

  update: async (id: number, data: FormData | Partial<TeamMember>) => {
    try {
      const isFormData = data instanceof FormData;
      const response = await fetch(`${API_BASE}/api/about/team-members/${id}`, {
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
        console.error('Final error message:', errorMessage);
        throw new Error(errorMessage);
      }
      const result = await response.json();
      return normalizeTeamMember(result);
    } catch (error) {
      console.error('Error updating team member:', error);
      throw error;
    }
  },

  delete: async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/about/team-members/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting team member:', error);
      throw error;
    }
  },
};

// Combined export for convenience
export const aboutService = {
  bodService,
  teamMembersService,
  programsService: eventsProgramsService,
};
