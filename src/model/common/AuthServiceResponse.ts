export interface AuthServiceResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  errors?: Record<string, string>;
  status?: number;
}
