import { apiClient } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';

export interface BecomeTutorRequest {
  fullName: string;
  email: string;
  province: string;
  district: string;
  subjects: Array<{
    subjectId: number;
    levelId: number;
    hourlyRate: string;
  }>;
  birthDate: string;
  phone?: string;
  teachingMode?: number;
  profileImage?: File;
  certifications?: Array<{
    subjectId: number;
    certificateTypeId: number;
    issueDate: string;
    expiryDate: string;
    certificateFile?: File;
  }>;
  education?: Array<{
    institutionId: number;
    issueDate: string;
    degreeFile?: File;
  }>;
  introduction?: string;
  teachingExperience?: string;
  attractiveTitle?: string;
  videoFile?: File;
  youtubeLink?: string;
  schedule?: Record<string, string[]>;
  hourlyRate: string;
  priceDescription?: string;
}

export interface BecomeTutorResponse {
  success: boolean;
  message: string;
  tutorId?: number;
}

function getDayOfWeekNumber(dayOfWeek: string): number {
  const dayMap: { [key: string]: number } = {
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6,
    'Sunday': 0
  };
  return dayMap[dayOfWeek] ?? -1;
}

export class BecomeTutorService {
  static async becomeTutor(data: BecomeTutorRequest): Promise<ApiResponse<BecomeTutorResponse>> {
    const formData = new FormData();
    
    const hasVideoFile = data.videoFile && data.videoFile instanceof File;
    const hasYoutubeUrl = data.youtubeLink && data.youtubeLink.trim() !== '';
    
    if (!hasVideoFile && !hasYoutubeUrl) {
      throw new Error('Please provide either a video file or YouTube URL');
    }
    
    formData.append('TutorProfile.Bio', data.introduction || '');
    formData.append('TutorProfile.TeachingExp', data.teachingExperience || '');
    formData.append('TutorProfile.TeachingModes', (data.teachingMode || 2).toString());
    formData.append('TutorProfile.VideoIntroUrl', hasYoutubeUrl ? data.youtubeLink : '');
    
    if (data.profileImage) {
      formData.append('ProfileImage', data.profileImage, data.profileImage.name);
    }
    
    if (hasVideoFile) {
      formData.append('TutorProfile.VideoIntro', data.videoFile);
    }
    
    if (data.subjects && data.subjects.length > 0) {
      data.subjects.forEach((subject, index) => {
        formData.append(`Subjects[${index}].TutorId`, '1');
        formData.append(`Subjects[${index}].SubjectId`, subject.subjectId.toString());
        formData.append(`Subjects[${index}].LevelId`, subject.levelId.toString());
        formData.append(`Subjects[${index}].HourlyRate`, parseFloat(subject.hourlyRate).toString());
      });
    }
    
    if (data.certifications && data.certifications.length > 0) {
      data.certifications.forEach((cert, index) => {
        formData.append(`Certificates[${index}].TutorId`, '1');
        formData.append(`Certificates[${index}].SubjectId`, cert.subjectId.toString());
        formData.append(`Certificates[${index}].CertificateTypeId`, cert.certificateTypeId.toString());
        if (cert.issueDate) {
          formData.append(`Certificates[${index}].IssueDate`, cert.issueDate);
        }
        if (cert.expiryDate) {
          formData.append(`Certificates[${index}].ExpiryDate`, cert.expiryDate);
        }
        if (cert.certificateFile) {
          formData.append(`Certificates[${index}].Certificate`, cert.certificateFile);
        }
      });
    }
    
    if (data.education && data.education.length > 0) {
      data.education.forEach((edu, index) => {
        formData.append(`Educations[${index}].TutorId`, '1');
        formData.append(`Educations[${index}].InstitutionId`, edu.institutionId.toString());
        if (edu.issueDate) {
          formData.append(`Educations[${index}].IssueDate`, edu.issueDate);
        }
        if (edu.degreeFile) {
          formData.append(`Educations[${index}].CertificateEducation`, edu.degreeFile);
        }
      });
    }
    
    if (data.schedule) {
      formData.append('Availabilities.TutorId', '1');
      
      const recurringSchedules: any[] = [];
      Object.entries(data.schedule).forEach(([dayOfWeek, slotIds]) => {
        if (slotIds && slotIds.length > 0) {
          const dayOfWeekNumber = getDayOfWeekNumber(dayOfWeek);
          if (dayOfWeekNumber !== -1) {
            recurringSchedules.push({
              startDate: new Date().toISOString(),
              daySlots: [{
                dayOfWeek: dayOfWeekNumber,
                slotIds: slotIds.map(id => parseInt(id))
              }]
            });
          }
        }
      });
      
      recurringSchedules.forEach((schedule, index) => {
        formData.append(`Availabilities.RecurringSchedule[${index}].StartDate`, schedule.startDate);
        schedule.daySlots.forEach((daySlot: any, dayIndex: number) => {
          formData.append(`Availabilities.RecurringSchedule[${index}].DaySlots[${dayIndex}].DayOfWeek`, daySlot.dayOfWeek.toString());
          daySlot.slotIds.forEach((slotId: number, slotIndex: number) => {
            formData.append(`Availabilities.RecurringSchedule[${index}].DaySlots[${dayIndex}].SlotIds[${slotIndex}]`, slotId.toString());
          });
        });
      });
    }
    
    return apiClient.post<BecomeTutorResponse>(
      API_ENDPOINTS.TUTORS.BECOME_TUTOR, 
      formData,
      { 'Content-Type': 'multipart/form-data' }
    );
  }
}