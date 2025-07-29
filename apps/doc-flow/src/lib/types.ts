export type ApiResponse<T> = {
  error: string[] | null | string;
  status: number;
  data: T | null;
  success: boolean;
};
