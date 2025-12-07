export type ApiResponse<T> = {
  error: string;
  status: number;
  data: T;
  success: boolean;
};
