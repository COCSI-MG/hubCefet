export type ApiResponse<T> = {
  error: string;
  status: number;
  data: T;
  success: boolean;
};


export interface ExceptionResponseObject {
  statusCode: Number;
  error: string;
  message: string | string[]
}
