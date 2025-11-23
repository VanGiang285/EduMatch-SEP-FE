import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';
import {
  ReportDetailDto,
  ReportListItemDto,
  ReportFullDetailDto,
  ReportEvidenceDto,
  ReportDefenseDto,
} from '@/types/backend';
import {
  ReportCreateRequest,
  ReportUpdateByLearnerRequest,
  ReportUpdateRequest,
  TutorComplaintRequest,
  ReportEvidenceCreateRequest,
  ReportEvidenceUpdateRequest,
  ReportDefenseCreateRequest,
} from '@/types/requests';

export class ReportService {
  // Learner or Tutor creates a report
  static async createReport(
    request: ReportCreateRequest
  ): Promise<ApiResponse<ReportDetailDto>> {
    return apiClient.post<ReportDetailDto>(API_ENDPOINTS.REPORTS.CREATE, request);
  }

  // Learner gets their submitted reports
  static async getLearnerReports(): Promise<ApiResponse<ReportListItemDto[]>> {
    return apiClient.get<ReportListItemDto[]>(API_ENDPOINTS.REPORTS.GET_LEARNER_REPORTS);
  }

  // Learner updates their pending report
  static async updateLearnerReport(
    id: number,
    request: ReportUpdateByLearnerRequest
  ): Promise<ApiResponse<ReportDetailDto>> {
    const url = replaceUrlParams(API_ENDPOINTS.REPORTS.UPDATE_LEARNER_REPORT, {
      id: id.toString(),
    });
    return apiClient.put<ReportDetailDto>(url, request);
  }

  // Learner cancels their pending report
  static async cancelLearnerReport(id: number): Promise<ApiResponse<ReportDetailDto>> {
    const url = replaceUrlParams(API_ENDPOINTS.REPORTS.CANCEL_LEARNER_REPORT, {
      id: id.toString(),
    });
    return apiClient.delete<ReportDetailDto>(url);
  }

  // Tutor gets reports where they are accused
  static async getTutorReports(): Promise<ApiResponse<ReportListItemDto[]>> {
    return apiClient.get<ReportListItemDto[]>(API_ENDPOINTS.REPORTS.GET_TUTOR_REPORTS);
  }

  // Get detailed report information (admin or involved users)
  static async getReportDetail(id: number): Promise<ApiResponse<ReportDetailDto>> {
    const url = replaceUrlParams(API_ENDPOINTS.REPORTS.GET_DETAIL, {
      id: id.toString(),
    });
    return apiClient.get<ReportDetailDto>(url);
  }

  // Get full report detail including defenses and evidences
  static async getFullReportDetail(id: number): Promise<ApiResponse<ReportFullDetailDto>> {
    const url = replaceUrlParams(API_ENDPOINTS.REPORTS.GET_FULL_DETAIL, {
      id: id.toString(),
    });
    return apiClient.get<ReportFullDetailDto>(url);
  }

  // Admin updates report status and notes
  static async updateReportByAdmin(
    id: number,
    request: ReportUpdateRequest
  ): Promise<ApiResponse<ReportDetailDto>> {
    const url = replaceUrlParams(API_ENDPOINTS.REPORTS.UPDATE_BY_ADMIN, {
      id: id.toString(),
    });
    return apiClient.put<ReportDetailDto>(url, request);
  }

  // Add evidence to a report (reporter, tutor, or admin)
  static async addEvidence(
    reportId: number,
    request: ReportEvidenceCreateRequest
  ): Promise<ApiResponse<ReportEvidenceDto>> {
    const url = replaceUrlParams(API_ENDPOINTS.REPORTS.ADD_EVIDENCE, {
      id: reportId.toString(),
    });
    return apiClient.post<ReportEvidenceDto>(url, request);
  }

  // Get evidence list for a report
  static async getEvidence(reportId: number): Promise<ApiResponse<ReportEvidenceDto[]>> {
    const url = replaceUrlParams(API_ENDPOINTS.REPORTS.GET_EVIDENCE, {
      id: reportId.toString(),
    });
    return apiClient.get<ReportEvidenceDto[]>(url);
  }

  // Update evidence (owner or admin)
  static async updateEvidence(
    reportId: number,
    evidenceId: number,
    request: ReportEvidenceUpdateRequest
  ): Promise<ApiResponse<ReportEvidenceDto>> {
    const url = replaceUrlParams(API_ENDPOINTS.REPORTS.UPDATE_EVIDENCE, {
      id: reportId.toString(),
      evidenceId: evidenceId.toString(),
    });
    return apiClient.put<ReportEvidenceDto>(url, request);
  }

  // Delete evidence (owner or admin)
  static async deleteEvidence(
    reportId: number,
    evidenceId: number
  ): Promise<ApiResponse<string>> {
    const url = replaceUrlParams(API_ENDPOINTS.REPORTS.DELETE_EVIDENCE, {
      id: reportId.toString(),
      evidenceId: evidenceId.toString(),
    });
    return apiClient.delete<string>(url);
  }

  // Tutor or admin adds defense with optional evidences
  static async addDefense(
    reportId: number,
    request: ReportDefenseCreateRequest
  ): Promise<ApiResponse<ReportDefenseDto>> {
    const url = replaceUrlParams(API_ENDPOINTS.REPORTS.ADD_DEFENSE, {
      id: reportId.toString(),
    });
    return apiClient.post<ReportDefenseDto>(url, request);
  }

  // Get defenses list for a report
  static async getDefenses(reportId: number): Promise<ApiResponse<ReportDefenseDto[]>> {
    const url = replaceUrlParams(API_ENDPOINTS.REPORTS.GET_DEFENSES, {
      id: reportId.toString(),
    });
    return apiClient.get<ReportDefenseDto[]>(url);
  }

  // Tutor submits defense/complaint for a report (legacy method, use addDefense instead)
  static async submitTutorComplaint(
    id: number,
    request: TutorComplaintRequest
  ): Promise<ApiResponse<ReportDetailDto>> {
    const url = replaceUrlParams(API_ENDPOINTS.REPORTS.UPDATE_BY_ADMIN, {
      id: id.toString(),
    });
    return apiClient.put<ReportDetailDto>(url, request);
  }
}

