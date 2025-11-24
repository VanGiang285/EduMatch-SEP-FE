import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';
import {
  TutorFeedbackDto,
  FeedbackCriterion,
} from '@/types/backend';
import {
  CreateTutorFeedbackRequest,
  UpdateTutorFeedbackRequest,
} from '@/types/requests';

export class FeedbackService {
  /**
   * Creates a feedback for a tutor (Learner only)
   * Business Rules:
   * - Must complete at least 80% of sessions in the booking
   * - Each booking can only have 1 feedback
   */
  static async createFeedback(
    request: CreateTutorFeedbackRequest
  ): Promise<ApiResponse<TutorFeedbackDto>> {
    return apiClient.post<TutorFeedbackDto>(
      API_ENDPOINTS.FEEDBACK.CREATE,
      request
    );
  }

  /**
   * Gets feedback by ID
   */
  static async getFeedbackById(
    feedbackId: number
  ): Promise<ApiResponse<TutorFeedbackDto>> {
    const url = replaceUrlParams(API_ENDPOINTS.FEEDBACK.GET_BY_ID, {
      feedbackId: feedbackId.toString(),
    });
    return apiClient.get<TutorFeedbackDto>(url);
  }

  /**
   * Gets all feedbacks by learner email
   */
  static async getFeedbackByLearner(
    learnerEmail: string
  ): Promise<ApiResponse<TutorFeedbackDto[]>> {
    return apiClient.get<TutorFeedbackDto[]>(
      API_ENDPOINTS.FEEDBACK.GET_BY_LEARNER,
      { learnerEmail }
    );
  }

  /**
   * Gets all feedbacks by tutor ID
   */
  static async getFeedbackByTutor(
    tutorId: number
  ): Promise<ApiResponse<TutorFeedbackDto[]>> {
    return apiClient.get<TutorFeedbackDto[]>(
      API_ENDPOINTS.FEEDBACK.GET_BY_TUTOR,
      { tutorId: tutorId.toString() }
    );
  }

  /**
   * Gets all feedback criteria (no auth required)
   */
  static async getAllCriteria(): Promise<ApiResponse<FeedbackCriterion[]>> {
    return apiClient.get<FeedbackCriterion[]>(
      API_ENDPOINTS.FEEDBACK.GET_ALL_CRITERIA
    );
  }

  /**
   * Gets all feedbacks (can be used by admin)
   */
  static async getAllFeedbacks(): Promise<ApiResponse<TutorFeedbackDto[]>> {
    return apiClient.get<TutorFeedbackDto[]>(API_ENDPOINTS.FEEDBACK.GET_ALL);
  }

  /**
   * Updates a feedback (only the Learner who created it can update)
   */
  static async updateFeedback(
    request: UpdateTutorFeedbackRequest
  ): Promise<ApiResponse<TutorFeedbackDto>> {
    return apiClient.put<TutorFeedbackDto>(
      API_ENDPOINTS.FEEDBACK.UPDATE,
      request
    );
  }
}

