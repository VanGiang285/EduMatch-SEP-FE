import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { 
  GetTutorsRequest,
  TutorsResponse,
  TutorResponse,
  CreateTutorRequest,
  ApiResponse,
  PaginatedApiResponse
} from '@/types/api';
import { Tutor, TutorProfile } from '@/types';
export class TutorService {
  static async getTutors(params?: GetTutorsRequest): Promise<PaginatedApiResponse<Tutor>> {
    return apiClient.get<TutorsResponse>(API_ENDPOINTS.TUTORS.GET_ALL, params)
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
    const endpoint = replaceUrlParams(API_ENDPOINTS.TUTORS.GET_BY_ID, { tutorId: id });
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
    return apiClient.get<TutorsResponse>(API_ENDPOINTS.TUTORS.GET_ALL, params)
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
    return apiClient.post<TutorResponse>(API_ENDPOINTS.TUTORS.BECOME_TUTOR, tutorData)
      .then(res => ({
        ...res,
        data: res.data?.tutor ? {
          ...res.data.tutor,
          createdAt: new Date(res.data.tutor.createdAt),
          updatedAt: new Date(res.data.tutor.updatedAt)
        } : undefined
      }));
  }
  static async updateTutor(): Promise<ApiResponse<Tutor>> {
    // TODO: Implement when UPDATE endpoint is available
    throw new Error('Update tutor endpoint not implemented yet');
  }
  static async deleteTutor(): Promise<ApiResponse<void>> {
    // TODO: Implement when DELETE endpoint is available
    throw new Error('Delete tutor endpoint not implemented yet');
  }
  static async getTutorAvailability(): Promise<ApiResponse<any[]>> {
    // TODO: Implement when AVAILABILITY endpoint is available
    throw new Error('Get tutor availability endpoint not implemented yet');
  }
  static async updateTutorAvailability(): Promise<ApiResponse<any[]>> {
    // TODO: Implement when AVAILABILITY endpoint is available
    throw new Error('Update tutor availability endpoint not implemented yet');
  }
  static async getFeaturedTutors(limit = 6): Promise<PaginatedApiResponse<Tutor>> {
    return apiClient.get<TutorsResponse>(API_ENDPOINTS.TUTORS.GET_ALL, { 
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
    return apiClient.get<TutorsResponse>(API_ENDPOINTS.TUTORS.GET_ALL, { 
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
    return apiClient.get<TutorsResponse>(API_ENDPOINTS.TUTORS.GET_ALL, { 
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
    return apiClient.get<TutorsResponse>(API_ENDPOINTS.TUTORS.GET_ALL, { 
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
    return apiClient.get<TutorsResponse>(API_ENDPOINTS.TUTORS.GET_ALL, { 
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