import jwt from 'jsonwebtoken';
import { Role } from '../entities/Role';

export interface JwtPayload {
  userId: string;
  role: Role;
}

export function sign(payload: JwtPayload, secret: string, expiresIn: string = '1h'): string {
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}

export function verify(token: string, secret: string): JwtPayload {
  const decoded = jwt.verify(token, secret) as JwtPayload & { iat: number; exp: number };
  return {
    userId: decoded.userId,
    role: decoded.role
  };
}
