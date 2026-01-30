/**
 * Utility functions for course management
 */

/**
 * Validate course title
 */
export const validateCourseTitle = (title: string): string | null => {
  if (!title || title.trim().length === 0) {
    return 'Title is required';
  }
  if (title.length < 3) {
    return 'Title must be at least 3 characters';
  }
  if (title.length > 200) {
    return 'Title must be less than 200 characters';
  }
  return null;
};

/**
 * Validate course description
 */
export const validateDescription = (description: string, required: boolean = true): string | null => {
  if (required && (!description || description.trim().length === 0)) {
    return 'Description is required';
  }
  if (description && description.length > 5000) {
    return 'Description must be less than 5000 characters';
  }
  return null;
};

/**
 * Format date to readable string
 */
export const formatDate = (dateString?: string, defaultText: string = 'Not set'): string => {
  if (!dateString) return defaultText;
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return defaultText;
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format duration in minutes to readable format
 */
export const formatDuration = (minutes?: number): string => {
  if (!minutes || minutes <= 0) return '0 min';
  
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
};

/**
 * Generate slug from title
 */
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Calculate total lessons in course
 */
export const calculateTotalLessons = (modules: any[]): number => {
  return modules.reduce((total, module) => {
    return total + (module.lessons?.length || 0);
  }, 0);
};

/**
 * Calculate total duration of course
 */
export const calculateTotalDuration = (modules: any[]): number => {
  return modules.reduce((total, module) => {
    const moduleDuration = module.duration || 0;
    return total + moduleDuration;
  }, 0);
};

/**
 * Check if course is ready to publish
 */
export const canPublishCourse = (course: any): { canPublish: boolean; reasons: string[] } => {
  const reasons: string[] = [];
  
  if (!course.title || course.title.trim().length === 0) {
    reasons.push('Course title is required');
  }
  
  if (!course.description || course.description.trim().length === 0) {
    reasons.push('Course description is required');
  }
  
  if (!course.modules || course.modules.length === 0) {
    reasons.push('At least one module is required');
  } else {
    const hasLessons = course.modules.some((m: any) => m.lessons && m.lessons.length > 0);
    if (!hasLessons) {
      reasons.push('At least one lesson is required');
    }
  }
  
  return {
    canPublish: reasons.length === 0,
    reasons
  };
};

/**
 * Sort modules by order index
 */
export const sortModules = (modules: any[]): any[] => {
  return [...modules].sort((a, b) => {
    const orderA = a.orderIndex ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.orderIndex ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });
};

/**
 * Sort lessons by order index
 */
export const sortLessons = (lessons: any[]): any[] => {
  return [...lessons].sort((a, b) => {
    const orderA = a.orderIndex ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.orderIndex ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });
};

/**
 * Get course status color
 */
export const getStatusColor = (status: string): string => {
  switch (status.toUpperCase()) {
    case 'PUBLISHED':
      return '#10b981'; // green
    case 'DRAFT':
      return '#f59e0b'; // orange
    case 'ARCHIVED':
      return '#6b7280'; // gray
    default:
      return '#3b82f6'; // blue
  }
};

/**
 * Get lesson type icon
 */
export const getLessonTypeIcon = (type: string): string => {
  switch (type.toUpperCase()) {
    case 'VIDEO':
      return '🎥';
    case 'TEXT':
      return '📝';
    case 'QUIZ':
      return '❓';
    case 'CODING_EXERCISE':
      return '💻';
    case 'ASSIGNMENT':
      return '📋';
    default:
      return '📄';
  }
};

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate video file type
 */
export const isValidVideoFile = (file: File): boolean => {
  const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
  return validTypes.includes(file.type);
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};