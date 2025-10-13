import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { 
  GetTutorsRequest,
  TutorsResponse,
  TutorResponse,
  CreateTutorRequest,
  UpdateTutorRequest,
  ApiResponse,
  PaginatedApiResponse
} from '@/types/api';
import { Tutor, TutorProfile } from '@/types';
export class TutorService {
  static async getTutors(params?: GetTutorsRequest): Promise<PaginatedApiResponse<Tutor>> {
    return apiClient.get<TutorsResponse>(API_ENDPOINTS.TUTORS.LIST, params)
      .then(res => ({
        ...res,
        data: res.data?.tutors?.map(tutor => ({
          ...tutor,
          createdAt: new Date(tutor.createdAt),
          updatedAt: new Date(tutor.updatedAt)
        })),
        pagination: res.data?.pagination
      }));
  }
  static async getTutorById(id: string): Promise<ApiResponse<TutorProfile>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.TUTORS.DETAIL, { id });
    return apiClient.get<TutorResponse>(endpoint)
      .then(res => ({
        ...res,
        data: res.data?.tutor ? {
          ...res.data.tutor,
          createdAt: new Date(res.data.tutor.createdAt),
          updatedAt: new Date(res.data.tutor.updatedAt),
          user: {} as any,
          reviews: [],
          bookings: [],
          isActive: res.data.tutor.isActive,
          totalEarnings: 0,
          responseTime: 0
        } : undefined
      }));
  }
  static async searchTutors(params: GetTutorsRequest): Promise<PaginatedApiResponse<Tutor>> {
    return apiClient.get<TutorsResponse>(API_ENDPOINTS.TUTORS.SEARCH, params)
      .then(res => ({
        ...res,
        data: res.data?.tutors?.map(tutor => ({
          ...tutor,
          createdAt: new Date(tutor.createdAt),
          updatedAt: new Date(tutor.updatedAt)
        })),
        pagination: res.data?.pagination
      }));
  }
  static async createTutor(tutorData: CreateTutorRequest): Promise<ApiResponse<Tutor>> {
    return apiClient.post<TutorResponse>(API_ENDPOINTS.TUTORS.CREATE, tutorData)
      .then(res => ({
        ...res,
        data: res.data?.tutor ? {
          ...res.data.tutor,
          createdAt: new Date(res.data.tutor.createdAt),
          updatedAt: new Date(res.data.tutor.updatedAt)
        } : undefined
      }));
  }
  static async updateTutor(id: string, tutorData: UpdateTutorRequest): Promise<ApiResponse<Tutor>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.TUTORS.UPDATE, { id });
    return apiClient.put<TutorResponse>(endpoint, tutorData)
      .then(res => ({
        ...res,
        data: res.data?.tutor ? {
          ...res.data.tutor,
          createdAt: new Date(res.data.tutor.createdAt),
          updatedAt: new Date(res.data.tutor.updatedAt)
        } : undefined
      }));
  }
  static async deleteTutor(id: string): Promise<ApiResponse<void>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.TUTORS.DELETE, { id });
    return apiClient.delete<void>(endpoint);
  }
  static async getTutorAvailability(id: string): Promise<ApiResponse<any[]>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.TUTORS.AVAILABILITY, { id });
    return apiClient.get<any[]>(endpoint);
  }
  static async updateTutorAvailability(id: string, availability: any[]): Promise<ApiResponse<any[]>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.TUTORS.AVAILABILITY, { id });
    return apiClient.put<any[]>(endpoint, { availability });
  }
  static async getFeaturedTutors(limit = 6): Promise<PaginatedApiResponse<Tutor>> {
    return apiClient.get<TutorsResponse>(API_ENDPOINTS.TUTORS.LIST, { 
      featured: true, 
      limit 
    }).then(res => ({
      ...res,
      data: res.data?.tutors?.map(tutor => ({
        ...tutor,
        createdAt: new Date(tutor.createdAt),
        updatedAt: new Date(tutor.updatedAt)
      })),
      pagination: res.data?.pagination
    }));
  }
  static async getTutorsBySubject(subject: string, params?: GetTutorsRequest): Promise<PaginatedApiResponse<Tutor>> {
    return apiClient.get<TutorsResponse>(API_ENDPOINTS.TUTORS.LIST, { 
      ...params, 
      subjects: [subject] 
    }).then(res => ({
      ...res,
      data: res.data?.tutors?.map(tutor => ({
        ...tutor,
        createdAt: new Date(tutor.createdAt),
        updatedAt: new Date(tutor.updatedAt)
      })),
      pagination: res.data?.pagination
    }));
  }
  static async getTutorsByLocation(location: string, params?: GetTutorsRequest): Promise<PaginatedApiResponse<Tutor>> {
    return apiClient.get<TutorsResponse>(API_ENDPOINTS.TUTORS.LIST, { 
      ...params, 
      location 
    }).then(res => ({
      ...res,
      data: res.data?.tutors?.map(tutor => ({
        ...tutor,
        createdAt: new Date(tutor.createdAt),
        updatedAt: new Date(tutor.updatedAt)
      })),
      pagination: res.data?.pagination
    }));
  }
  static async getTutorsByRating(minRating: number, params?: GetTutorsRequest): Promise<PaginatedApiResponse<Tutor>> {
    return apiClient.get<TutorsResponse>(API_ENDPOINTS.TUTORS.LIST, { 
      ...params, 
      minRating 
    }).then(res => ({
      ...res,
      data: res.data?.tutors?.map(tutor => ({
        ...tutor,
        createdAt: new Date(tutor.createdAt),
        updatedAt: new Date(tutor.updatedAt)
      })),
      pagination: res.data?.pagination
    }));
  }
  static async getTutorsByPriceRange(minPrice: number, maxPrice: number, params?: GetTutorsRequest): Promise<PaginatedApiResponse<Tutor>> {
    return apiClient.get<TutorsResponse>(API_ENDPOINTS.TUTORS.LIST, { 
      ...params, 
      minHourlyRate: minPrice,
      maxHourlyRate: maxPrice
    }).then(res => ({
      ...res,
      data: res.data?.tutors?.map(tutor => ({
        ...tutor,
        createdAt: new Date(tutor.createdAt),
        updatedAt: new Date(tutor.updatedAt)
      })),
      pagination: res.data?.pagination
    }));
  }
}