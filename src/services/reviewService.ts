import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { 
  GetReviewsRequest,
  ReviewsResponse,
  CreateReviewRequest,
  ReviewResponse,
  UpdateReviewRequest,
  ApiResponse,
  PaginatedApiResponse
} from '@/types/api';
import { Review, ReviewWithDetails } from '@/types';

export class ReviewService {
  static async getReviews(params?: GetReviewsRequest): Promise<PaginatedApiResponse<Review>> {
    return apiClient.get<ReviewsResponse>(API_ENDPOINTS.REVIEWS.LIST, params)
      .then(res => ({
        ...res,
        data: res.data?.reviews?.map(review => ({
          ...review,
          createdAt: new Date(review.createdAt),
          updatedAt: new Date(review.updatedAt)
        })),
        pagination: res.data?.pagination
      }));
  }

  static async getReviewById(id: string): Promise<ApiResponse<ReviewWithDetails>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.REVIEWS.DETAIL, { id });
    return apiClient.get<ReviewResponse>(endpoint)
      .then(res => ({
        ...res,
        data: res.data?.review ? {
          ...res.data.review,
          createdAt: new Date(res.data.review.createdAt),
          updatedAt: new Date(res.data.review.updatedAt),
          student: {} as any,
          tutor: {} as any,
          booking: {} as any
        } : undefined
      }));
  }

  static async createReview(reviewData: CreateReviewRequest): Promise<ApiResponse<Review>> {
    return apiClient.post<ReviewResponse>(API_ENDPOINTS.REVIEWS.CREATE, reviewData)
      .then(res => ({
        ...res,
        data: res.data?.review ? {
          ...res.data.review,
          createdAt: new Date(res.data.review.createdAt),
          updatedAt: new Date(res.data.review.updatedAt)
        } : undefined
      }));
  }

  static async updateReview(id: string, reviewData: UpdateReviewRequest): Promise<ApiResponse<Review>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.REVIEWS.UPDATE, { id });
    return apiClient.put<ReviewResponse>(endpoint, reviewData)
      .then(res => ({
        ...res,
        data: res.data?.review ? {
          ...res.data.review,
          createdAt: new Date(res.data.review.createdAt),
          updatedAt: new Date(res.data.review.updatedAt)
        } : undefined
      }));
  }

  static async deleteReview(id: string): Promise<ApiResponse<void>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.REVIEWS.DELETE, { id });
    return apiClient.delete<void>(endpoint);
  }

  static async getTutorReviews(tutorId: string, params?: GetReviewsRequest): Promise<PaginatedApiResponse<Review>> {
    return apiClient.get<ReviewsResponse>(API_ENDPOINTS.REVIEWS.LIST, { 
      ...params, 
      tutorId 
    }).then(res => ({
      ...res,
      data: res.data?.reviews?.map(review => ({
        ...review,
        createdAt: new Date(review.createdAt),
        updatedAt: new Date(review.updatedAt)
      })),
      pagination: res.data?.pagination
    }));
  }

  static async getStudentReviews(studentId: string, params?: GetReviewsRequest): Promise<PaginatedApiResponse<Review>> {
    return apiClient.get<ReviewsResponse>(API_ENDPOINTS.REVIEWS.LIST, { 
      ...params, 
      studentId 
    }).then(res => ({
      ...res,
      data: res.data?.reviews?.map(review => ({
        ...review,
        createdAt: new Date(review.createdAt),
        updatedAt: new Date(review.updatedAt)
      })),
      pagination: res.data?.pagination
    }));
  }

  static async getBookingReviews(bookingId: string): Promise<PaginatedApiResponse<Review>> {
    return apiClient.get<ReviewsResponse>(API_ENDPOINTS.REVIEWS.LIST, { 
      bookingId 
    }).then(res => ({
      ...res,
      data: res.data?.reviews?.map(review => ({
        ...review,
        createdAt: new Date(review.createdAt),
        updatedAt: new Date(review.updatedAt)
      })),
      pagination: res.data?.pagination
    }));
  }

  static async getReviewsByRating(rating: number, params?: GetReviewsRequest): Promise<PaginatedApiResponse<Review>> {
    return apiClient.get<ReviewsResponse>(API_ENDPOINTS.REVIEWS.LIST, { 
      ...params, 
      rating 
    }).then(res => ({
      ...res,
      data: res.data?.reviews?.map(review => ({
        ...review,
        createdAt: new Date(review.createdAt),
        updatedAt: new Date(review.updatedAt)
      })),
      pagination: res.data?.pagination
    }));
  }

  static async getRecentReviews(limit = 10): Promise<PaginatedApiResponse<Review>> {
    return apiClient.get<ReviewsResponse>(API_ENDPOINTS.REVIEWS.LIST, { 
      limit,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }).then(res => ({
      ...res,
      data: res.data?.reviews?.map(review => ({
        ...review,
        createdAt: new Date(review.createdAt),
        updatedAt: new Date(review.updatedAt)
      })),
      pagination: res.data?.pagination
    }));
  }

  static async getTutorAverageRating(tutorId: string): Promise<ApiResponse<{ average: number; count: number }>> {
    return apiClient.get<{ average: number; count: number }>(`${API_ENDPOINTS.REVIEWS.LIST}/stats`, { 
      tutorId 
    });
  }
}
