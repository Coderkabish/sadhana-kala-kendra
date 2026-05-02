import { programsService as eventsProgramsService } from './eventsService';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

type RawEntity = Record<string, unknown>;

// Data normalization functions to map backend fields to frontend expectations
const normalizeBOD = (data: unknown): BOD | BOD[] => {
  const normalizeSingleBOD = (item: RawEntity): BOD => {
    const fullName = typeof item.name === 'string' ? item.name : '';
    const nameParts = fullName.split(' ');
    const firstname = nameParts[0] || '';
    const lastname = nameParts.slice(1).join(' ') || '';
    const idValue = item.bod_id ?? item.id;
    const numericId = typeof idValue === 'number' ? idValue : Number(idValue ?? 0);
    const displayOrderValue = item.display_order;
    const displayOrder = typeof displayOrderValue === 'number' ? displayOrderValue : undefined;
    
    return {
      id: Number.isFinite(numericId) ? numericId : 0,
      firstname,
      lastname,
      designation: typeof item.designation === 'string' ? item.designation : '',
      profile_image: typeof item.profile_image === 'string' ? item.profile_image : undefined,
      details_content: typeof item.details_content === 'string' ? item.details_content : undefined,
      display_order: displayOrder,
      slug: typeof item.slug === 'string' ? item.slug : undefined,
      seo_title: typeof item.seo_title === 'string' ? item.seo_title : undefined,
      seo_description: typeof item.seo_description === 'string' ? item.seo_description : undefined,
      seo_keywords: typeof item.seo_keywords === 'string' ? item.seo_keywords : undefined,
    };
  };

  if (Array.isArray(data)) {
    return data.map((item) => normalizeSingleBOD((item ?? {}) as RawEntity));
  }
  return normalizeSingleBOD((data ?? {}) as RawEntity);
};

const normalizeTeamMember = (data: unknown): TeamMember | TeamMember[] => {
  const normalizeSingle = (item: RawEntity): TeamMember => {
    const idValue = item.id;
    const numericId = typeof idValue === 'number' ? idValue : Number(idValue ?? 0);
    const displayOrderValue = item.display_order;
    const displayOrder = typeof displayOrderValue === 'number' ? displayOrderValue : undefined;

    return {
      id: Number.isFinite(numericId) ? numericId : 0,
      name: typeof item.name === 'string' ? item.name : '',
      designation:
        typeof item.designation === 'string'
          ? item.designation
          : (typeof item.subtitle === 'string' ? item.subtitle : ''),
      image_url: typeof item.image_url === 'string' ? item.image_url : undefined,
      description: typeof item.description === 'string' ? item.description : undefined,
      display_order: displayOrder,
    };
  };

  if (Array.isArray(data)) {
    return data.map((item) => normalizeSingle((item ?? {}) as RawEntity));
  }
  return normalizeSingle((data ?? {}) as RawEntity);
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
      const response = await fetch(`${API_BASE}/api/about/bod/by-id/${id}`, { 
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
        } catch {
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
        } catch {
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
        } catch {
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
