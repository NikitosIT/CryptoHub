export function getErrorMessage(error: unknown, fallback = 'An error occurred.') {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  return fallback;
}

export function parseError(data: unknown): {
  message: string;
  remainingAttempts?: number;
} {
  if (typeof data === 'object' && data !== null) {
    const d = data as Record<string, unknown>;
    return {
      message: typeof d.error === 'string' ? d.error : 'Request failed',
      remainingAttempts:
        typeof d.remainingAttempts === 'number' ? d.remainingAttempts : undefined,
    };
  }

  return { message: 'Request failed' };
}
