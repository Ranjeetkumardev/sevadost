export interface IServiceResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  errors?: string[];
}

export const successResponse = <T>(
  message: string,
  data?: T,
  statusCode = 200
): IServiceResponse<T> => ({
  success: true,
  statusCode,
  message,
  data,
});

export const errorResponse = (
  message: string,
  statusCode = 400,
  errors: string[] = []
): IServiceResponse => ({
  success: false,
  statusCode,
  message,
  errors,
});