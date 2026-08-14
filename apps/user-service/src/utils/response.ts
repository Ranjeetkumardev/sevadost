export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  statusCode: number;
  data?: T;
}

export const successResponse = <T = unknown>(
  message: string,
  data?: T,
): ApiResponse<T> => ({
  success: true,
  message,
  statusCode: 200,
  ...(data && { data }),
});

export const errorResponse = (
  message: string,
  statusCode: number = 500,
): ApiResponse => ({
  success: false,
  message,
  statusCode,
});
