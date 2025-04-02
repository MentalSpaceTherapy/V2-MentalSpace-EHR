import 'jsonwebtoken';

declare module 'jsonwebtoken' {
  export interface JwtPayload {
    id: number;
    username: string;
    role: string;
    iat?: number;
    exp?: number;
  }
} 