export interface Tutor {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  rating: number;
  experience: number;
  bio: string;
  avatar?: string;
}

export interface CreateTutorData {
  name: string;
  email: string;
  subjects: string[];
  bio: string;
  experience: number;
}

export interface TutorsResponse {
  success: boolean;
  tutors?: Tutor[];
  error?: string;
}

export class TutorService {
  private static baseUrl = '/api/tutors';

  static async getAllTutors(): Promise<TutorsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch tutors' };
      }

      return { success: true, tutors: data.tutors || [] };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }

  static async getTutorById(id: string): Promise<{ success: boolean; tutor?: Tutor; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch tutor' };
      }

      return { success: true, tutor: data.tutor };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }

  static async createTutor(tutorData: CreateTutorData): Promise<{ success: boolean; tutor?: Tutor; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tutorData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to create tutor' };
      }

      return { success: true, tutor: data.tutor };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }

  static async updateTutor(id: string, tutorData: Partial<CreateTutorData>): Promise<{ success: boolean; tutor?: Tutor; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tutorData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to update tutor' };
      }

      return { success: true, tutor: data.tutor };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }

  static async deleteTutor(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to delete tutor' };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }
}
