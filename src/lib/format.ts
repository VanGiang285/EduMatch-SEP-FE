import { format, formatDistance, formatRelative, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
export class FormatService {
  static formatDate(date: Date | string, formatStr = 'dd/MM/yyyy'): string {
    try {
      let dateObj: Date;
      if (typeof date === 'string') {
        // Parse ISO string - parseISO handles timezone correctly
        // If string has 'Z' or timezone offset, it's UTC or has timezone
        // If no timezone info, assume it's UTC from server (common case)
        if (date.endsWith('Z')) {
          // Explicitly UTC
          dateObj = parseISO(date);
        } else if (date.includes('+') || (date.includes('-') && date.match(/[+-]\d{2}:\d{2}$/))) {
          // Has timezone offset
          dateObj = parseISO(date);
        } else if (date.includes('T')) {
          // ISO format without timezone - assume UTC from server
          dateObj = parseISO(date + 'Z');
        } else {
          // Just date string, parse normally
          dateObj = parseISO(date);
        }
      } else {
        dateObj = date;
      }
      // format() will automatically convert to local timezone for display
      return format(dateObj, formatStr, { locale: vi });
    } catch (error) {
      console.error('Date formatting error:', error, 'Input:', date);
      // Fallback: try direct Date parsing
      try {
        const fallbackDate = typeof date === 'string' ? new Date(date) : date;
        return format(fallbackDate, formatStr, { locale: vi });
      } catch (fallbackError) {
        return 'Invalid date';
      }
    }
  }
  static formatDateTime(date: Date | string): string {
    return this.formatDate(date, 'dd/MM/yyyy HH:mm');
  }
  static formatTime(date: Date | string): string {
    return this.formatDate(date, 'HH:mm');
  }
  static formatRelativeTime(date: Date | string): string {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return formatRelative(dateObj, new Date(), { locale: vi });
    } catch (error) {
      console.error('Relative time formatting error:', error);
      return 'Invalid date';
    }
  }
  static formatDistanceTime(date: Date | string): string {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return formatDistance(dateObj, new Date(), { 
        addSuffix: true, 
        locale: vi 
      });
    } catch (error) {
      console.error('Distance time formatting error:', error);
      return 'Invalid date';
    }
  }
  static formatCurrency(amount: number, currency = 'VND'): string {
    try {
      if (currency === 'VND') {
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(amount);
      }
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: currency,
      }).format(amount);
    } catch (error) {
      console.error('Currency formatting error:', error);
      if (amount == null || isNaN(amount)) {
        return `0 ${currency}`;
      }
      return `${amount.toLocaleString('vi-VN')} ${currency}`;
    }
  }
  static formatVND(amount: number): string {
    try {
      if (amount == null || isNaN(amount)) {
        return '0₫';
      }
      return `${amount.toLocaleString('vi-VN')}₫`;
    } catch (error) {
      console.error('VND formatting error:', error);
      return '0₫';
    }
  }
  static formatVNDWithUnit(amount: number, unit = 'giờ'): string {
    try {
      if (amount == null || isNaN(amount)) {
        return `0₫/${unit}`;
      }
      return `${amount.toLocaleString('vi-VN')}₫/${unit}`;
    } catch (error) {
      console.error('VND with unit formatting error:', error);
      return `0₫/${unit}`;
    }
  }
  static formatNumber(number: number): string {
    try {
      if (number == null || isNaN(number)) {
        return '0';
      }
      return new Intl.NumberFormat('vi-VN').format(number);
    } catch (error) {
      console.error('Number formatting error:', error);
      if (number == null || isNaN(number)) {
        return '0';
      }
      return number.toString();
    }
  }
  static capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
  static capitalizeWords(text: string): string {
    return text.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }
  static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
  static slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  static formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('84')) {
      return `+84 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    } else if (cleaned.startsWith('0')) {
      return `0${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    return phone;
  }
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  static formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} phút`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} giờ`;
    }
    return `${hours} giờ ${remainingMinutes} phút`;
  }
  static formatRating(rating: number): string {
    return rating.toFixed(1);
  }
  static formatRatingStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    return '★'.repeat(fullStars) + 
           (hasHalfStar ? '☆' : '') + 
           '☆'.repeat(emptyStars);
  }
  static formatPercentage(value: number, decimals = 1): string {
    return `${(value * 100).toFixed(decimals)}%`;
  }
  static formatUrl(url: string): string {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  }
  static maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) return email;
    const maskedLocal = localPart.charAt(0) + '*'.repeat(localPart.length - 2) + localPart.charAt(localPart.length - 1);
    return `${maskedLocal}@${domain}`;
  }
  static maskPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 6) return phone;
    const start = cleaned.slice(0, 3);
    const end = cleaned.slice(-3);
    const middle = '*'.repeat(cleaned.length - 6);
    return `${start}${middle}${end}`;
  }
}
