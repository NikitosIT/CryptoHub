export type TwoFactorApiResponse = {
  success: boolean;
  message?: string;
  error?: Error;
};

export type TwoFactorPayload = {
  code: string;
  userId?: string | null;
};

export type IsVerifyForCS = {
  is_verified_for_current_session?: boolean;
};

export type TwoFactorStatusResponse = {
  enabled: boolean;
} & IsVerifyForCS;

export type EnableTwoFactorResponse = {
  qrUrl: string;
};

export type VerifyLogin2FA = {
  verified?: boolean;
  error?: string;
  remainingAttempts?: number;
} & IsVerifyForCS;
