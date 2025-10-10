
import { VALIDATION_RULES, VALIDATION_MESSAGES } from '@/constants/validation';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export class ValidationService {
  static validateEmail(email: string): string | null {
    if (!email) return VALIDATION_MESSAGES.USER.EMAIL_REQUIRED;
    if (!VALIDATION_RULES.USER.EMAIL.PATTERN.test(email)) {
      return VALIDATION_MESSAGES.USER.EMAIL_INVALID;
    }
    if (email.length > VALIDATION_RULES.USER.EMAIL.MAX_LENGTH) {
      return VALIDATION_MESSAGES.USER.EMAIL_TOO_LONG;
    }
    return null;
  }

  static validatePassword(password: string): string | null {
    if (!password) return VALIDATION_MESSAGES.USER.PASSWORD_REQUIRED;
    if (password.length < VALIDATION_RULES.USER.PASSWORD.MIN_LENGTH) {
      return VALIDATION_MESSAGES.USER.PASSWORD_TOO_SHORT;
    }
    if (password.length > VALIDATION_RULES.USER.PASSWORD.MAX_LENGTH) {
      return VALIDATION_MESSAGES.USER.PASSWORD_TOO_LONG;
    }
    if (!VALIDATION_RULES.USER.PASSWORD.PATTERN.test(password)) {
      return VALIDATION_MESSAGES.USER.PASSWORD_WEAK;
    }
    return null;
  }

  static validateName(name: string): string | null {
    if (!name) return VALIDATION_MESSAGES.USER.NAME_REQUIRED;
    if (name.length < VALIDATION_RULES.USER.NAME.MIN_LENGTH) {
      return VALIDATION_MESSAGES.USER.NAME_TOO_SHORT;
    }
    if (name.length > VALIDATION_RULES.USER.NAME.MAX_LENGTH) {
      return VALIDATION_MESSAGES.USER.NAME_TOO_LONG;
    }
    if (!VALIDATION_RULES.USER.NAME.PATTERN.test(name)) {
      return VALIDATION_MESSAGES.USER.NAME_INVALID;
    }
    return null;
  }

  static validatePhone(phone: string): string | null {
    if (!phone) return VALIDATION_MESSAGES.USER.PHONE_REQUIRED;
    if (!VALIDATION_RULES.USER.PHONE.PATTERN.test(phone)) {
      return VALIDATION_MESSAGES.USER.PHONE_INVALID;
    }
    return null;
  }

  static validateBio(bio: string): string | null {
    if (!bio) return VALIDATION_MESSAGES.TUTOR.BIO_REQUIRED;
    if (bio.length < VALIDATION_RULES.TUTOR.BIO.MIN_LENGTH) {
      return VALIDATION_MESSAGES.TUTOR.BIO_TOO_SHORT;
    }
    if (bio.length > VALIDATION_RULES.TUTOR.BIO.MAX_LENGTH) {
      return VALIDATION_MESSAGES.TUTOR.BIO_TOO_LONG;
    }
    return null;
  }

  static validateHourlyRate(rate: number): string | null {
    if (!rate) return VALIDATION_MESSAGES.TUTOR.HOURLY_RATE_REQUIRED;
    if (rate < VALIDATION_RULES.TUTOR.HOURLY_RATE.MIN) {
      return VALIDATION_MESSAGES.TUTOR.HOURLY_RATE_TOO_LOW;
    }
    if (rate > VALIDATION_RULES.TUTOR.HOURLY_RATE.MAX) {
      return VALIDATION_MESSAGES.TUTOR.HOURLY_RATE_TOO_HIGH;
    }
    return null;
  }

  static validateExperience(experience: number): string | null {
    if (experience < VALIDATION_RULES.TUTOR.EXPERIENCE.MIN) {
      return VALIDATION_MESSAGES.TUTOR.EXPERIENCE_INVALID;
    }
    if (experience > VALIDATION_RULES.TUTOR.EXPERIENCE.MAX) {
      return VALIDATION_MESSAGES.TUTOR.EXPERIENCE_INVALID;
    }
    return null;
  }

  static validateEducation(education: string): string | null {
    if (!education) return VALIDATION_MESSAGES.TUTOR.EDUCATION_REQUIRED;
    if (education.length < VALIDATION_RULES.TUTOR.EDUCATION.MIN_LENGTH) {
      return VALIDATION_MESSAGES.TUTOR.EDUCATION_TOO_SHORT;
    }
    if (education.length > VALIDATION_RULES.TUTOR.EDUCATION.MAX_LENGTH) {
      return VALIDATION_MESSAGES.TUTOR.EDUCATION_TOO_LONG;
    }
    return null;
  }

  static validateReviewComment(comment: string): string | null {
    if (!comment) return VALIDATION_MESSAGES.REVIEW.COMMENT_REQUIRED;
    if (comment.length < VALIDATION_RULES.REVIEW.COMMENT.MIN_LENGTH) {
      return VALIDATION_MESSAGES.REVIEW.COMMENT_TOO_SHORT;
    }
    if (comment.length > VALIDATION_RULES.REVIEW.COMMENT.MAX_LENGTH) {
      return VALIDATION_MESSAGES.REVIEW.COMMENT_TOO_LONG;
    }
    return null;
  }

  static validateRating(rating: number): string | null {
    if (!rating) return VALIDATION_MESSAGES.REVIEW.RATING_REQUIRED;
    if (rating < VALIDATION_RULES.REVIEW.RATING.MIN || rating > VALIDATION_RULES.REVIEW.RATING.MAX) {
      return VALIDATION_MESSAGES.REVIEW.RATING_INVALID;
    }
    return null;
  }

  static validateFile(file: File, maxSize: number, allowedTypes: string[]): string | null {
    if (file.size > maxSize) {
      return VALIDATION_MESSAGES.FILE.TOO_LARGE;
    }
    if (!allowedTypes.includes(file.type)) {
      return VALIDATION_MESSAGES.FILE.INVALID_TYPE;
    }
    return null;
  }

  static validateFormData(data: Record<string, any>, rules: Record<string, (value: any) => string | null>): ValidationResult {
    const errors: Record<string, string> = {};

    Object.entries(rules).forEach(([field, validator]) => {
      const error = validator(data[field]);
      if (error) {
        errors[field] = error;
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  static validatePasswordConfirmation(password: string, confirmPassword: string): string | null {
    if (password !== confirmPassword) {
      return VALIDATION_MESSAGES.USER.PASSWORD_MISMATCH;
    }
    return null;
  }

  static validateTermsAgreement(agreed: boolean): string | null {
    if (!agreed) {
      return VALIDATION_MESSAGES.FORM.TERMS_REQUIRED;
    }
    return null;
  }
}

export const VALIDATION_SCHEMAS = {
  LOGIN: {
    email: ValidationService.validateEmail,
    password: ValidationService.validatePassword,
  },
  
  REGISTER: {
    name: ValidationService.validateName,
    email: ValidationService.validateEmail,
    password: ValidationService.validatePassword,
    confirmPassword: (value: string, formData: any) => 
      ValidationService.validatePasswordConfirmation(formData.password, value),
    agreeTerms: ValidationService.validateTermsAgreement,
  },
  
  TUTOR_PROFILE: {
    subjects: (subjects: string[]) => 
      subjects.length === 0 ? VALIDATION_MESSAGES.TUTOR.SUBJECTS_REQUIRED : null,
    hourlyRate: ValidationService.validateHourlyRate,
    bio: ValidationService.validateBio,
    experience: ValidationService.validateExperience,
    education: ValidationService.validateEducation,
  },
  
  REVIEW: {
    rating: ValidationService.validateRating,
    comment: ValidationService.validateReviewComment,
  },
} as const;
