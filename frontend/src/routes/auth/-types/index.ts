export interface TwoFactorApiResponse {
  success: boolean;
  message?: string;
  error?: Error;
}

export interface TwoFactorPayload {
  code: string;
  userId?: string | null;
}

export interface IsVerifyForCS {
  is_verified_for_current_session?: boolean;
}

export interface TwoFactorStatusResponse extends IsVerifyForCS {
  enabled: boolean;
}

export type EnableTwoFactorResponse = {
  qrUrl: string;
};

export interface VerifyLogin2FA extends IsVerifyForCS {
  verified?: boolean;
  error?: string;
  remainingAttempts?: number;
}
