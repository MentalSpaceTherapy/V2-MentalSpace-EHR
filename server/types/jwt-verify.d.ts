declare module 'jwt-verify' {
  export interface ResetTokenPayload {
    userId: number;
    email: string;
    iat?: number;
    exp?: number;
  }

  export function verifyPasswordResetToken(token: string): ResetTokenPayload;
  export function generatePasswordResetToken(payload: Omit<ResetTokenPayload, 'iat' | 'exp'>): string;
} 