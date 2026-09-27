/** The normalized error envelope. UI code never touches AxiosError (§A6.2 #2). */
export type ApiError = {
  code: string;
  message: string;
  status: number;
  details?: unknown;
};

export type TokenPair = {
  accessToken: string;
  /** Present when the server issues or rotates the refresh token. */
  refreshToken?: string;
};

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as ApiError).code === 'string' &&
    typeof (value as ApiError).message === 'string' &&
    typeof (value as ApiError).status === 'number'
  );
}
