
import { format, formatDistance, formatRelative, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

export class FormatService {
  static formatDate(date: Date | string, formatStr = 'dd/MM/yyyy'): string {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return format(dateObj, formatStr, { locale: vi });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
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
      return `${amount.toLocaleString('vi-VN')} ${currency}`;
    }
  }

  static formatNumber(number: number): string {
    try {
      return new Intl.NumberFormat('vi-VN').format(number);
    } catch (error) {
      console.error('Number formatting error:', error);
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
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
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
