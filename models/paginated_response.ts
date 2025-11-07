export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  per_page: number;
  total: number;
  next_page_url: string | null;
  prev_page_url: string | null;
}