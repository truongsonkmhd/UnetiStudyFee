export interface CursorResponse<T> {
  items: T[];
  nextCursor?: string;
  hasNext: boolean;
}